#!/usr/bin/env python3
"""
Run the enhanced MongoDB import with FDA API integration.
"""

import sys
from hardened_mongo_import import DrugLabelImporter

def main():
    """Run the enhanced import process."""
    
    # Configuration
    json_file = "data/drugs/Labels.json"
    schema_file = "drug_label_schema.yaml"
    
    print("🚀 Starting enhanced MongoDB import with FDA API integration...")
    print(f"📄 JSON file: {json_file}")
    print(f"📋 Schema file: {schema_file}")
    print("-" * 60)
    
    try:
        # Create importer instance
        importer = DrugLabelImporter(
            mongo_uri='mongodb://localhost:27017/',
            db_name='drug_facts',
            collection_name='drugs'
        )
        
        # Run the import
        stats = importer.import_from_file(json_file, schema_file)
        
        # Print results
        print("\n" + "="*60)
        print("📊 IMPORT RESULTS")
        print("="*60)
        print(f"✅ Inserted: {stats['inserted']}")
        print(f"🔄 Updated: {stats['updated']}")
        print(f"⏭️  Skipped (identical): {stats['skipped']}")
        print(f"❌ Failed: {stats['failed']}")
        
        if stats['validation_errors']:
            print(f"\n⚠️  Validation Errors ({len(stats['validation_errors'])}):")
            for error in stats['validation_errors'][:5]:  # Show first 5 errors
                print(f"   - {error}")
            if len(stats['validation_errors']) > 5:
                print(f"   ... and {len(stats['validation_errors']) - 5} more")
        
        # Show SPL link cache stats
        print(f"\n🔗 FDA API Cache: {len(importer.spl_link_cache)} drugs processed")
        successful_lookups = sum(1 for v in importer.spl_link_cache.values() if v is not None)
        print(f"📡 Successful FDA lookups: {successful_lookups}/{len(importer.spl_link_cache)}")
        
        importer.close()
        
        total_processed = stats['inserted'] + stats['updated'] + stats['skipped']
        print(f"\n🎉 Import completed! {total_processed} documents processed successfully.")
        
        if stats['failed'] > 0:
            print(f"⚠️  {stats['failed']} documents failed - check logs for details.")
            return 1
        
        return 0
        
    except Exception as e:
        print(f"\n❌ Import failed with error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())