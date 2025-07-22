"""
Simple test script for OpenPipe AI client.
"""

import os
from ai_classification.openai_client import OpenPipeClient

# Check if API key is set
api_key = os.environ.get('OPENPIPE_API_KEY')
if not api_key:
    print("Warning: OPENPIPE_API_KEY environment variable not set.")
    print("Setting a dummy API key for testing initialization only.")
    os.environ['OPENPIPE_API_KEY'] = 'dummy-api-key'

# Initialize client
try:
    client = OpenPipeClient()
    print("OpenPipeClient initialized successfully.")
    print(f"Using model: {client.model}")
    print(f"Max tokens: {client.max_tokens}")
    print(f"Temperature: {client.temperature}")
except Exception as e:
    print(f"Error initializing OpenPipeClient: {e}")