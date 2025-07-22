# AI Reliability and Error Handling Implementation

## Overview

This document describes the comprehensive AI reliability and error handling mechanisms implemented in the `run_enhanced_import.py` script and its associated modules for drug classification.

## Architecture Overview

```
┌─────────────────────────┐
│  run_enhanced_import.py │ - Command-line interface
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│ EnhancedDrugLabelImporter│ - Main orchestrator
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐
│    DrugClassifier       │ - AI classification logic
└───────────┬─────────────┘
            │
┌───────────▼─────────────┐    ┌────────────────┐
│    OpenPipeClient       │───▶│  CacheManager  │
└─────────────────────────┘    └────────────────┘
```

## Key Reliability Features

### 1. Multi-Layer Error Handling

#### Command Line Interface (`run_enhanced_import.py`)
```python
try:
    # Initialize importer
    importer = EnhancedDrugLabelImporter(...)
    
    # Process documents
    stats = importer.process_documents(json_data)
    
    # Return appropriate exit code
    return 0 if stats['failed'] == 0 else 1
    
except Exception as e:
    print(f"Import failed: {e}")
    if args.verbose:
        import traceback
        traceback.print_exc()
    return 1
```

#### Document-Level Processing
```python
for i, document in enumerate(documents):
    try:
        # Apply AI classification
        if is_ai_enabled():
            try:
                classification_result = self.drug_classifier.classify_drug(document)
                document = self._enhance_document_with_classification(document, classification_result)
                stats['ai_enhanced'] += 1
            except Exception as e:
                stats['ai_failed'] += 1
                logger.error(f"AI classification failed for document {i+1}: {e}")
                # Continue with base document - graceful degradation
```

### 2. Sophisticated Retry Logic

#### Exponential Backoff Implementation
```python
# OpenPipeClient retry logic
for attempt in range(1, self.max_retries + 1):
    try:
        response = self.client.chat.completions.create(...)
        return classification, metadata
        
    except RateLimitError as e:
        # Special handling for rate limits
        backoff_time = min(60, 2 ** attempt)  # Cap at 60 seconds
        logger.info(f"Rate limited, waiting {backoff_time} seconds...")
        time.sleep(backoff_time)
        
    except Exception as e:
        # Standard exponential backoff
        if attempt < self.max_retries:
            backoff_time = min(30, 2 ** (attempt - 1))  # 1, 2, 4, 8, 16, 30...
            logger.info(f"Retrying in {backoff_time} seconds...")
            time.sleep(backoff_time)
```

### 3. Rate Limiting

#### Client-Side Rate Limiter
```python
class RateLimiter:
    """Sliding window rate limiter."""
    
    def wait_if_needed(self):
        """Wait if rate limit would be exceeded."""
        with self.lock:
            # Remove old requests outside the time window
            while self.requests and (now - self.requests[0]).total_seconds() > self.time_window:
                self.requests.popleft()
            
            # Calculate wait time if needed
            if len(self.requests) >= self.max_requests:
                wait_time = self.time_window - (now - oldest_request).total_seconds()
                if wait_time > 0:
                    logger.info(f"Rate limit reached, waiting {wait_time:.2f} seconds")
                    time.sleep(wait_time)
```

### 4. Intelligent Caching

#### MongoDB-Based Persistent Cache
```python
class CacheManager:
    def get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Retrieve from cache with TTL validation."""
        try:
            start_time = time.time()
            
            # Find non-expired entry
            cached_entry = collection.find_one({
                'cache_key': cache_key,
                'expires_at': {'$gt': datetime.utcnow()}
            })
            
            if cached_entry:
                self.metrics['cache_hits'] += 1
                logger.debug(f"Cache hit for key: {cache_key}")
                return cached_entry['result']
                
        except PyMongoError as e:
            self.metrics['cache_errors'] += 1
            logger.error(f"Cache retrieval error: {e}")
```

#### Content-Based Cache Keys
```python
def generate_cache_key(self, drug_data: Dict[str, Any]) -> str:
    """Generate cache key using content hash."""
    # Extract key fields
    set_id = drug_data.get('setId', '')
    drug_name = drug_data.get('drugName', '')
    
    # Create content hash from relevant fields
    content_hash = self._calculate_content_hash(drug_data)
    
    return f"drug-classification:{set_id}:{drug_name}:{content_hash}"
```

### 5. Graceful Degradation

#### AI Service Failure Handling
```python
# If AI classification fails, continue with defaults
if not classification_result:
    logger.warning(f"Using default classification for {drug_name}")
    return {
        'classification': {
            'primary_therapeutic_class': 'Not specified',
            'secondary_therapeutic_classes': [],
            'mechanism_of_action': 'Not available',
            'confidence_level': 'Low'
        }
    }
```

### 6. Comprehensive Logging

#### Structured Logging Configuration
```python
def setup_logging(module_name: str) -> logging.Logger:
    """Set up consistent logging across modules."""
    logger = logging.getLogger(module_name)
    
    # Console handler with formatting
    console_handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    logger.setLevel(log_level)
    
    return logger
```

### 7. Data Validation

#### Response Validation
```python
class ResponseValidator:
    """Validates AI responses against expected schema."""
    
    def validate_classification_response(self, response: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """Validate classification response structure."""
        required_fields = [
            'primary_therapeutic_class',
            'secondary_therapeutic_classes',
            'mechanism_of_action',
            'confidence_level'
        ]
        
        for field in required_fields:
            if field not in response:
                return False, f"Missing required field: {field}"
        
        # Validate data types
        if not isinstance(response['secondary_therapeutic_classes'], list):
            return False, "secondary_therapeutic_classes must be a list"
            
        # Validate confidence level
        valid_confidence = ['High', 'Medium', 'Low']
        if response['confidence_level'] not in valid_confidence:
            return False, f"Invalid confidence_level: {response['confidence_level']}"
        
        return True, None
```

### 8. Performance Monitoring

#### Metrics Tracking
```python
# Track detailed metrics
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

# Usage statistics
def get_stats(self) -> Dict[str, Any]:
    return {
        'total_requests': self.total_requests,
        'total_tokens': self.total_tokens,
        'total_cost': self.total_cost,
        'model': self.model,
        'cache_hit_rate': self.calculate_hit_rate()
    }
```

### 9. Environment Configuration

#### Flexible Configuration Management
```python
def get_config() -> Dict[str, Any]:
    """Get configuration from environment variables."""
    return {
        # AI Configuration
        'ENABLE_AI_CLASSIFICATION': os.getenv('ENABLE_AI_CLASSIFICATION', 'true').lower() == 'true',
        'OPENPIPE_API_KEY': os.getenv('OPENPIPE_API_KEY', ''),
        'AI_MODEL': os.getenv('AI_MODEL', 'OpenPipe/gpt-4-turbo-v3'),
        'AI_MAX_TOKENS': int(os.getenv('AI_MAX_TOKENS', '1000')),
        'AI_TEMPERATURE': float(os.getenv('AI_TEMPERATURE', '0.3')),
        'AI_REQUEST_TIMEOUT': int(os.getenv('AI_REQUEST_TIMEOUT', '60')),
        'AI_MAX_RETRIES': int(os.getenv('AI_MAX_RETRIES', '3')),
        
        # Cache Configuration
        'AI_CLASSIFICATION_CACHE_TTL': int(os.getenv('AI_CLASSIFICATION_CACHE_TTL', '86400')),  # 24 hours
        
        # Logging
        'AI_LOG_LEVEL': os.getenv('AI_LOG_LEVEL', 'INFO')
    }
```

### 10. Transaction Safety

#### Document-Level Atomicity
```python
def _process_single_document(self, document: Dict[str, Any], index: int) -> str:
    """Process a single document with atomic operations."""
    try:
        # Validate document
        is_valid, error_msg = self.validate_document(document)
        if not is_valid:
            return f"validation_error: Document {index+1}: {error_msg}"
        
        # Prepare document
        prepared_doc = self.prepare_document_for_upsert(document)
        
        # Atomic upsert
        result = self.collection.update_one(
            {'slug': slug},
            {'$set': prepared_doc},
            upsert=True
        )
        
        return 'inserted' if result.upserted_id else 'updated'
        
    except Exception as e:
        logger.error(f"Document processing failed: {e}")
        return 'failed'
```

## Error Types and Handling Strategies

### 1. API Errors
- **Rate Limit Errors**: Extended backoff up to 60 seconds
- **Timeout Errors**: Retry with exponential backoff
- **Connection Errors**: Retry with circuit breaker pattern
- **Authentication Errors**: Fail fast with clear error message

### 2. Data Errors
- **Invalid JSON**: Log and skip document
- **Missing Fields**: Use default values
- **Schema Validation**: Detailed error reporting
- **Type Mismatches**: Attempt type coercion

### 3. System Errors
- **MongoDB Connection**: Graceful degradation
- **Memory Issues**: Batch processing
- **Network Failures**: Retry with backoff

## Production Best Practices

### 1. Monitoring
- Comprehensive logging at all levels
- Performance metrics tracking
- Error rate monitoring
- Resource usage tracking

### 2. Scalability
- Batch processing support
- Connection pooling
- Cache warming capabilities
- Concurrent processing limits

### 3. Maintenance
- Cache cleanup routines
- TTL-based expiration
- Health check endpoints
- Graceful shutdown handling

### 4. Security
- API key management via environment
- No sensitive data in logs
- Secure MongoDB connections
- Input validation at all layers

## Command-Line Usage

### Basic Usage
```bash
python run_enhanced_import.py
```

### Advanced Options
```bash
# Disable AI classification
python run_enhanced_import.py --disable-ai

# Custom file paths
python run_enhanced_import.py -j data/drugs/Labels.json -s drug_label_schema.yaml

# Dry run mode
python run_enhanced_import.py --dry-run

# Verbose logging
python run_enhanced_import.py -v

# Custom MongoDB
python run_enhanced_import.py --mongo-uri mongodb://remote:27017/ --db-name production
```

## Summary Statistics

The import process provides comprehensive statistics:
- Documents inserted/updated/skipped/failed
- AI enhancement success/failure counts
- Validation error details
- Performance metrics
- Cache hit rates

## Future Enhancements

1. **Distributed Processing**: Support for parallel processing across multiple workers
2. **Real-time Monitoring**: Integration with monitoring services
3. **Advanced Caching**: Redis integration for distributed caching
4. **ML Model Versioning**: Track and manage different AI model versions
5. **Automated Retry Policies**: Configurable retry strategies per error type
6. **Circuit Breaker Improvements**: Service-specific circuit breakers
7. **Request Deduplication**: Prevent duplicate AI calls for identical content

## Conclusion

The implementation demonstrates production-grade reliability patterns suitable for medical data processing, with comprehensive error handling, graceful degradation, and extensive monitoring capabilities. The system is designed to be resilient, scalable, and maintainable while ensuring data integrity throughout the AI classification process.