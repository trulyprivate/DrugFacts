"""
Cache manager for AI classification results.

This module provides caching functionality for AI classification results,
reducing redundant API calls and improving performance.
"""

import hashlib
import time
import json
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from collections import defaultdict

from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.collection import Collection
from pymongo.errors import PyMongoError, DuplicateKeyError

from ai_classification.config import get_config
from ai_classification.logging_config import setup_logging

logger = setup_logging(__name__)


class CacheManager:
    """Manager for AI classification result caching.
    
    Provides comprehensive caching functionality with metrics tracking,
    TTL management, and cache optimization features.
    """
    
    def __init__(self, mongo_uri: Optional[str] = None, 
                 db_name: str = 'drug_facts', 
                 collection_name: str = 'ai_classification_cache'):
        """
        Initialize the cache manager.
        
        Args:
            mongo_uri: MongoDB connection URI (defaults to config)
            db_name: Database name
            collection_name: Collection name
        """
        config = get_config()
        
        # Use provided mongo_uri or default from environment
        self.mongo_uri = mongo_uri or config.get('MONGODB_URI', 'mongodb://localhost:27017/')
        self.db_name = db_name
        self.collection_name = collection_name
        self.ttl = config['AI_CLASSIFICATION_CACHE_TTL']
        
        # Initialize MongoDB client
        self.client = None
        self.collection = None
        
        # Initialize metrics tracking
        self.metrics = {
            'cache_hits': 0,
            'cache_misses': 0,
            'cache_stores': 0,
            'cache_errors': 0,
            'total_requests': 0,
            'avg_retrieval_time': 0.0,
            'avg_storage_time': 0.0,
            'cache_size_bytes': 0,
            'expired_entries_cleaned': 0
        }
        
        # Track retrieval times for averaging
        self._retrieval_times = []
        self._storage_times = []
        
        logger.info(f"Initialized cache manager with TTL: {self.ttl}s")
    
    def _get_collection(self) -> Collection:
        """
        Get the MongoDB collection, initializing connection if needed.
        
        Returns:
            Collection: MongoDB collection
        """
        if self.client is None:
            self.client = MongoClient(self.mongo_uri)
            db = self.client[self.db_name]
            self.collection = db[self.collection_name]
            
            # Ensure TTL index exists
            try:
                self.collection.create_index(
                    "expires_at", 
                    expireAfterSeconds=0,
                    background=True
                )
                self.collection.create_index(
                    "cache_key",
                    unique=True,
                    background=True
                )
                logger.debug("Ensured cache collection indexes")
            except PyMongoError as e:
                logger.warning(f"Failed to create cache indexes: {e}")
        
        return self.collection
    
    def generate_cache_key(self, drug_data: Dict[str, Any]) -> str:
        """
        Generate a cache key for the given drug data.
        
        Args:
            drug_data: Drug data dictionary
            
        Returns:
            str: Cache key
        """
        # Extract key fields for cache key
        set_id = drug_data.get('setId', '')
        drug_name = drug_data.get('drugName', '')
        generic_name = drug_data.get('label', {}).get('genericName', '')
        
        # Create a content hash from relevant fields
        content_hash = self._calculate_content_hash(drug_data)
        
        # Combine fields into cache key
        cache_key = f"drug-classification:{set_id}:{drug_name}:{generic_name}:{content_hash}"
        
        return cache_key
    
    def _calculate_content_hash(self, drug_data: Dict[str, Any]) -> str:
        """
        Calculate a hash of the drug content for cache key.
        
        Args:
            drug_data: Drug data dictionary
            
        Returns:
            str: Content hash
        """
        # Extract label content for hashing
        label = drug_data.get('label', {})
        content_fields = [
            label.get('indicationsAndUsage', ''),
            label.get('dosageAndAdministration', ''),
            label.get('warningsAndPrecautions', ''),
            label.get('adverseReactions', ''),
            label.get('clinicalPharmacology', ''),
            label.get('mechanismOfAction', ''),
            label.get('description', '')
        ]
        
        # Join content and hash
        content = ''.join(str(field) for field in content_fields)
        content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        
        return content_hash
    
    def get_cached_classification(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Get cached classification result with metrics tracking.
        
        Args:
            cache_key: Cache key
            
        Returns:
            Optional[Dict[str, Any]]: Cached classification or None if not found
        """
        start_time = time.time()
        self.metrics['total_requests'] += 1
        
        try:
            collection = self._get_collection()
            
            # Find non-expired cache entry
            cache_entry = collection.find_one({
                'cache_key': cache_key,
                'expires_at': {'$gt': datetime.utcnow()}
            })
            
            retrieval_time = time.time() - start_time
            self._retrieval_times.append(retrieval_time)
            
            # Update average retrieval time
            if self._retrieval_times:
                self.metrics['avg_retrieval_time'] = sum(self._retrieval_times) / len(self._retrieval_times)
            
            if cache_entry:
                self.metrics['cache_hits'] += 1
                logger.debug(f"Cache hit for key: {cache_key[:50]}... (retrieval: {retrieval_time:.3f}s)")
                
                # Calculate cache entry age
                age_seconds = (datetime.utcnow() - cache_entry['created_at']).total_seconds()
                
                return {
                    'classification': cache_entry['classification'],
                    'metadata': cache_entry.get('metadata', {}),
                    'cached': True,
                    'cached_at': cache_entry['created_at'],
                    'cache_age_seconds': age_seconds,
                    'retrieval_time': retrieval_time
                }
            
            self.metrics['cache_misses'] += 1
            logger.debug(f"Cache miss for key: {cache_key[:50]}... (retrieval: {retrieval_time:.3f}s)")
            return None
            
        except PyMongoError as e:
            self.metrics['cache_errors'] += 1
            logger.warning(f"Cache retrieval error: {e}")
            return None
    
    def store_classification(self, cache_key: str, classification: Dict[str, Any], 
                            metadata: Dict[str, Any]) -> bool:
        """
        Store classification result in cache with metrics tracking.
        
        Args:
            cache_key: Cache key
            classification: Classification result
            metadata: Classification metadata
            
        Returns:
            bool: True if stored successfully, False otherwise
        """
        start_time = time.time()
        
        try:
            collection = self._get_collection()
            
            # Calculate expiration time
            now = datetime.utcnow()
            expires_at = now + timedelta(seconds=self.ttl)
            
            # Calculate document size for metrics
            cache_doc = {
                'cache_key': cache_key,
                'classification': classification,
                'metadata': metadata,
                'created_at': now,
                'expires_at': expires_at
            }
            
            # Estimate document size
            doc_size = len(json.dumps(cache_doc, default=str))
            
            # Upsert to handle race conditions
            result = collection.replace_one(
                {'cache_key': cache_key},
                cache_doc,
                upsert=True
            )
            
            # Update metrics
            storage_time = time.time() - start_time
            self._storage_times.append(storage_time)
            self.metrics['cache_stores'] += 1
            
            # Update average storage time
            if self._storage_times:
                self.metrics['avg_storage_time'] = sum(self._storage_times) / len(self._storage_times)
            
            # Update cache size estimate
            self.metrics['cache_size_bytes'] += doc_size
            
            logger.debug(f"Stored classification in cache (key: {cache_key[:50]}..., "
                        f"size: {doc_size} bytes, storage: {storage_time:.3f}s)")
            return True
            
        except PyMongoError as e:
            self.metrics['cache_errors'] += 1
            logger.warning(f"Cache storage error: {e}")
            return False
    
    def get_metrics(self) -> Dict[str, Any]:
        """
        Get cache metrics and statistics.
        
        Returns:
            Dict[str, Any]: Cache metrics
        """
        metrics = self.metrics.copy()
        
        # Calculate derived metrics
        if metrics['total_requests'] > 0:
            metrics['cache_hit_rate'] = metrics['cache_hits'] / metrics['total_requests']
            metrics['cache_miss_rate'] = metrics['cache_misses'] / metrics['total_requests']
            metrics['error_rate'] = metrics['cache_errors'] / metrics['total_requests']
        else:
            metrics['cache_hit_rate'] = 0.0
            metrics['cache_miss_rate'] = 0.0
            metrics['error_rate'] = 0.0
        
        # Add collection statistics if available
        try:
            collection = self._get_collection()
            stats = collection.estimated_document_count()
            metrics['total_cached_entries'] = stats
            
            # Get actual cache size from MongoDB
            db_stats = collection.database.command("collStats", self.collection_name)
            metrics['actual_cache_size_bytes'] = db_stats.get('size', 0)
            metrics['cache_storage_size_bytes'] = db_stats.get('storageSize', 0)
            metrics['cache_index_size_bytes'] = db_stats.get('totalIndexSize', 0)
            
        except PyMongoError as e:
            logger.warning(f"Failed to get collection stats: {e}")
            metrics['total_cached_entries'] = 0
            metrics['actual_cache_size_bytes'] = 0
        
        return metrics
    
    def clear_cache(self, older_than_hours: Optional[int] = None) -> int:
        """
        Clear cache entries, optionally only those older than specified hours.
        
        Args:
            older_than_hours: Only clear entries older than this many hours
            
        Returns:
            int: Number of entries cleared
        """
        try:
            collection = self._get_collection()
            
            if older_than_hours is not None:
                # Clear entries older than specified hours
                cutoff_time = datetime.utcnow() - timedelta(hours=older_than_hours)
                result = collection.delete_many({
                    'created_at': {'$lt': cutoff_time}
                })
                logger.info(f"Cleared {result.deleted_count} cache entries older than {older_than_hours} hours")
            else:
                # Clear all entries
                result = collection.delete_many({})
                logger.info(f"Cleared all {result.deleted_count} cache entries")
            
            return result.deleted_count
            
        except PyMongoError as e:
            logger.error(f"Failed to clear cache: {e}")
            return 0
    
    def cleanup_expired_entries(self) -> int:
        """
        Manually cleanup expired entries (MongoDB TTL should handle this automatically).
        
        Returns:
            int: Number of expired entries cleaned up
        """
        try:
            collection = self._get_collection()
            
            # Find and delete expired entries
            result = collection.delete_many({
                'expires_at': {'$lt': datetime.utcnow()}
            })
            
            cleaned_count = result.deleted_count
            self.metrics['expired_entries_cleaned'] += cleaned_count
            
            if cleaned_count > 0:
                logger.info(f"Cleaned up {cleaned_count} expired cache entries")
            
            return cleaned_count
            
        except PyMongoError as e:
            logger.error(f"Failed to cleanup expired entries: {e}")
            return 0
    
    def get_cache_info(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a specific cache entry without retrieving the full data.
        
        Args:
            cache_key: Cache key to get info for
            
        Returns:
            Optional[Dict[str, Any]]: Cache entry info or None if not found
        """
        try:
            collection = self._get_collection()
            
            # Find cache entry and project only metadata
            cache_entry = collection.find_one(
                {'cache_key': cache_key},
                {
                    'created_at': 1,
                    'expires_at': 1,
                    'metadata': 1,
                    '_id': 0
                }
            )
            
            if cache_entry:
                now = datetime.utcnow()
                is_expired = cache_entry['expires_at'] < now
                age_seconds = (now - cache_entry['created_at']).total_seconds()
                ttl_remaining = (cache_entry['expires_at'] - now).total_seconds()
                
                return {
                    'exists': True,
                    'expired': is_expired,
                    'created_at': cache_entry['created_at'],
                    'expires_at': cache_entry['expires_at'],
                    'age_seconds': age_seconds,
                    'ttl_remaining_seconds': max(0, ttl_remaining),
                    'metadata': cache_entry.get('metadata', {})
                }
            
            return {'exists': False}
            
        except PyMongoError as e:
            logger.warning(f"Failed to get cache info: {e}")
            return None
    
    def warm_cache(self, drug_data_list: List[Dict[str, Any]], 
                   classification_func) -> Dict[str, Any]:
        """
        Warm the cache by pre-computing classifications for a list of drugs.
        
        Args:
            drug_data_list: List of drug data dictionaries
            classification_func: Function to call for classification
            
        Returns:
            Dict[str, Any]: Warming results
        """
        results = {
            'total_drugs': len(drug_data_list),
            'already_cached': 0,
            'newly_cached': 0,
            'failed': 0,
            'processing_time': 0.0
        }
        
        start_time = time.time()
        
        for drug_data in drug_data_list:
            try:
                cache_key = self.generate_cache_key(drug_data)
                
                # Check if already cached
                if self.get_cached_classification(cache_key):
                    results['already_cached'] += 1
                    continue
                
                # Get classification and cache it
                classification_result = classification_func(drug_data)
                
                if classification_result and 'classification' in classification_result:
                    success = self.store_classification(
                        cache_key,
                        classification_result['classification'],
                        classification_result.get('metadata', {})
                    )
                    
                    if success:
                        results['newly_cached'] += 1
                    else:
                        results['failed'] += 1
                else:
                    results['failed'] += 1
                    
            except Exception as e:
                logger.error(f"Cache warming failed for drug: {e}")
                results['failed'] += 1
        
        results['processing_time'] = time.time() - start_time
        
        logger.info(f"Cache warming completed: {results}")
        return results
    
    def get_cache_statistics(self) -> Dict[str, Any]:
        """
        Get comprehensive cache statistics.
        
        Returns:
            Dict[str, Any]: Detailed cache statistics
        """
        try:
            collection = self._get_collection()
            
            # Aggregate statistics
            pipeline = [
                {
                    '$group': {
                        '_id': None,
                        'total_entries': {'$sum': 1},
                        'avg_age_hours': {
                            '$avg': {
                                '$divide': [
                                    {'$subtract': ['$$NOW', '$created_at']},
                                    3600000  # Convert to hours
                                ]
                            }
                        },
                        'oldest_entry': {'$min': '$created_at'},
                        'newest_entry': {'$max': '$created_at'}
                    }
                }
            ]
            
            stats_result = list(collection.aggregate(pipeline))
            
            if stats_result:
                stats = stats_result[0]
                return {
                    'total_entries': stats.get('total_entries', 0),
                    'avg_age_hours': stats.get('avg_age_hours', 0),
                    'oldest_entry': stats.get('oldest_entry'),
                    'newest_entry': stats.get('newest_entry'),
                    'cache_metrics': self.get_metrics()
                }
            else:
                return {
                    'total_entries': 0,
                    'avg_age_hours': 0,
                    'oldest_entry': None,
                    'newest_entry': None,
                    'cache_metrics': self.get_metrics()
                }
                
        except PyMongoError as e:
            logger.error(f"Failed to get cache statistics: {e}")
            return {'error': str(e), 'cache_metrics': self.get_metrics()}
    
    def close(self):
        """Close MongoDB connection and return final metrics."""
        final_metrics = self.get_metrics()
        
        if self.client:
            self.client.close()
            self.client = None
            logger.info("Closed cache manager MongoDB connection")
            logger.info(f"Final cache metrics: {final_metrics}")
        
        return final_metrics