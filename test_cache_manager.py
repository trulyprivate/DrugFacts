#!/usr/bin/env python
"""
Test script for the enhanced cache manager.
"""

import os
import time
from pprint import pprint

from ai_classification.cache_manager import CacheManager


def create_sample_drug():
    """Create a sample drug for testing."""
    return {
        'drugName': 'Test Drug',
        'setId': 'test-123',
        'label': {
            'genericName': 'test-generic',
            'indicationsAndUsage': 'Test indications for this medication.',
            'dosageAndAdministration': 'Take as directed by your physician.',
            'warningsAndPrecautions': 'Use with caution in patients with liver disease.',
            'adverseReactions': 'Common side effects include headache and nausea.',
            'clinicalPharmacology': 'This drug works by inhibiting enzyme XYZ.',
            'mechanismOfAction': 'Selective inhibition of receptor ABC.',
            'description': 'White crystalline powder for oral administration.'
        }
    }


def create_sample_classification():
    """Create a sample classification result."""
    return {
        'primary_therapeutic_class': 'Antihypertensive',
        'pharmacological_class': 'Calcium Channel Blocker',
        'chemical_class': 'Dihydropyridine Derivative',
        'atc_code': 'C08CA01',
        'controlled_substance_schedule': 'Not Controlled',
        'therapeutic_indication': 'Treatment of hypertension',
        'mechanism_of_action_summary': 'Blocks calcium channels in vascular smooth muscle',
        'confidence_level': 'High',
        'source_sections_used': ['indicationsAndUsage', 'mechanismOfAction', 'clinicalPharmacology']
    }


def create_sample_metadata():
    """Create sample metadata."""
    return {
        'model': 'gpt-4o-mini',
        'tokens_used': 850,
        'processing_time': 1.2,
        'attempts': 1,
        'cached': False
    }


def test_basic_cache_operations():
    """Test basic cache operations."""
    print("\n=== Testing Basic Cache Operations ===")
    
    # Create cache manager
    cache_manager = CacheManager()
    
    # Create sample data
    drug = create_sample_drug()
    classification = create_sample_classification()
    metadata = create_sample_metadata()
    
    # Generate cache key
    cache_key = cache_manager.generate_cache_key(drug)
    print(f"Generated cache key: {cache_key[:50]}...")
    
    # Check if entry exists (should be miss)
    cached_result = cache_manager.get_cached_classification(cache_key)
    print(f"Initial cache check result: {cached_result is not None}")
    
    # Store in cache
    print("Storing classification in cache...")
    success = cache_manager.store_classification(cache_key, classification, metadata)
    print(f"Store operation success: {success}")
    
    # Check again (should be hit)
    cached_result = cache_manager.get_cached_classification(cache_key)
    print(f"Second cache check result: {cached_result is not None}")
    
    if cached_result:
        print(f"Retrieved classification: {cached_result['classification']['primary_therapeutic_class']}")
        print(f"Cache age: {cached_result.get('cache_age_seconds', 0):.2f} seconds")
    
    # Get cache info
    cache_info = cache_manager.get_cache_info(cache_key)
    print("\nCache Entry Info:")
    pprint(cache_info)
    
    # Get metrics
    metrics = cache_manager.get_metrics()
    print("\nCache Metrics:")
    print(f"Cache hits: {metrics['cache_hits']}")
    print(f"Cache misses: {metrics['cache_misses']}")
    print(f"Cache hit rate: {metrics.get('cache_hit_rate', 0):.2f}")
    print(f"Average retrieval time: {metrics['avg_retrieval_time']:.6f}s")
    
    # Close cache manager
    cache_manager.close()


def test_cache_warming():
    """Test cache warming functionality."""
    print("\n=== Testing Cache Warming ===")
    
    # Create cache manager
    cache_manager = CacheManager()
    
    # Create sample drugs
    drugs = [
        create_sample_drug(),
        {**create_sample_drug(), 'drugName': 'Drug 2', 'setId': 'test-456'},
        {**create_sample_drug(), 'drugName': 'Drug 3', 'setId': 'test-789'}
    ]
    
    # Mock classification function
    def mock_classify(drug_data):
        time.sleep(0.1)  # Simulate API call
        return {
            'classification': create_sample_classification(),
            'metadata': create_sample_metadata()
        }
    
    # Warm cache
    print(f"Warming cache with {len(drugs)} drugs...")
    start_time = time.time()
    results = cache_manager.warm_cache(drugs, mock_classify)
    total_time = time.time() - start_time
    
    print(f"Cache warming completed in {total_time:.2f}s")
    print(f"Already cached: {results['already_cached']}")
    print(f"Newly cached: {results['newly_cached']}")
    print(f"Failed: {results['failed']}")
    
    # Get cache statistics
    stats = cache_manager.get_cache_statistics()
    print("\nCache Statistics:")
    print(f"Total entries: {stats.get('total_entries', 0)}")
    print(f"Average age (hours): {stats.get('avg_age_hours', 0):.2f}")
    
    # Close cache manager
    cache_manager.close()


def test_cache_management():
    """Test cache management operations."""
    print("\n=== Testing Cache Management ===")
    
    # Create cache manager
    cache_manager = CacheManager()
    
    # Create and store some sample entries
    for i in range(5):
        drug = {**create_sample_drug(), 'drugName': f'Drug {i}', 'setId': f'test-{i}'}
        cache_key = cache_manager.generate_cache_key(drug)
        cache_manager.store_classification(
            cache_key, 
            create_sample_classification(), 
            create_sample_metadata()
        )
    
    # Get initial statistics
    stats = cache_manager.get_cache_statistics()
    print(f"Initial cache entries: {stats.get('total_entries', 0)}")
    
    # Clean up expired entries (shouldn't be any yet)
    cleaned = cache_manager.cleanup_expired_entries()
    print(f"Expired entries cleaned: {cleaned}")
    
    # Clear entries older than 1 hour (shouldn't be any)
    cleared = cache_manager.clear_cache(older_than_hours=1)
    print(f"Entries older than 1 hour cleared: {cleared}")
    
    # Clear all entries
    cleared = cache_manager.clear_cache()
    print(f"All entries cleared: {cleared}")
    
    # Get final statistics
    stats = cache_manager.get_cache_statistics()
    print(f"Final cache entries: {stats.get('total_entries', 0)}")
    
    # Close cache manager
    cache_manager.close()


def main():
    """Run all tests."""
    print("Enhanced Cache Manager Test Script")
    print("=" * 50)
    
    # Check MongoDB connection
    mongo_uri = os.environ.get('MONGODB_URI', 'mongodb://localhost:27017/')
    print(f"Using MongoDB URI: {mongo_uri}")
    
    # Run tests
    test_basic_cache_operations()
    test_cache_warming()
    test_cache_management()
    
    print("\nAll tests completed!")


if __name__ == "__main__":
    main()