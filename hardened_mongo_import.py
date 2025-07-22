import json
import yaml
import hashlib
import argparse
import os
import re
import requests
from typing import Dict, List, Any, Optional, Tuple
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError, BulkWriteError
from jsonschema import validate, ValidationError
import logging
from datetime import datetime

class DrugLabelImporter:
    def __init__(self, mongo_uri: str = 'mongodb://localhost:27017/', 
                 db_name: str = 'drug_facts', collection_name: str = 'drugs'):
        """
        Initialize the drug label importer with MongoDB connection and schema validation.
        
        Args:
            mongo_uri: MongoDB connection string
            db_name: Database name
            collection_name: Collection name
        """
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]
        self.schema = None
        self.logger = self._setup_logging()
        
        # Cache for SPL link IDs to avoid repeated API calls
        self.spl_link_cache = {}
        
        # Create unique index on slug field if it doesn't exist
        self._ensure_indexes()
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging configuration."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        return logging.getLogger(__name__)
    
    def _ensure_indexes(self):
        """Ensure required indexes exist on the collection."""
        try:
            # Create unique index on slug field
            self.collection.create_index("slug", unique=True)
            self.logger.info("Ensured unique index on 'slug' field")
        except Exception as e:
            self.logger.warning(f"Index creation failed or already exists: {e}")
    
    def load_schema(self, schema_file: str) -> bool:
        """
        Load and validate the YAML schema file.
        
        Args:
            schema_file: Path to the drug_label_schema.yaml file
            
        Returns:
            bool: True if schema loaded successfully, False otherwise
        """
        try:
            with open(schema_file, 'r') as f:
                self.schema = yaml.safe_load(f)
            self.logger.info(f"Schema loaded successfully from {schema_file}")
            return True
        except FileNotFoundError:
            self.logger.error(f"Schema file not found: {schema_file}")
            return False
        except yaml.YAMLError as e:
            self.logger.error(f"Error parsing YAML schema: {e}")
            return False
    
    def validate_document(self, document: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Validate a document against the loaded schema.
        
        Args:
            document: Document to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not self.schema:
            return False, "No schema loaded"
        
        try:
            # Validate against the items schema (single document)
            if 'items' in self.schema:
                validate(instance=document, schema=self.schema['items'])
            else:
                validate(instance=document, schema=self.schema)
            return True, None
        except ValidationError as e:
            return False, f"Validation error: {e.message}"
    
    def _calculate_document_hash(self, document: Dict[str, Any]) -> str:
        """
        Calculate a hash of the document content for comparison.
        
        Args:
            document: Document to hash
            
        Returns:
            str: SHA-256 hash of the document
        """
        # Create a copy without metadata fields that shouldn't affect comparison
        doc_copy = document.copy()
        doc_copy.pop('_id', None)
        doc_copy.pop('_hash', None)
        doc_copy.pop('_created_at', None)
        doc_copy.pop('_updated_at', None)
        
        # Sort keys for consistent hashing
        doc_json = json.dumps(doc_copy, sort_keys=True, default=str)
        return hashlib.sha256(doc_json.encode()).hexdigest()
    
    def _document_needs_update(self, new_doc: Dict[str, Any], existing_doc: Dict[str, Any]) -> bool:
        """
        Check if a document needs to be updated by comparing hashes.
        
        Args:
            new_doc: New document data
            existing_doc: Existing document from database
            
        Returns:
            bool: True if update is needed, False otherwise
        """
        new_hash = self._calculate_document_hash(new_doc)
        existing_hash = existing_doc.get('_hash', '')
        
        return new_hash != existing_hash
    
    def _prepare_document_for_upsert(self, document: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
        """
        Prepare document with metadata for upsert operation.
        
        Args:
            document: Original document
            is_update: Whether this is an update operation
            
        Returns:
            Dict: Document with added metadata
        """
        prepared_doc = document.copy()
        current_time = datetime.utcnow()
        
        # Add hash for change detection
        prepared_doc['_hash'] = self._calculate_document_hash(document)
        
        if is_update:
            prepared_doc['_updated_at'] = current_time
        else:
            prepared_doc['_created_at'] = current_time
            prepared_doc['_updated_at'] = current_time
        
        return prepared_doc
    
    def _fetch_spl_link_id(self, drug_name: str) -> Optional[str]:
        """
        Fetch SPL link ID from FDA API for a given drug name.
        
        Args:
            drug_name: Name of the drug to search for
            
        Returns:
            Optional[str]: SPL link ID if found, None otherwise
        """
        # Check cache first
        if drug_name in self.spl_link_cache:
            return self.spl_link_cache[drug_name]
        
        try:
            url = "https://api.fda.gov/drug/labelsearch.json"
            encoded_drug_name = quote(drug_name)
            querystring = {
                "search": f"product_name:{encoded_drug_name}",
                "limit": "1000"
            }
            headers = {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9"
            }
            
            self.logger.info(f"Fetching SPL link ID for drug: {drug_name}")
            response = requests.get(url, headers=headers, params=querystring, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if 'results' in data and len(data['results']) > 0:
                first_result = data['results'][0]
                spl_link_id = first_result.get('spl_link_id')
                
                if spl_link_id:
                    # Cache the result
                    self.spl_link_cache[drug_name] = spl_link_id
                    self.logger.info(f"Found SPL link ID for {drug_name}: {spl_link_id}")
                    return spl_link_id
                else:
                    self.logger.warning(f"No SPL link ID found in FDA API response for: {drug_name}")
            else:
                self.logger.warning(f"No results found in FDA API for drug: {drug_name}")
                
        except requests.exceptions.RequestException as e:
            self.logger.warning(f"FDA API request failed for {drug_name}: {e}")
        except (KeyError, ValueError) as e:
            self.logger.warning(f"Error parsing FDA API response for {drug_name}: {e}")
        except Exception as e:
            self.logger.warning(f"Unexpected error fetching SPL link ID for {drug_name}: {e}")
        
        # Cache negative result to avoid repeated API calls
        self.spl_link_cache[drug_name] = None
        return None
    
    def _update_img_tags(self, html_content: str, spl_link_id: str) -> str:
        """
        Update img tags in HTML content to use FDA URLs.
        
        Args:
            html_content: HTML content containing img tags
            spl_link_id: SPL link ID from FDA API
            
        Returns:
            str: Updated HTML content with FDA URLs
        """
        if not html_content or not spl_link_id:
            return html_content
        
        # Pattern to match img tags with src attributes
        img_pattern = r'<img([^>]*?)src=["\']([^"\']*?)["\']([^>]*?)/?>'
        
        def replace_img_src(match):
            before_src = match.group(1)
            src_value = match.group(2)
            after_src = match.group(3)
            
            # Skip if already a full URL
            if src_value.startswith(('http://', 'https://', '//')):
                return match.group(0)
            
            # Create FDA URL
            fda_url = f"https://www.accessdata.fda.gov/spl/data/{spl_link_id}/{src_value}"
            
            # Reconstruct the img tag
            return f'<img{before_src}src="{fda_url}"{after_src}/>'
        
        updated_content = re.sub(img_pattern, replace_img_src, html_content, flags=re.IGNORECASE)
        
        # Count how many images were updated
        original_count = len(re.findall(img_pattern, html_content, flags=re.IGNORECASE))
        if original_count > 0:
            self.logger.debug(f"Updated {original_count} img tags with SPL link ID: {spl_link_id}")
        
        return updated_content
    
    def _transform_image_urls(self, document: Dict[str, Any], spl_link_id: str) -> Dict[str, Any]:
        """
        Recursively transform image URLs in all string fields of a document.
        
        Args:
            document: Document to transform
            spl_link_id: SPL link ID from FDA API
            
        Returns:
            Dict: Document with transformed image URLs
        """
        if not spl_link_id:
            return document
        
        def transform_value(value):
            if isinstance(value, str):
                # Check if the string contains img tags
                if '<img' in value.lower():
                    return self._update_img_tags(value, spl_link_id)
                return value
            elif isinstance(value, dict):
                return {k: transform_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [transform_value(item) for item in value]
            else:
                return value
        
        return transform_value(document)
    
    def process_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Process a list of documents with validation, deduplication, and upsert logic.
        
        Args:
            documents: List of documents to process
            
        Returns:
            Dict with counts of inserted, updated, skipped, and failed documents
        """
        stats = {
            'inserted': 0,
            'updated': 0,
            'skipped': 0,
            'failed': 0,
            'validation_errors': []
        }
        
        self.logger.info(f"Processing {len(documents)} documents...")
        
        for i, document in enumerate(documents):
            try:
                # Extract drug name and fetch SPL link ID
                drug_name = document.get('drugName')
                if drug_name:
                    spl_link_id = self._fetch_spl_link_id(drug_name)
                    if spl_link_id:
                        # Transform image URLs in the document
                        document = self._transform_image_urls(document, spl_link_id)
                else:
                    self.logger.warning(f"Document {i+1} missing 'drugName' field, skipping FDA image URL transformation")
                
                # Validate document structure
                is_valid, error_msg = self.validate_document(document)
                if not is_valid:
                    self.logger.error(f"Document {i+1} validation failed: {error_msg}")
                    stats['failed'] += 1
                    stats['validation_errors'].append(f"Document {i+1}: {error_msg}")
                    continue
                
                # Check for required slug field
                if 'slug' not in document:
                    self.logger.error(f"Document {i+1} missing required 'slug' field")
                    stats['failed'] += 1
                    continue
                
                slug = document['slug']
                
                # Check if document already exists
                existing_doc = self.collection.find_one({'slug': slug})
                
                if existing_doc:
                    # Document exists, check if update is needed
                    if self._document_needs_update(document, existing_doc):
                        # Update the document
                        prepared_doc = self._prepare_document_for_upsert(document, is_update=True)
                        
                        result = self.collection.update_one(
                            {'slug': slug},
                            {'$set': prepared_doc}
                        )
                        
                        if result.modified_count > 0:
                            self.logger.info(f"Updated document with slug: {slug}")
                            stats['updated'] += 1
                        else:
                            self.logger.warning(f"Update failed for slug: {slug}")
                            stats['failed'] += 1
                    else:
                        # Document is identical, skip
                        self.logger.info(f"Skipping identical document with slug: {slug}")
                        stats['skipped'] += 1
                else:
                    # New document, insert it
                    prepared_doc = self._prepare_document_for_upsert(document, is_update=False)
                    
                    try:
                        self.collection.insert_one(prepared_doc)
                        self.logger.info(f"Inserted new document with slug: {slug}")
                        stats['inserted'] += 1
                    except DuplicateKeyError:
                        # Handle race condition where document was inserted between check and insert
                        self.logger.warning(f"Duplicate key error for slug: {slug}, attempting update")
                        existing_doc = self.collection.find_one({'slug': slug})
                        if existing_doc and self._document_needs_update(document, existing_doc):
                            prepared_doc = self._prepare_document_for_upsert(document, is_update=True)
                            self.collection.update_one({'slug': slug}, {'$set': prepared_doc})
                            stats['updated'] += 1
                        else:
                            stats['skipped'] += 1
                            
            except Exception as e:
                self.logger.error(f"Error processing document {i+1}: {e}")
                stats['failed'] += 1
        
        return stats
    
    def import_from_file(self, json_file: str, schema_file: str) -> Dict[str, int]:
        """
        Import drug labels from JSON file with schema validation.
        
        Args:
            json_file: Path to the Labels.json file
            schema_file: Path to the drug_label_schema.yaml file
            
        Returns:
            Dict with import statistics
        """
        # Load schema
        if not self.load_schema(schema_file):
            raise ValueError(f"Failed to load schema from {schema_file}")
        
        # Load JSON data
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            self.logger.info(f"Loaded {len(json_data) if isinstance(json_data, list) else 1} documents from {json_file}")
            
        except FileNotFoundError:
            raise FileNotFoundError(f"JSON file not found: {json_file}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Error parsing JSON file: {e}")
        
        # Ensure we have a list of documents
        if not isinstance(json_data, list):
            json_data = [json_data]
        
        # Process documents
        stats = self.process_documents(json_data)
        
        # Log summary
        self.logger.info("Import completed!")
        self.logger.info(f"Inserted: {stats['inserted']}")
        self.logger.info(f"Updated: {stats['updated']}")
        self.logger.info(f"Skipped (identical): {stats['skipped']}")
        self.logger.info(f"Failed: {stats['failed']}")
        
        if stats['validation_errors']:
            self.logger.error("Validation errors:")
            for error in stats['validation_errors']:
                self.logger.error(f"  - {error}")
        
        return stats
    
    def close(self):
        """Close the MongoDB connection."""
        self.client.close()
        self.logger.info("MongoDB connection closed")


def import_drug_labels(json_file: str = 'Labels.json', 
                      schema_file: str = 'drug_label_schema.yaml',
                      mongo_uri: str = 'mongodb://localhost:27017/',
                      db_name: str = 'drug_facts',
                      collection_name: str = 'drugs') -> Dict[str, int]:
    """
    Convenient function to import drug labels with configurable parameters.
    
    Args:
        json_file: Path to the JSON file containing drug labels
        schema_file: Path to the YAML schema file
        mongo_uri: MongoDB connection string
        db_name: Database name
        collection_name: Collection name
        
    Returns:
        Dict with import statistics
        
    Raises:
        FileNotFoundError: If files are not found
        ValueError: If schema or JSON parsing fails
        Exception: For other import errors
    """
    importer = DrugLabelImporter(mongo_uri, db_name, collection_name)
    
    try:
        stats = importer.import_from_file(json_file, schema_file)
        return stats
    finally:
        importer.close()


def main():
    """Main function to run the import process with CLI arguments."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Import drug labels from JSON to MongoDB with validation and deduplication',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                    # Use default files and settings
  %(prog)s -j data/labels.json               # Specify custom JSON file
  %(prog)s -j labels.json -s schema.yaml     # Custom JSON and schema files
  %(prog)s --mongo-uri mongodb://remote:27017/ --db-name production_drugs
  
Files:
  Default JSON file: Labels.json
  Default schema file: drug_label_schema.yaml
        """
    )
    
    # File arguments
    parser.add_argument(
        '-j', '--json-file',
        default='Labels.json',
        help='Path to JSON file containing drug labels (default: Labels.json)'
    )
    
    parser.add_argument(
        '-s', '--schema-file',
        default='drug_label_schema.yaml',
        help='Path to YAML schema file (default: drug_label_schema.yaml)'
    )
    
    # MongoDB arguments
    parser.add_argument(
        '--mongo-uri',
        default='mongodb://localhost:27017/',
        help='MongoDB connection URI (default: mongodb://localhost:27017/)'
    )
    
    parser.add_argument(
        '--db-name',
        default='drug_facts',
        help='Database name (default: drug_facts)'
    )
    
    parser.add_argument(
        '--collection-name',
        default='drugs',
        help='Collection name (default: drugs)'
    )
    
    # Options
    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate and process without making database changes'
    )
    
    args = parser.parse_args()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Handle dry run
    if args.dry_run:
        print("DRY RUN MODE - No database changes will be made")
        print(f"Would process: {args.json_file}")
        print(f"Using schema: {args.schema_file}")
        print(f"Target: {args.mongo_uri}{args.db_name}.{args.collection_name}")
        
        # Validate files exist
        import os
        if not os.path.exists(args.json_file):
            print(f"ERROR: JSON file not found: {args.json_file}")
            return 1
        if not os.path.exists(args.schema_file):
            print(f"ERROR: Schema file not found: {args.schema_file}")
            return 1
        
        print("Files exist and would be processed.")
        return 0
    
    try:
        print(f"Importing drug labels from: {args.json_file}")
        print(f"Using schema: {args.schema_file}")
        print(f"Target database: {args.mongo_uri}{args.db_name}.{args.collection_name}")
        print()
        
        # Import the labels
        stats = import_drug_labels(
            json_file=args.json_file,
            schema_file=args.schema_file,
            mongo_uri=args.mongo_uri,
            db_name=args.db_name,
            collection_name=args.collection_name
        )
        
        # Print final summary
        print("\n" + "="*50)
        print("IMPORT SUMMARY")
        print("="*50)
        print(f"Documents inserted: {stats['inserted']}")
        print(f"Documents updated: {stats['updated']}")
        print(f"Documents skipped (no changes): {stats['skipped']}")
        print(f"Documents failed: {stats['failed']}")
        
        if stats['validation_errors']:
            print(f"\nValidation errors ({len(stats['validation_errors'])}):")
            for error in stats['validation_errors'][:5]:  # Show first 5 errors
                print(f"  - {error}")
            if len(stats['validation_errors']) > 5:
                print(f"  ... and {len(stats['validation_errors']) - 5} more errors")
        
        print("="*50)
        
        # Return appropriate exit code
        return 0 if stats['failed'] == 0 else 1
        
    except FileNotFoundError as e:
        print(f"File not found: {e}")
        return 1
    except ValueError as e:
        print(f"Validation error: {e}")
        return 1
    except Exception as e:
        print(f"Import failed: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())

