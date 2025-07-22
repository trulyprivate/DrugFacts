"""
Test script for enhanced OpenPipe AI client.
"""

import os
import json
from ai_classification.openai_client import OpenPipeClient, RateLimiter


def test_rate_limiter():
    """Test the rate limiter functionality."""
    print("Testing Rate Limiter...")
    
    # Create a rate limiter that allows 3 requests per 2 seconds
    limiter = RateLimiter(max_requests=3, time_window=2)
    
    print("Making 3 requests (should be fast)...")
    import time
    
    for i in range(3):
        start = time.time()
        limiter.wait_if_needed()
        elapsed = time.time() - start
        print(f"  Request {i+1}: {elapsed:.3f}s wait")
    
    print("Making 4th request (should wait)...")
    start = time.time()
    limiter.wait_if_needed()
    elapsed = time.time() - start
    print(f"  Request 4: {elapsed:.3f}s wait")
    
    print("Rate limiter test completed.\n")


def test_openai_client():
    """Test the OpenPipe AI client."""
    print("Testing OpenPipe AI Client...")
    
    # Set dummy API key for testing initialization
    if not os.environ.get('OPENPIPE_API_KEY'):
        os.environ['OPENPIPE_API_KEY'] = 'dummy-key-for-testing'
    
    try:
        # Initialize client
        client = OpenPipeClient()
        print(f"✓ Client initialized successfully")
        print(f"  Model: {client.model}")
        print(f"  Max tokens: {client.max_tokens}")
        print(f"  Temperature: {client.temperature}")
        print(f"  Max retries: {client.max_retries}")
        
        # Test statistics
        stats = client.get_stats()
        print(f"✓ Initial stats: {stats}")
        
        # Test with dummy prompts (will fail but should handle gracefully)
        system_prompt = "You are a pharmaceutical classification expert."
        user_prompt = """
        **Drug Information:**
        **Drug Name:** Test Drug
        **Generic Name:** test-generic
        **Label Content:** This is a test drug for classification.
        
        Please provide therapeutic classification in JSON format.
        """
        
        print("Attempting classification (expected to fail with dummy API key)...")
        try:
            classification, metadata = client.get_classification(system_prompt, user_prompt)
            print(f"✓ Classification successful: {classification}")
            print(f"✓ Metadata: {metadata}")
        except Exception as e:
            print(f"✗ Classification failed as expected: {e}")
            print("  This is normal with a dummy API key")
        
        # Test final statistics
        final_stats = client.get_stats()
        print(f"✓ Final stats: {final_stats}")
        
    except ImportError as e:
        print(f"✗ Client initialization failed: {e}")
        print("  This is expected if OpenPipe/OpenAI modules are not available")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
    
    print("OpenPipe AI client test completed.\n")


def main():
    """Run all tests."""
    print("Enhanced OpenPipe AI Client Test Suite")
    print("=" * 50)
    
    test_rate_limiter()
    test_openai_client()
    
    print("All tests completed!")


if __name__ == "__main__":
    main()