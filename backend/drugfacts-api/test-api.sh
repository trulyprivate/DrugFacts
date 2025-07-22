#!/bin/bash

# Test script for the NestJS backend API

echo "Testing DrugFacts NestJS Backend API..."
echo ""

# Base URL
BASE_URL="http://localhost:3001"

# 1. Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | json_pp
echo ""

# 2. Test drugs list endpoint
echo "2. Testing drugs list endpoint (limit=5)..."
curl -s "$BASE_URL/api/drugs?limit=5" | json_pp
echo ""

# 3. Test drugs index format endpoint
echo "3. Testing drugs index format endpoint..."
curl -s "$BASE_URL/api/drugs/index" | head -n 50
echo ""

# 4. Test therapeutic classes endpoint
echo "4. Testing therapeutic classes endpoint..."
curl -s "$BASE_URL/api/drugs/therapeutic-classes" | json_pp
echo ""

# 5. Test manufacturers endpoint
echo "5. Testing manufacturers endpoint..."
curl -s "$BASE_URL/api/drugs/manufacturers" | json_pp
echo ""

# 6. Test count endpoint
echo "6. Testing count endpoint..."
curl -s "$BASE_URL/api/drugs/count" | json_pp
echo ""

# 7. Test search functionality
echo "7. Testing search functionality (q=aspirin)..."
curl -s "$BASE_URL/api/drugs?q=aspirin&limit=3" | json_pp
echo ""

# 8. Test get drug by slug (if you have a known slug)
echo "8. Testing get drug by slug (example: mounjaro)..."
curl -s "$BASE_URL/api/drugs/mounjaro" | head -n 50
echo ""

echo "API testing complete!"