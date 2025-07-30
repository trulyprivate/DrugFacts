#!/bin/bash

# DDI Service API Test Script

BASE_URL="http://localhost:3002"

echo "Testing DDI Service API..."
echo "=========================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.'
echo -e "\n"

# Test severity levels
echo "2. Testing severity levels..."
curl -s "$BASE_URL/interactions/severity-levels" | jq '.'
echo -e "\n"

# Test mechanisms
echo "3. Testing mechanisms..."
curl -s "$BASE_URL/interactions/mechanisms" | jq '.'
echo -e "\n"

# Test drug search
echo "4. Testing drug search..."
curl -s "$BASE_URL/interactions/drugs/search?query=aspirin&limit=5" | jq '.'
echo -e "\n"

# Test interaction check
echo "5. Testing interaction check..."
curl -s -X POST "$BASE_URL/interactions/check" \
  -H "Content-Type: application/json" \
  -d '{"drugIds":["198440","11289"],"includeMinor":false}' | jq '.'
echo -e "\n"

echo "API test completed!"