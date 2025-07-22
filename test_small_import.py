#!/usr/bin/env python3
"""
Test the enhanced MongoDB import with a small subset of data.
"""

import json
from hardened_mongo_import import DrugLabelImporter

def main():
    """Test import with first 3 documents."""
    
    print("🧪 Testing enhanced MongoDB import with small dataset...")
    
    # Load first 3 documents from Labels.json
    with open("data/drugs/Labels.json", 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    # Take first 3 documents for testing
    test_data = all_data[:3]
    
    print(f"📄 Testing with {len(test_data)} documents:")
    for i, doc in enumerate(test_data, 1):
        print(f"   {i}. {doc.get('drugName', 'Unknown')} (slug: {doc.get('slug', 'N/A')})")
    
    print("-" * 60)
    
    try:
        # Create importer instance
        importer = DrugLabelImporter(
            mongo_uri='mongodb://localhost:27017/',
            db_name='drug_facts_test',  # Use test database
            collection_name='drugs'
        )
        
        # Load schema
        if not importer.load_schema("drug_label_schema.yaml"):
            print("❌ Failed to load schema")
            return 1
        
        # Process the test documents
        stats = importer.process_documents(test_data)
        
        # Print results
        print("\n" + "="*50)
        print("📊 TEST RESULTS")
        print("="*50)
        print(f"✅ Inserted: {stats['inserted']}")
        print(f"🔄 Updated: {stats['updated']}")
        print(f"⏭️  Skipped: {stats['skipped']}")
        print(f"❌ Failed: {stats['failed']}")
        
        if stats['validation_errors']:
            print(f"\n⚠️  Validation Errors:")
            for error in stats['validation_errors']:
                print(f"   - {error}")
        
        # Show FDA API results
        print(f"\n🔗 FDA API Results:")
        for drug_name, spl_id in importer.spl_link_cache.items():
            status = "✅ Found" if spl_id else "❌ Not found"
            print(f"   - {drug_name}: {status}")
            if spl_id:
                print(f"     SPL ID: {spl_id}")
        
        importer.close()
        
        print(f"\n🎉 Test completed successfully!")
        return 0
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    main()