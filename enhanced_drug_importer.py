"""
Enhanced Drug Label Importer with AI classification.

This module extends the existing DrugLabelImporter with AI-powered
therapeutic classification capabilities.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from hardened_mongo_import import DrugLabelImporter
from ai_classification.drug_classifier import DrugClassifier
from ai_classification.config import is_ai_enabled
from ai_classification.logging_config import setup_logging

logger = setup_logging(__name__)


class EnhancedDrugLabelImporter(DrugLabelImporter):
    """Enhanced Drug Label Importer with AI classification."""
    
    def __init__(self, mongo_uri: str = 'mongodb://localhost:27017/',
                 db_name: str = 'drug_facts', collection_name: str = 'drugs'):
        """
        Initialize the enhanced drug label importer.
        
        Args:
            mongo_uri: MongoDB connection string
            db_name: Database name
            collection_name: Collection name
        """
        # Initialize base class
        super().__init__(mongo_uri, db_name, collection_name)
        
        # Initialize drug classifier
        self.drug_classifier = DrugClassifier()
        
        logger.info("Initialized enhanced drug label importer")
        
        # Log AI classification status
        if is_ai_enabled():
            logger.info("AI classification is enabled")
        else:
            logger.info("AI classification is disabled")
    
    def process_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Process a list of documents with AI classification enhancement.
        
        Args:
            documents: List of documents to process
            
        Returns:
            Dict with counts of inserted, updated, skipped, and failed documents
        """
        # Initialize stats with AI-specific counters
        stats = {
            'inserted': 0,
            'updated': 0,
            'skipped': 0,
            'failed': 0,
            'validation_errors': [],
            'ai_enhanced': 0,
            'ai_failed': 0
        }
        
        logger.info(f"Processing {len(documents)} documents with AI enhancement...")
        
        for i, document in enumerate(documents):
            try:
                # Apply AI classification if enabled
                if is_ai_enabled():
                    try:
                        # Get AI classification
                        classification_result = self.drug_classifier.classify_drug(document)
                        
                        # Enhance document with classification
                        document = self._enhance_document_with_classification(document, classification_result)
                        
                        stats['ai_enhanced'] += 1
                        logger.info(f"Enhanced document {i+1} with AI classification")
                        
                    except Exception as e:
                        stats['ai_failed'] += 1
                        logger.error(f"AI classification failed for document {i+1}: {e}")
                        # Continue with base document
                
                # Process document with base implementation
                result = self._process_single_document(document, i)
                
                # Update stats
                if result == 'inserted':
                    stats['inserted'] += 1
                elif result == 'updated':
                    stats['updated'] += 1
                elif result == 'skipped':
                    stats['skipped'] += 1
                elif result == 'failed':
                    stats['failed'] += 1
                elif result.startswith('validation_error:'):
                    stats['failed'] += 1
                    stats['validation_errors'].append(result[17:])  # Remove 'validation_error: ' prefix
                
            except Exception as e:
                logger.error(f"Error processing document {i+1}: {e}")
                stats['failed'] += 1
        
        # Log summary
        logger.info("Processing completed!")
        logger.info(f"Inserted: {stats['inserted']}")
        logger.info(f"Updated: {stats['updated']}")
        logger.info(f"Skipped (identical): {stats['skipped']}")
        logger.info(f"Failed: {stats['failed']}")
        logger.info(f"AI enhanced: {stats['ai_enhanced']}")
        logger.info(f"AI failed: {stats['ai_failed']}")
        
        if stats['validation_errors']:
            logger.error("Validation errors:")
            for error in stats['validation_errors']:
                logger.error(f"  - {error}")
        
        return stats
    
    def _process_single_document(self, document: Dict[str, Any], index: int) -> str:
        """
        Process a single document.
        
        Args:
            document: Document to process
            index: Document index
            
        Returns:
            str: Result status ('inserted', 'updated', 'skipped', 'failed', or 'validation_error: <message>')
        """
        # Validate document structure
        is_valid, error_msg = self.validate_document(document)
        if not is_valid:
            logger.error(f"Document {index+1} validation failed: {error_msg}")
            return f"validation_error: Document {index+1}: {error_msg}"
        
        # Check for required slug field
        if 'slug' not in document:
            logger.error(f"Document {index+1} missing required 'slug' field")
            return 'failed'
        
        slug = document['slug']
        
        # Extract drug name and fetch SPL link ID
        drug_name = document.get('drugName')
        if drug_name:
            spl_link_id = self._fetch_spl_link_id(drug_name)
            if spl_link_id:
                # Transform image URLs in the document
                document = self._transform_image_urls(document, spl_link_id)
        else:
            logger.warning(f"Document {index+1} missing 'drugName' field, skipping FDA image URL transformation")
        
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
                    logger.info(f"Updated document with slug: {slug}")
                    return 'updated'
                else:
                    logger.warning(f"Update failed for slug: {slug}")
                    return 'failed'
            else:
                # Document is identical, skip
                logger.info(f"Skipping identical document with slug: {slug}")
                return 'skipped'
        else:
            # New document, insert it
            prepared_doc = self._prepare_document_for_upsert(document, is_update=False)
            
            try:
                self.collection.insert_one(prepared_doc)
                logger.info(f"Inserted new document with slug: {slug}")
                return 'inserted'
            except Exception as e:
                logger.error(f"Insert failed for slug: {slug}: {e}")
                return 'failed'
    
    def _enhance_document_with_classification(self, document: Dict[str, Any], 
                                             classification_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance document with AI classification.
        
        Args:
            document: Original document
            classification_result: Classification result
            
        Returns:
            Dict[str, Any]: Enhanced document
        """
        # Create a copy of the document
        enhanced_doc = document.copy()
        
        # Add therapeutic classification
        enhanced_doc['therapeuticClass'] = classification_result['classification']
        
        # Add AI processing metadata
        enhanced_doc['aiProcessingMetadata'] = {
            'processedAt': datetime.utcnow(),
            'modelUsed': classification_result.get('metadata', {}).get('model', 'unknown'),
            'confidence': classification_result['classification']['confidence_level'],
            'tokensUsed': classification_result.get('metadata', {}).get('tokens_used', 0),
            'processingTimeMs': classification_result.get('metadata', {}).get('processing_time', 0) * 1000,
            'cached': classification_result.get('cached', False)
        }
        
        return enhanced_doc