"""
Configuration module for AI classification components.

This module handles loading and validating configuration from environment variables
and provides default values for the AI classification system.
"""

import os
from typing import Dict, Any, Optional
import logging

# Default configuration values
DEFAULT_CONFIG = {
    # OpenPipe AI configuration
    'OPENPIPE_API_KEY': '',  # Must be provided via env var
    'OPENPIPE_BASE_URL': 'https://api.openpipe.ai/api/v1',
    'AI_MODEL': 'gpt-4o-mini',
    'AI_MAX_TOKENS': 2000,
    'AI_TEMPERATURE': 0.1,
    
    # Feature flags
    'ENABLE_AI_CLASSIFICATION': True,
    
    # Cache configuration
    'AI_CLASSIFICATION_CACHE_TTL': 86400,  # 24 hours in seconds
    
    # Request configuration
    'AI_REQUEST_TIMEOUT': 30,  # seconds
    'AI_MAX_RETRIES': 3,
    
    # System prompt configuration
    'SYSTEM_PROMPT_PATH': 'drug_label_extracation_system_prompt.md',
}


def get_config() -> Dict[str, Any]:
    """
    Load configuration from environment variables with fallback to defaults.
    
    Returns:
        Dict[str, Any]: Configuration dictionary
    """
    config = DEFAULT_CONFIG.copy()
    
    # Load configuration from environment variables
    for key in config:
        env_value = os.environ.get(key)
        if env_value is not None:
            # Convert boolean strings
            if env_value.lower() in ('true', 'yes', '1'):
                config[key] = True
            elif env_value.lower() in ('false', 'no', '0'):
                config[key] = False
            # Convert numeric values
            elif key in ('AI_MAX_TOKENS', 'AI_CLASSIFICATION_CACHE_TTL', 'AI_REQUEST_TIMEOUT', 'AI_MAX_RETRIES'):
                try:
                    config[key] = int(env_value)
                except ValueError:
                    logging.warning(f"Invalid integer value for {key}: {env_value}, using default: {config[key]}")
            elif key == 'AI_TEMPERATURE':
                try:
                    config[key] = float(env_value)
                except ValueError:
                    logging.warning(f"Invalid float value for {key}: {env_value}, using default: {config[key]}")
            else:
                config[key] = env_value
    
    # Validate required configuration
    if not config['ENABLE_AI_CLASSIFICATION']:
        return config
    
    if not config['OPENPIPE_API_KEY']:
        logging.warning("OPENPIPE_API_KEY not provided. AI classification will be disabled.")
        config['ENABLE_AI_CLASSIFICATION'] = False
    
    return config


def is_ai_enabled() -> bool:
    """
    Check if AI classification is enabled.
    
    Returns:
        bool: True if AI classification is enabled, False otherwise
    """
    return get_config()['ENABLE_AI_CLASSIFICATION']