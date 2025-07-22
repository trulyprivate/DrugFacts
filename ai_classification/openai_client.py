"""
OpenPipe AI client for therapeutic classification.

This module provides a client for interacting with the OpenPipe AI API,
handling authentication, request formatting, and response parsing.
"""

import time
import json
import threading
from typing import Dict, Any, Optional, List, Tuple
from collections import deque
from datetime import datetime, timedelta

from ai_classification.config import get_config
from ai_classification.logging_config import setup_logging

logger = setup_logging(__name__)

try:
    import openpipe
    from openpipe import OpenAI
    OPENPIPE_AVAILABLE = True
    logger.info("OpenPipe SDK available")
except ImportError:
    try:
        import openai
        from openai import OpenAI
        OPENPIPE_AVAILABLE = False
        logger.warning("OpenPipe module not available, falling back to OpenAI client. Install with 'pip install openpipe'")
    except ImportError:
        OPENPIPE_AVAILABLE = False
        logger.error("Neither OpenPipe nor OpenAI modules available. Install with 'pip install openpipe openai'")


class RateLimiter:
    """Simple rate limiter for API requests."""
    
    def __init__(self, max_requests: int = 60, time_window: int = 60):
        """
        Initialize rate limiter.
        
        Args:
            max_requests: Maximum requests allowed in time window
            time_window: Time window in seconds
        """
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
        self.lock = threading.Lock()
    
    def wait_if_needed(self):
        """Wait if rate limit would be exceeded."""
        with self.lock:
            now = datetime.now()
            
            # Remove old requests outside the time window
            while self.requests and (now - self.requests[0]).total_seconds() > self.time_window:
                self.requests.popleft()
            
            # Check if we need to wait
            if len(self.requests) >= self.max_requests:
                # Calculate wait time
                oldest_request = self.requests[0]
                wait_time = self.time_window - (now - oldest_request).total_seconds()
                
                if wait_time > 0:
                    logger.info(f"Rate limit reached, waiting {wait_time:.2f} seconds")
                    time.sleep(wait_time)
                    
                    # Remove the oldest request after waiting
                    self.requests.popleft()
            
            # Record this request
            self.requests.append(now)


class OpenPipeClient:
    """Client for interacting with OpenPipe AI API."""
    
    def __init__(self):
        """Initialize the OpenPipe AI client with configuration."""
        if not OPENPIPE_AVAILABLE:
            raise ImportError("OpenPipe or OpenAI module is required but not available. Install with 'pip install openpipe openai'")
            
        config = get_config()
        
        # Client configuration
        self.api_key = config['OPENPIPE_API_KEY']
        self.base_url = config['OPENPIPE_BASE_URL']
        self.model = config['AI_MODEL']
        self.max_tokens = config['AI_MAX_TOKENS']
        self.temperature = config['AI_TEMPERATURE']
        self.timeout = config['AI_REQUEST_TIMEOUT']
        self.max_retries = config['AI_MAX_RETRIES']
        
        # Rate limiting (60 requests per minute by default)
        self.rate_limiter = RateLimiter(max_requests=60, time_window=60)
        
        # Request statistics
        self.total_requests = 0
        self.total_tokens = 0
        self.total_cost = 0.0  # Placeholder for cost tracking
        
        # Initialize client with OpenPipe configuration
        if OPENPIPE_AVAILABLE:
            # Use OpenPipe SDK
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
                timeout=self.timeout,
                openpipe={
                    "tags": {
                        "prompt_id": "drug-classification-v1",
                        "environment": "production"
                    }
                }
            )
            logger.info(f"Initialized OpenPipe AI client with model: {self.model}")
        else:
            # Fallback to regular OpenAI client
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
                timeout=self.timeout
            )
            logger.info(f"Initialized fallback OpenAI client with model: {self.model}")
    
    def get_stats(self) -> Dict[str, Any]:
        """
        Get client usage statistics.
        
        Returns:
            Dict[str, Any]: Usage statistics
        """
        return {
            'total_requests': self.total_requests,
            'total_tokens': self.total_tokens,
            'total_cost': self.total_cost,
            'model': self.model
        }
    
    def get_classification(self, system_prompt: str, user_prompt: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Get therapeutic classification from OpenPipe AI.
        
        Args:
            system_prompt: System prompt for the AI
            user_prompt: User prompt containing drug information
            
        Returns:
            Tuple[Dict[str, Any], Dict[str, Any]]: Classification result and metadata
            
        Raises:
            ValueError: If the API request fails after retries
        """
        metadata = {
            'model': self.model,
            'tokens_used': 0,
            'processing_time': 0,
            'attempts': 0,
            'rate_limited': False
        }
        
        start_time = time.time()
        last_error = None
        
        # Implement retry logic with exponential backoff
        for attempt in range(1, self.max_retries + 1):
            metadata['attempts'] = attempt
            
            try:
                # Apply rate limiting
                rate_limit_start = time.time()
                self.rate_limiter.wait_if_needed()
                rate_limit_time = time.time() - rate_limit_start
                
                if rate_limit_time > 0.1:  # Log if we waited more than 100ms
                    metadata['rate_limited'] = True
                    logger.debug(f"Rate limited for {rate_limit_time:.2f}s")
                
                logger.info(f"Sending classification request to OpenPipe AI (attempt {attempt}/{self.max_retries})")
                
                # Make API request
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=self.max_tokens,
                    temperature=self.temperature,
                    response_format={"type": "json_object"}
                )
                
                # Extract response content
                content = response.choices[0].message.content
                
                # Parse JSON response
                try:
                    classification = json.loads(content)
                    
                    # Update metadata
                    tokens_used = getattr(response.usage, 'total_tokens', 0) if response.usage else 0
                    metadata['tokens_used'] = tokens_used
                    metadata['processing_time'] = time.time() - start_time
                    
                    # Update client statistics
                    self.total_requests += 1
                    self.total_tokens += tokens_used
                    
                    logger.info(f"Classification successful in {metadata['processing_time']:.2f}s "
                                f"using {tokens_used} tokens")
                    
                    return classification, metadata
                    
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse AI response as JSON: {e}")
                    logger.debug(f"Raw response content: {content[:500]}...")
                    last_error = ValueError(f"Invalid JSON response: {e}")
                    
            except Exception as e:
                # Handle both OpenPipe and OpenAI API errors
                error_type = str(type(e).__name__)
                if any(error_name in error_type for error_name in ['APIError', 'RateLimitError', 'APIConnectionError', 'Timeout']):
                    logger.warning(f"API error (attempt {attempt}/{self.max_retries}): {e}")
                    last_error = e
                    
                    # Special handling for rate limit errors
                    if 'RateLimitError' in error_type:
                        metadata['rate_limited'] = True
                        # Wait longer for rate limit errors
                        backoff_time = min(60, 2 ** attempt)  # Cap at 60 seconds
                        logger.info(f"Rate limited, waiting {backoff_time} seconds...")
                        time.sleep(backoff_time)
                        continue
                else:
                    logger.error(f"Unexpected error in OpenPipe AI request: {e}")
                    last_error = e
            
            # Exponential backoff before retry (except for rate limit errors handled above)
            if attempt < self.max_retries and not ('RateLimitError' in str(type(last_error))):
                backoff_time = min(30, 2 ** (attempt - 1))  # 1, 2, 4, 8, 16, 30, 30...
                logger.info(f"Retrying in {backoff_time} seconds...")
                time.sleep(backoff_time)
        
        # All retries failed
        metadata['processing_time'] = time.time() - start_time
        self.total_requests += 1  # Count failed requests too
        
        logger.error(f"Classification failed after {self.max_retries} attempts in {metadata['processing_time']:.2f}s")
        
        raise ValueError(f"Failed to get classification after {self.max_retries} attempts: {last_error}")