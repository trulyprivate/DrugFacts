"""
Simple test script for drug classifier.
"""

import os
from ai_classification.drug_classifier import DrugClassifier

# Create a sample drug data
sample_drug = {
    'drugName': 'Test Drug',
    'setId': 'test-123',
    'label': {
        'genericName': 'test-generic',
        'indicationsAndUsage': 'This drug is indicated for testing purposes.',
        'mechanismOfAction': 'This drug works by testing mechanisms.',
        'description': 'Test drug description.'
    }
}

# Initialize classifier
try:
    classifier = DrugClassifier()
    print("DrugClassifier initialized successfully.")
    
    # Test classification
    print("\nClassifying sample drug...")
    result = classifier.classify_drug(sample_drug)
    
    print("\nClassification result:")
    print(f"Primary therapeutic class: {result['classification']['primary_therapeutic_class']}")
    print(f"Pharmacological class: {result['classification']['pharmacological_class']}")
    print(f"Confidence level: {result['classification']['confidence_level']}")
    print(f"Cached: {result.get('cached', False)}")
    
    print("\nMetadata:")
    for key, value in result.get('metadata', {}).items():
        print(f"  {key}: {value}")
    
except Exception as e:
    print(f"Error testing drug classifier: {e}")