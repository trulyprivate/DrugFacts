# AI Classification Package

This package provides AI-powered therapeutic classification capabilities for drug labels using OpenPipe AI and GPT-4 mini.

## Components

### OpenPipeClient

The `OpenPipeClient` class provides a robust wrapper around the OpenPipe AI API with the following features:

#### Features

- **OpenPipe SDK Integration**: Uses the OpenPipe Python SDK for enhanced functionality
- **Fallback Support**: Falls back to standard OpenAI client if OpenPipe SDK is unavailable
- **Rate Limiting**: Built-in rate limiting to prevent API quota exhaustion
- **Retry Logic**: Exponential backoff retry mechanism for transient failures
- **Usage Tracking**: Tracks requests, tokens, and costs
- **Error Handling**: Comprehensive error handling for various API error types

#### Rate Limiting

The client includes a `RateLimiter` class that:
- Limits requests to prevent hitting API rate limits
- Uses a sliding window approach
- Thread-safe for concurrent usage
- Configurable limits (default: 60 requests per minute)

#### Usage Example

```python
from ai_classification.openai_client import OpenPipeClient

# Initialize client (requires OPENPIPE_API_KEY environment variable)
client = OpenPipeClient()

# Get classification
system_prompt = "You are a pharmaceutical classification expert..."
user_prompt = "Classify this drug: ..."

try:
    classification, metadata = client.get_classification(system_prompt, user_prompt)
    print(f"Classification: {classification}")
    print(f"Tokens used: {metadata['tokens_used']}")
    print(f"Processing time: {metadata['processing_time']:.2f}s")
except ValueError as e:
    print(f"Classification failed: {e}")

# Get usage statistics
stats = client.get_stats()
print(f"Total requests: {stats['total_requests']}")
print(f"Total tokens: {stats['total_tokens']}")
```

#### Configuration

The client is configured via environment variables:

- `OPENPIPE_API_KEY`: OpenPipe API key (required)
- `OPENPIPE_BASE_URL`: API base URL (default: https://api.openpipe.ai/api/v1)
- `AI_MODEL`: Model to use (default: gpt-4o-mini)
- `AI_MAX_TOKENS`: Maximum tokens per request (default: 2000)
- `AI_TEMPERATURE`: Temperature setting (default: 0.1)
- `AI_REQUEST_TIMEOUT`: Request timeout in seconds (default: 30)
- `AI_MAX_RETRIES`: Maximum retry attempts (default: 3)

#### Error Handling

The client handles various error types:

- **API Errors**: Retries with exponential backoff
- **Rate Limit Errors**: Special handling with longer backoff
- **JSON Decode Errors**: Logs raw response for debugging
- **Connection Errors**: Retries with backoff
- **Timeout Errors**: Retries with backoff

#### Metadata

Each successful classification returns metadata:

```python
{
    'model': 'gpt-4o-mini',
    'tokens_used': 800,
    'processing_time': 1.5,
    'attempts': 1,
    'rate_limited': False
}
```

### DrugClassifier

The `DrugClassifier` class orchestrates the classification process:

- Integrates with `OpenPipeClient`
- Manages caching via `CacheManager`
- Builds prompts via `PromptManager`
- Validates responses via `ResponseValidator`
- Provides graceful fallbacks

### CacheManager

Provides MongoDB-based caching:

- Reduces redundant API calls
- Configurable TTL (default: 24 hours)
- Thread-safe operations
- Automatic cache key generation

### PromptManager

Handles prompt construction:

- Loads system prompt from file
- Extracts relevant content from drug labels
- Builds structured prompts for AI
- Cleans HTML content

### ResponseValidator

Validates and sanitizes AI responses:

- Ensures required fields are present
- Applies default values for missing fields
- Validates confidence levels
- Sanitizes response content

## Testing

Run the test suite:

```bash
python -m pytest tests/ai_classification/ -v
```

Run individual component tests:

```bash
python test_enhanced_openai_client.py
python test_drug_classifier.py
```

## Installation

Install required dependencies:

```bash
pip install -r requirements.txt
```

For OpenPipe SDK support:

```bash
pip install openpipe
```

## Environment Setup

Create a `.env` file with required configuration:

```bash
OPENPIPE_API_KEY=your_api_key_here
ENABLE_AI_CLASSIFICATION=true
AI_MODEL=gpt-4o-mini
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.1
```

## Integration

The AI classification system integrates with the existing `DrugLabelImporter`:

```python
from enhanced_drug_importer import EnhancedDrugLabelImporter

# Initialize enhanced importer
importer = EnhancedDrugLabelImporter()

# Process documents with AI enhancement
stats = importer.process_documents(drug_documents)

print(f"AI enhanced: {stats['ai_enhanced']}")
print(f"AI failed: {stats['ai_failed']}")
```

## Monitoring

The system provides comprehensive logging and statistics:

- Request/response logging
- Error tracking
- Performance metrics
- Usage statistics
- Cost tracking (placeholder)

Monitor logs for:
- Classification success/failure rates
- API response times
- Rate limiting events
- Error patterns