"""
Logging configuration for AI classification components.

This module sets up structured logging for the AI classification system,
ensuring consistent log format and appropriate log levels.
"""

import logging
import sys
from typing import Optional


def setup_logging(name: str = 'ai_classification', level: Optional[int] = None) -> logging.Logger:
    """
    Set up a logger with the specified name and level.
    
    Args:
        name: Logger name
        level: Logging level (defaults to INFO)
        
    Returns:
        logging.Logger: Configured logger
    """
    if level is None:
        level = logging.INFO
    
    logger = logging.getLogger(name)
    
    # Only configure if not already configured
    if not logger.handlers:
        logger.setLevel(level)
        
        # Create console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        
        # Create formatter
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        
        # Add handler to logger
        logger.addHandler(handler)
        
        # Prevent propagation to root logger
        logger.propagate = False
    
    return logger