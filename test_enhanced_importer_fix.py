#!/usr/bin/env python3
"""Test the enhanced drug importer fix."""

from enhanced_drug_importer import EnhancedDrugLabelImporter

def test_classification_fix():
    """Test that the classification is properly extracted as a string."""
    importer = EnhancedDrugLabelImporter()
    
    # Mock classification result
    mock_classification_result = {
        'classification': {
            'primary_therapeutic_class': 'Neurological Agents',
            'pharmacological_class': 'CGRP Inhibitors',
            'chemical_class': 'Monoclonal Antibodies',
            'atc_code': 'N02CD03',
            'controlled_substance_schedule': 'Not specified',
            'therapeutic_indication': 'Preventive treatment of migraine',
            'mechanism_of_action_summary': 'CGRP inhibitor',
            'confidence_level': 'High',
            'source_sections_used': ['Indications and Usage']
        },
        'metadata': {
            'model': 'gpt-4o-mini',
            'tokens_used': 1000,
            'processing_time': 2.5
        },
        'cached': False
    }
    
    # Mock document
    mock_document = {
        'drugName': 'Test Drug',
        'slug': 'test-drug',
        'genericName': 'test-generic'
    }
    
    # Test enhancement
    enhanced_doc = importer._enhance_document_with_classification(mock_document, mock_classification_result)
    
    # Verify therapeuticClass is a string
    assert isinstance(enhanced_doc['therapeuticClass'], str), \
        f"Expected therapeuticClass to be string, got {type(enhanced_doc['therapeuticClass'])}"
    assert enhanced_doc['therapeuticClass'] == 'Neurological Agents', \
        f"Expected 'Neurological Agents', got {enhanced_doc['therapeuticClass']}"
    
    # Verify aiClassification contains the full dict
    assert isinstance(enhanced_doc['aiClassification'], dict), \
        "Expected aiClassification to be dict"
    assert enhanced_doc['aiClassification']['primary_therapeutic_class'] == 'Neurological Agents'
    
    # Verify metadata
    assert enhanced_doc['aiProcessingMetadata']['confidence'] == 'High'
    assert enhanced_doc['aiProcessingMetadata']['modelUsed'] == 'gpt-4o-mini'
    
    print("✓ All tests passed! therapeuticClass is now properly stored as a string.")
    print(f"  therapeuticClass: {enhanced_doc['therapeuticClass']}")
    print(f"  aiClassification keys: {list(enhanced_doc['aiClassification'].keys())}")

if __name__ == "__main__":
    test_classification_fix()