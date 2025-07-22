#!/usr/bin/env python3
"""Test image URL transformation in enhanced drug importer."""

import json
from enhanced_drug_importer import EnhancedDrugLabelImporter

# Create a test document with image URLs
test_document = {
    "drugName": "EMGALITY",
    "genericName": "galcanezumab-gnlm",
    "slug": "emgality-test",
    "boxedWarning": '<img src="image1.jpg" alt="warning">',
    "warnings": 'Some text with <img src="image2.jpg"> embedded',
    "indicationsAndUsage": '<div><img src="image3.jpg" /></div>',
    "dosageAndAdministration": 'Multiple images: <img src="img4.jpg"> and <img src="img5.jpg">'
}

print("Testing Enhanced Drug Importer with Image URL Transformation")
print("=" * 60)
print(f"Original document images:")
print(f"  boxedWarning: {test_document.get('boxedWarning', '')}")
print(f"  warnings: {test_document.get('warnings', '')}")
print()

# Initialize importer
importer = EnhancedDrugLabelImporter()

# Test the fetch_spl_link_id method
print("Testing FDA API fetch for EMGALITY...")
spl_link_id = importer.fetch_spl_link_id("EMGALITY")
print(f"SPL Link ID: {spl_link_id}")
print()

if spl_link_id:
    # Test the transform_image_urls method
    print("Testing image URL transformation...")
    transformed_doc = importer.transform_image_urls(test_document.copy(), spl_link_id)
    
    print("Transformed document images:")
    print(f"  boxedWarning: {transformed_doc.get('boxedWarning', '')}")
    print(f"  warnings: {transformed_doc.get('warnings', '')}")
    
    # Check if transformation worked
    if "www.accessdata.fda.gov" in str(transformed_doc.get('boxedWarning', '')):
        print("\n✓ Image URL transformation successful!")
    else:
        print("\n✗ Image URL transformation failed!")
else:
    print("✗ Could not fetch SPL link ID from FDA API")

# Close the connection
importer.close()