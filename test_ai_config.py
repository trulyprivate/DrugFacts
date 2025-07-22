"""
Simple test script for AI classification configuration.
"""

from ai_classification.config import get_config, is_ai_enabled

# Test default configuration
config = get_config()
print("Default configuration:")
print(f"AI Model: {config['AI_MODEL']}")
print(f"Max Tokens: {config['AI_MAX_TOKENS']}")
print(f"Temperature: {config['AI_TEMPERATURE']}")
print(f"AI Enabled: {is_ai_enabled()}")