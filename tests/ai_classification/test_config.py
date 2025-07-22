"""
Tests for AI classification configuration.
"""

import os
import unittest
from unittest.mock import patch

from ai_classification.config import get_config, is_ai_enabled


class TestConfig(unittest.TestCase):
    """Test cases for AI classification configuration."""
    
    def test_default_config(self):
        """Test default configuration values."""
        config = get_config()
        
        # Check default values
        self.assertEqual(config['AI_MODEL'], 'gpt-4o-mini')
        self.assertEqual(config['AI_MAX_TOKENS'], 2000)
        self.assertEqual(config['AI_TEMPERATURE'], 0.1)
        self.assertEqual(config['AI_MAX_RETRIES'], 3)
    
    @patch.dict(os.environ, {
        'OPENPIPE_API_KEY': 'test-api-key',
        'AI_MODEL': 'custom-model',
        'AI_MAX_TOKENS': '1000',
        'AI_TEMPERATURE': '0.5'
    })
    def test_environment_override(self):
        """Test environment variable overrides."""
        config = get_config()
        
        # Check overridden values
        self.assertEqual(config['OPENPIPE_API_KEY'], 'test-api-key')
        self.assertEqual(config['AI_MODEL'], 'custom-model')
        self.assertEqual(config['AI_MAX_TOKENS'], 1000)
        self.assertEqual(config['AI_TEMPERATURE'], 0.5)
    
    @patch.dict(os.environ, {'ENABLE_AI_CLASSIFICATION': 'false'})
    def test_ai_disabled(self):
        """Test AI classification disabled."""
        self.assertFalse(is_ai_enabled())
    
    @patch.dict(os.environ, {
        'ENABLE_AI_CLASSIFICATION': 'true',
        'OPENPIPE_API_KEY': 'test-api-key'
    })
    def test_ai_enabled(self):
        """Test AI classification enabled."""
        self.assertTrue(is_ai_enabled())
    
    @patch.dict(os.environ, {'ENABLE_AI_CLASSIFICATION': 'true'})
    def test_ai_disabled_without_api_key(self):
        """Test AI classification disabled without API key."""
        # Clear API key
        with patch.dict(os.environ, {'OPENPIPE_API_KEY': ''}):
            self.assertFalse(is_ai_enabled())


if __name__ == '__main__':
    unittest.main()