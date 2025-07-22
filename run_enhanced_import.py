"""
Run enhanced drug label import with AI classification.

This script runs the enhanced drug label importer with AI classification.
"""

import sys
import os
import json
import argparse
from typing import Dict, Any

from enhanced_drug_importer import EnhancedDrugLabelImporter


def main():
    """Main function to run the enhanced import process."""
    parser = argparse.ArgumentParser(
        description='Import drug labels with AI classification',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s                                    # Use default files and settings
  %(prog)s -j data/drugs/Labels.json          # Specify custom JSON file
  %(prog)s -j data/drugs/mounjaro-d2d7da5.json -s drug_label_schema.yaml
  %(prog)s --mongo-uri mongodb://remote:27017/ --db-name production_drugs
  %(prog)s --disable-ai                       # Run without AI classification
        """
    )
    
    # File arguments
    parser.add_argument(
        '-j', '--json-file',
        default='data/drugs/Labels.json',
        help='Path to JSON file containing drug labels (default: data/drugs/Labels.json)'
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
    
    # AI options
    parser.add_argument(
        '--disable-ai',
        action='store_true',
        help='Disable AI classification'
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
    
    # Set environment variables for AI configuration
    if args.disable_ai:
        os.environ['ENABLE_AI_CLASSIFICATION'] = 'false'
    else:
        os.environ['ENABLE_AI_CLASSIFICATION'] = 'true'
    
    # Set logging level
    if args.verbose:
        os.environ['AI_LOG_LEVEL'] = 'DEBUG'
    
    # Handle dry run
    if args.dry_run:
        print("DRY RUN MODE - No database changes will be made")
        print(f"Would process: {args.json_file}")
        print(f"Using schema: {args.schema_file}")
        print(f"Target: {args.mongo_uri}{args.db_name}.{args.collection_name}")
        print(f"AI classification: {'disabled' if args.disable_ai else 'enabled'}")
        
        # Validate files exist
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
        print(f"AI classification: {'disabled' if args.disable_ai else 'enabled'}")
        print()
        
        # Initialize importer
        importer = EnhancedDrugLabelImporter(
            mongo_uri=args.mongo_uri,
            db_name=args.db_name,
            collection_name=args.collection_name
        )
        
        # Load schema
        if not importer.load_schema(args.schema_file):
            print(f"Failed to load schema from {args.schema_file}")
            return 1
        
        # Load JSON data
        try:
            with open(args.json_file, 'r', encoding='utf-8') as f:
                json_data = json.load(f)
            
            print(f"Loaded {len(json_data) if isinstance(json_data, list) else 1} documents from {args.json_file}")
            
        except FileNotFoundError:
            print(f"JSON file not found: {args.json_file}")
            return 1
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON file: {e}")
            return 1
        
        # Ensure we have a list of documents
        if not isinstance(json_data, list):
            json_data = [json_data]
        
        # Process documents
        stats = importer.process_documents(json_data)
        
        # Print final summary
        print("\n" + "="*50)
        print("IMPORT SUMMARY")
        print("="*50)
        print(f"Documents inserted: {stats['inserted']}")
        print(f"Documents updated: {stats['updated']}")
        print(f"Documents skipped (no changes): {stats['skipped']}")
        print(f"Documents failed: {stats['failed']}")
        print(f"Documents AI enhanced: {stats.get('ai_enhanced', 0)}")
        print(f"Documents AI failed: {stats.get('ai_failed', 0)}")
        
        if stats.get('validation_errors'):
            print(f"\nValidation errors ({len(stats['validation_errors'])}):")
            for error in stats['validation_errors'][:5]:  # Show first 5 errors
                print(f"  - {error}")
            if len(stats['validation_errors']) > 5:
                print(f"  ... and {len(stats['validation_errors']) - 5} more errors")
        
        print("="*50)
        
        # Close connections
        importer.close()
        
        # Return appropriate exit code
        return 0 if stats['failed'] == 0 else 1
        
    except Exception as e:
        print(f"Import failed: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())