"""
Tests for OpenPipe AI client wrapper.
"""

import unittest
import time
import json
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime, timedelta

from ai_classification.openai_client import OpenPipeClient, RateLimiter


class TestRateLimiter(unittest.TestCase):
    """Test cases for RateLimiter class."""
    
    def test_rate_limiter_initialization(self):
        """Test rate limiter initialization."""
        limiter = RateLimiter(max_requests=10, time_window=60)
        self.assertEqual(limiter.max_requests, 10)
        self.assertEqual(limiter.time_window, 60)
        self.assertEqual(len(limiter.requests), 0)
    
    def test_rate_limiter_allows_requests_under_limit(self):
        """Test that rate limiter allows requests under the limit."""
        limiter = RateLimiter(max_requests=5, time_window=60)
        
        # Should allow requests under the limit
        for _ in range(5):
            start_time = time.time()
            limiter.wait_if_needed()
            elapsed = time.time() - start_time
            self.assertLess(elapsed, 0.1)  # Should not wait
    
    def test_rate_limiter_blocks_requests_over_limit(self):
        """Test that rate limiter blocks requests over the limit."""
        limiter = RateLimiter(max_requests=2, time_window=1)
        
        # Fill up the rate limit
        limiter.wait_if_needed()
        limiter.wait_if_needed()
        
        # This should cause a wait
        start_time = time.time()
        limiter.wait_if_needed()
        elapsed = time.time() - start_time
        self.assertGreater(elapsed, 0.5)  # Should wait at least 0.5 seconds
    
    def test_rate_limiter_clears_old_requests(self):
        """Test that rate limiter clears old requests."""
        limiter = RateLimiter(max_requests=2, time_window=1)
        
        # Add requests and wait for them to expire
        limiter.wait_if_needed()
        limiter.wait_if_needed()
        
        # Wait for time window to pass
        time.sleep(1.1)
        
        # Should allow new requests without waiting
        start_time = time.time()
        limiter.wait_if_needed()
        elapsed = time.time() - start_time
        self.assertLess(elapsed, 0.1)


class TestOpenPipeClient(unittest.TestCase):
    """Test cases for OpenPipeClient class."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Mock configuration
        self.mock_config = {
            'OPENPIPE_API_KEY': 'test-api-key',
            'OPENPIPE_BASE_URL': 'https://api.openpipe.ai/api/v1',
            'AI_MODEL': 'gpt-4o-mini',
            'AI_MAX_TOKENS': 2000,
            'AI_TEMPERATURE': 0.1,
            'AI_REQUEST_TIMEOUT': 30,
            'AI_MAX_RETRIES': 3
        }
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', True)
    @patch('ai_classification.openai_client.OpenAI')
    def test_client_initialization_with_openpipe(self, mock_openai, mock_get_config):
        """Test client initialization with OpenPipe SDK."""
        mock_get_config.return_value = self.mock_config
        mock_client_instance = Mock()
        mock_openai.return_value = mock_client_instance
        
        client = OpenPipeClient()
        
        # Verify configuration
        self.assertEqual(client.api_key, 'test-api-key')
        self.assertEqual(client.model, 'gpt-4o-mini')
        self.assertEqual(client.max_tokens, 2000)
        self.assertEqual(client.temperature, 0.1)
        
        # Verify OpenAI client was initialized with OpenPipe config
        mock_openai.assert_called_once_with(
            api_key='test-api-key',
            base_url='https://api.openpipe.ai/api/v1',
            timeout=30,
            openpipe={
                "tags": {
                    "prompt_id": "drug-classification-v1",
                    "environment": "production"
                }
            }
        )
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', False)
    @patch('ai_classification.openai_client.OpenAI')
    def test_client_initialization_fallback(self, mock_openai, mock_get_config):
        """Test client initialization with fallback to OpenAI."""
        mock_get_config.return_value = self.mock_config
        mock_client_instance = Mock()
        mock_openai.return_value = mock_client_instance
        
        client = OpenPipeClient()
        
        # Verify OpenAI client was initialized without OpenPipe config
        mock_openai.assert_called_once_with(
            api_key='test-api-key',
            base_url='https://api.openpipe.ai/api/v1',
            timeout=30
        )
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', False)
    def test_client_initialization_no_modules(self, mock_get_config):
        """Test client initialization fails when no modules available."""
        mock_get_config.return_value = self.mock_config
        
        with patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', False):
            with self.assertRaises(ImportError):
                OpenPipeClient()
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', True)
    @patch('ai_classification.openai_client.OpenAI')
    def test_get_stats(self, mock_openai, mock_get_config):
        """Test getting client statistics."""
        mock_get_config.return_value = self.mock_config
        mock_openai.return_value = Mock()
        
        client = OpenPipeClient()
        client.total_requests = 10
        client.total_tokens = 5000
        client.total_cost = 2.50
        
        stats = client.get_stats()
        
        expected_stats = {
            'total_requests': 10,
            'total_tokens': 5000,
            'total_cost': 2.50,
            'model': 'gpt-4o-mini'
        }
        
        self.assertEqual(stats, expected_stats)
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', True)
    @patch('ai_classification.openai_client.OpenAI')
    def test_successful_classification(self, mock_openai, mock_get_config):
        """Test successful classification request."""
        mock_get_config.return_value = self.mock_config
        
        # Mock successful API response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = json.dumps({
            'primary_therapeutic_class': 'Antidiabetic Agents',
            'pharmacological_class': 'GLP-1 Receptor Agonists',
            'confidence_level': 'High'
        })
        mock_response.usage.total_tokens = 800
        
        mock_client_instance = Mock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client_instance
        
        client = OpenPipeClient()
        
        # Test classification
        system_prompt = "Test system prompt"
        user_prompt = "Test user prompt"
        
        classification, metadata = client.get_classification(system_prompt, user_prompt)
        
        # Verify response
        self.assertEqual(classification['primary_therapeutic_class'], 'Antidiabetic Agents')
        self.assertEqual(classification['pharmacological_class'], 'GLP-1 Receptor Agonists')
        self.assertEqual(classification['confidence_level'], 'High')
        
        # Verify metadata
        self.assertEqual(metadata['model'], 'gpt-4o-mini')
        self.assertEqual(metadata['tokens_used'], 800)
        self.assertEqual(metadata['attempts'], 1)
        self.assertGreater(metadata['processing_time'], 0)
        
        # Verify API call
        mock_client_instance.chat.completions.create.assert_called_once_with(
            model='gpt-4o-mini',
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=2000,
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        
        # Verify statistics updated
        self.assertEqual(client.total_requests, 1)
        self.assertEqual(client.total_tokens, 800)
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', True)
    @patch('ai_classification.openai_client.OpenAI')
    def test_json_decode_error(self, mock_openai, mock_get_config):
        """Test handling of JSON decode errors."""
        mock_get_config.return_value = self.mock_config
        
        # Mock response with invalid JSON
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "Invalid JSON response"
        mock_response.usage.total_tokens = 100
        
        mock_client_instance = Mock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client_instance
        
        client = OpenPipeClient()
        
        # Should raise ValueError after retries
        with self.assertRaises(ValueError) as context:
            client.get_classification("system", "user")
        
        self.assertIn("Invalid JSON response", str(context.exception))
        
        # Should have attempted all retries
        self.assertEqual(mock_client_instance.chat.completions.create.call_count, 3)
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', True)
    @patch('ai_classification.openai_client.OpenAI')
    @patch('time.sleep')  # Mock sleep to speed up tests
    def test_api_error_retry(self, mock_sleep, mock_openai, mock_get_config):
        """Test retry logic for API errors."""
        mock_get_config.return_value = self.mock_config
        
        # Mock API error
        api_error = Exception("APIError: Rate limit exceeded")
        api_error.__class__.__name__ = "APIError"
        
        mock_client_instance = Mock()
        mock_client_instance.chat.completions.create.side_effect = api_error
        mock_openai.return_value = mock_client_instance
        
        client = OpenPipeClient()
        
        # Should raise ValueError after retries
        with self.assertRaises(ValueError) as context:
            client.get_classification("system", "user")
        
        self.assertIn("Failed to get classification after 3 attempts", str(context.exception))
        
        # Should have attempted all retries
        self.assertEqual(mock_client_instance.chat.completions.create.call_count, 3)
        
        # Should have slept between retries (exponential backoff)
        expected_sleep_calls = [unittest.mock.call(1), unittest.mock.call(2)]
        mock_sleep.assert_has_calls(expected_sleep_calls)
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', True)
    @patch('ai_classification.openai_client.OpenAI')
    @patch('time.sleep')  # Mock sleep to speed up tests
    def test_rate_limit_error_handling(self, mock_sleep, mock_openai, mock_get_config):
        """Test special handling for rate limit errors."""
        mock_get_config.return_value = self.mock_config
        
        # Mock rate limit error
        rate_limit_error = Exception("RateLimitError: Too many requests")
        rate_limit_error.__class__.__name__ = "RateLimitError"
        
        mock_client_instance = Mock()
        mock_client_instance.chat.completions.create.side_effect = rate_limit_error
        mock_openai.return_value = mock_client_instance
        
        client = OpenPipeClient()
        
        # Should raise ValueError after retries
        with self.assertRaises(ValueError):
            client.get_classification("system", "user")
        
        # Should have attempted all retries
        self.assertEqual(mock_client_instance.chat.completions.create.call_count, 3)
        
        # Should have used longer backoff for rate limit errors
        sleep_calls = mock_sleep.call_args_list
        self.assertTrue(any(call[0][0] >= 2 for call in sleep_calls))  # At least one call >= 2 seconds
    
    @patch('ai_classification.openai_client.get_config')
    @patch('ai_classification.openai_client.OPENPIPE_AVAILABLE', True)
    @patch('ai_classification.openai_client.OpenAI')
    def test_rate_limiter_integration(self, mock_openai, mock_get_config):
        """Test rate limiter integration."""
        mock_get_config.return_value = self.mock_config
        
        # Mock successful response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = json.dumps({'test': 'response'})
        mock_response.usage.total_tokens = 100
        
        mock_client_instance = Mock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client_instance
        
        client = OpenPipeClient()
        
        # Mock rate limiter to simulate waiting
        with patch.object(client.rate_limiter, 'wait_if_needed') as mock_wait:
            mock_wait.side_effect = lambda: time.sleep(0.2)  # Simulate 200ms wait
            
            classification, metadata = client.get_classification("system", "user")
            
            # Should have called rate limiter
            mock_wait.assert_called_once()
            
            # Should indicate rate limiting in metadata
            self.assertTrue(metadata['rate_limited'])


if __name__ == '__main__':
    unittest.main()