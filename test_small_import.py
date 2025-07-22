"""
Test enhanced drug label import with a small sample.
"""

import json
from enhanced_drug_importer import EnhancedDrugLabelImporter


def main():
    """Run a small test import."""
    # Create a sample drug document
    sample_drug = {
        'drugName': 'Test Drug',
        'setId': 'test-123',
        'slug': 'test-drug-123',
        'label': {
            'genericName': 'test-generic',
            'indicationsAndUsage': 'This drug is indicated for testing purposes.',
            'mechanismOfAction': 'This drug works by testing mechanisms.',
            'description': 'Test drug description.'
        }
    }
    
    # Initialize importer
    importer = EnhancedDrugLabelImporter(
        mongo_uri='mongodb://localhost:27017/',
        db_name='drug_facts_test',
        collection_name='drugs_test'
    )
    
    # Load schema
    schema_file = 'drug_label_schema.yaml'
    if not importer.load_schema(schema_file):
        print(f"Failed to load schema from {schema_file}")
        return
    
    # Process document
    print("Processing sample drug document...")
    stats = importer.process_documents([sample_drug])
    
    # Print summary
    print("\nIMPORT SUMMARY")
    print("="*50)
    print(f"Documents inserted: {stats['inserted']}")
    print(f"Documents updated: {stats['updated']}")
    print(f"Documents skipped (no changes): {stats['skipped']}")
    print(f"Documents failed: {stats['failed']}")
    print(f"Documents AI enhanced: {stats.get('ai_enhanced', 0)}")
    print(f"Documents AI failed: {stats.get('ai_failed', 0)}")
    
    if stats.get('validation_errors'):
        print(f"\nValidation errors ({len(stats['validation_errors'])}):")
        for error in stats['validation_errors']:
            print(f"  - {error}")
    
    # Close connections
    importer.close()


if __name__ == "__main__":
    main()