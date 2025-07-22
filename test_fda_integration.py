#!/usr/bin/env python3
"""
Test script for FDA API integration and image URL transformation.
"""

import json
from hardened_mongo_import import DrugLabelImporter

def test_fda_api():
    """Test FDA API integration with a known drug."""
    print("Testing FDA API integration...")
    
    # Create importer instance
    importer = DrugLabelImporter()
    
    # Test with Mounjaro
    drug_name = "Mounjaro"
    print(f"Fetching SPL link ID for: {drug_name}")
    
    spl_link_id = importer.fetch_spl_link_id(drug_name)
    
    if spl_link_id:
        print(f"✅ Success! SPL Link ID: {spl_link_id}")
        
        # Test image URL transformation
        test_html = '<img alt="Figure 2" src="moun-uspi-f2-v1.jpg"/>'
        print(f"\nOriginal HTML: {test_html}")
        
        transformed_html = importer._update_img_tags(test_html, spl_link_id)
        print(f"Transformed HTML: {transformed_html}")
        
        expected_url = f"https://www.accessdata.fda.gov/spl/data/{spl_link_id}/moun-uspi-f2-v1.jpg"
        if expected_url in transformed_html:
            print("✅ Image URL transformation successful!")
        else:
            print("❌ Image URL transformation failed!")
            
    else:
        print("❌ Failed to fetch SPL link ID")
    
    # Test caching
    print(f"\nTesting cache...")
    cached_result = importer._fetch_spl_link_id(drug_name)
    if cached_result == spl_link_id:
        print("✅ Caching works correctly!")
    else:
        print("❌ Caching failed!")
    
    importer.close()

def test_document_transformation():
    """Test full document transformation."""
    print("\n" + "="*50)
    print("Testing document transformation...")
    
    # Sample document with image tags
    sample_doc = {
        "drugName": "Mounjaro",
        "slug": "test-mounjaro",
        "label": {
            "dosageAndAdministration": '<p>Some text with <img alt="Figure 1" src="test-image-1.jpg"/> and more content.</p>',
            "clinicalStudies": '<div>Study data <img src="study-chart.png" alt="Chart"/> here.</div>'
        }
    }
    
    importer = DrugLabelImporter()
    
    # Get SPL link ID
    spl_link_id = importer._fetch_spl_link_id(sample_doc["drugName"])
    
    if spl_link_id:
        print(f"Using SPL Link ID: {spl_link_id}")
        
        # Transform the document
        transformed_doc = importer._transform_image_urls(sample_doc, spl_link_id)
        
        print("\nOriginal document:")
        print(json.dumps(sample_doc, indent=2))
        
        print("\nTransformed document:")
        print(json.dumps(transformed_doc, indent=2))
        
        # Check if URLs were transformed
        doc_str = json.dumps(transformed_doc)
        if f"https://www.accessdata.fda.gov/spl/data/{spl_link_id}/" in doc_str:
            print("✅ Document transformation successful!")
        else:
            print("❌ Document transformation failed!")
    else:
        print("❌ Could not get SPL link ID for testing")
    
    importer.close()

if __name__ == "__main__":
    test_fda_api()
    test_document_transformation()
    print("\n" + "="*50)
    print("Test completed!")