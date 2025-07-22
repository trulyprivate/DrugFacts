"""
Response validator for AI classification.

This module validates and sanitizes AI classification responses,
ensuring they conform to the expected schema.
"""

from typing import Dict, Any, List

from ai_classification.logging_config import setup_logging

logger = setup_logging(__name__)


class ResponseValidator:
    """Validator for AI classification responses."""
    
    def __init__(self):
        """Initialize the response validator."""
        pass
    
    def validate_classification_response(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and sanitize classification response.
        
        Args:
            response: Raw classification response
            
        Returns:
            Dict[str, Any]: Validated and sanitized response
        """
        # Define expected fields with default values
        expected_fields = {
            'primary_therapeutic_class': 'Not specified',
            'pharmacological_class': 'Not specified',
            'chemical_class': 'Not specified',
            'atc_code': 'Not specified',
            'controlled_substance_schedule': 'Not specified',
            'therapeutic_indication': 'Not specified',
            'mechanism_of_action_summary': 'Not specified',
            'confidence_level': 'Low',
            'source_sections_used': []
        }
        
        # Create validated response with defaults
        validated = expected_fields.copy()
        
        # Check if response is None or not a dict
        if not response or not isinstance(response, dict):
            logger.warning("Invalid response format: not a dictionary")
            return validated
        
        # Validate and sanitize each field
        for field, default in expected_fields.items():
            if field in response:
                if field == 'confidence_level':
                    # Validate confidence level
                    value = response[field]
                    if isinstance(value, str) and value in ('High', 'Medium', 'Low'):
                        validated[field] = value
                    else:
                        logger.warning(f"Invalid confidence level: {value}, using default: {default}")
                
                elif field == 'source_sections_used':
                    # Validate source sections
                    value = response[field]
                    if isinstance(value, list):
                        validated[field] = [str(item) for item in value if item]
                    else:
                        logger.warning(f"Invalid source sections: {value}, using default: {default}")
                
                else:
                    # Validate string fields
                    value = response[field]
                    if value is not None:
                        validated[field] = str(value).strip() or default
                    else:
                        validated[field] = default
            else:
                logger.warning(f"Missing field in response: {field}, using default: {default}")
        
        return validated
    
    def validate_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate and sanitize metadata.
        
        Args:
            metadata: Raw metadata
            
        Returns:
            Dict[str, Any]: Validated and sanitized metadata
        """
        # Define expected fields with default values
        expected_fields = {
            'model': 'unknown',
            'tokens_used': 0,
            'processing_time': 0,
            'attempts': 0,
            'cached': False
        }
        
        # Create validated metadata with defaults
        validated = expected_fields.copy()
        
        # Check if metadata is None or not a dict
        if not metadata or not isinstance(metadata, dict):
            logger.warning("Invalid metadata format: not a dictionary")
            return validated
        
        # Validate and sanitize each field
        for field, default in expected_fields.items():
            if field in metadata:
                if field == 'cached':
                    # Validate boolean field
                    validated[field] = bool(metadata[field])
                
                elif field in ('tokens_used', 'processing_time', 'attempts'):
                    # Validate numeric fields
                    try:
                        validated[field] = int(metadata[field])
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid {field}: {metadata[field]}, using default: {default}")
                
                else:
                    # Validate string fields
                    validated[field] = str(metadata[field]) if metadata[field] is not None else default
            else:
                logger.debug(f"Missing field in metadata: {field}, using default: {default}")
        
        return validated