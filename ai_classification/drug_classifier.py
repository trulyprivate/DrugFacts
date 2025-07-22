"""
Drug classifier for therapeutic classification.

This module coordinates the AI classification process, including
prompt building, API calls, response validation, and caching.
"""

import time
from typing import Dict, Any, Optional, Tuple

from ai_classification.config import get_config, is_ai_enabled
from ai_classification.openai_client import OpenPipeClient, OPENPIPE_AVAILABLE
from ai_classification.prompt_manager import PromptManager
from ai_classification.response_validator import ResponseValidator
from ai_classification.cache_manager import CacheManager
from ai_classification.logging_config import setup_logging

logger = setup_logging(__name__)


class DrugClassifier:
    """Classifier for drug therapeutic classification."""
    
    def __init__(self):
        """Initialize the drug classifier."""
        self.config = get_config()
        self.prompt_manager = PromptManager()
        self.response_validator = ResponseValidator()
        self.cache_manager = CacheManager()
        
        # Initialize OpenPipe client if available and enabled
        self.openai_client = None
        if is_ai_enabled() and OPENPIPE_AVAILABLE:
            try:
                self.openai_client = OpenPipeClient()
            except ImportError as e:
                logger.warning(f"Failed to initialize OpenPipe client: {e}")
        
        logger.info("Initialized drug classifier")
    
    def classify_drug(self, drug_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify drug therapeutic class.
        
        Args:
            drug_data: Drug data dictionary
            
        Returns:
            Dict[str, Any]: Classification result with metadata
        """
        # Check if AI classification is enabled
        if not is_ai_enabled():
            logger.info("AI classification is disabled")
            return self._get_empty_result()
        
        # Check if OpenPipe client is available
        if not self.openai_client:
            logger.warning("OpenPipe client not available")
            return self._get_empty_result()
        
        start_time = time.time()
        
        try:
            # Generate cache key
            cache_key = self.cache_manager.generate_cache_key(drug_data)
            
            # Check cache
            cached_result = self.cache_manager.get_cached_classification(cache_key)
            if cached_result:
                logger.info(f"Using cached classification for {drug_data.get('drugName', 'Unknown')}")
                return cached_result
            
            # Build prompts
            system_prompt = self.prompt_manager.get_system_prompt()
            user_prompt = self.prompt_manager.build_classification_prompt(drug_data)
            
            # Get classification from OpenPipe AI
            classification, metadata = self.openai_client.get_classification(system_prompt, user_prompt)
            
            # Validate response
            validated_classification = self.response_validator.validate_classification_response(classification)
            validated_metadata = self.response_validator.validate_metadata(metadata)
            
            # Add processing time if not in metadata
            if 'processing_time' not in validated_metadata:
                validated_metadata['processing_time'] = time.time() - start_time
            
            # Store in cache
            self.cache_manager.store_classification(cache_key, validated_classification, validated_metadata)
            
            # Prepare result
            result = {
                'classification': validated_classification,
                'metadata': validated_metadata,
                'cached': False
            }
            
            logger.info(f"Successfully classified {drug_data.get('drugName', 'Unknown')} "
                       f"as {validated_classification.get('primary_therapeutic_class', 'Unknown')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            
            # Return empty result on failure
            empty_result = self._get_empty_result()
            empty_result['metadata']['processing_time'] = time.time() - start_time
            empty_result['metadata']['error'] = str(e)
            
            return empty_result
    
    def _get_empty_result(self) -> Dict[str, Any]:
        """
        Get empty classification result.
        
        Returns:
            Dict[str, Any]: Empty classification result
        """
        return {
            'classification': {
                'primary_therapeutic_class': 'Not specified',
                'pharmacological_class': 'Not specified',
                'chemical_class': 'Not specified',
                'atc_code': 'Not specified',
                'controlled_substance_schedule': 'Not specified',
                'therapeutic_indication': 'Not specified',
                'mechanism_of_action_summary': 'Not specified',
                'confidence_level': 'Low',
                'source_sections_used': []
            },
            'metadata': {
                'model': 'none',
                'tokens_used': 0,
                'processing_time': 0,
                'attempts': 0,
                'cached': False,
                'error': None
            },
            'cached': False
        }