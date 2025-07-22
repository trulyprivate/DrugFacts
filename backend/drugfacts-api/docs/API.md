# DrugFacts API Documentation

Complete API reference for the DrugFacts NestJS backend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, the API is open and does not require authentication. In production, you should implement proper authentication using JWT tokens or API keys.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "data": { ... },
  "pagination": { ... }  // Only for paginated endpoints
}
```

### Error Response
```json
{
  "statusCode": 400,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": { ... },  // Optional additional error details
  "timestamp": "2024-01-20T10:30:00.000Z",
  "path": "/api/drugs/invalid-slug",
  "method": "GET"
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Duplicate resource |
| `DATABASE_ERROR` | 400 | Database operation failed |
| `AI_SERVICE_ERROR` | 503 | AI service unavailable |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNKNOWN_ERROR` | 500 | Internal server error |

## Endpoints

### 1. Search Drugs

Search for drugs by name, generic name, active ingredient, therapeutic class, or manufacturer.

```http
GET /api/drugs
```

#### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `q` | string | No | Search query | - |
| `therapeuticClass` | string | No | Filter by therapeutic class | - |
| `manufacturer` | string | No | Filter by manufacturer | - |
| `page` | number | No | Page number (min: 1) | 1 |
| `limit` | number | No | Results per page (1-100) | 50 |
| `searchType` | string | No | Search algorithm: 'weighted', 'text', or 'standard' | 'weighted' |

#### Search Types

- **weighted** (default): Prioritizes drug names over other fields, best for finding specific drugs
  - Exact drug name matches score highest
  - Partial drug name matches next
  - Generic name, active ingredient, indications, and other fields follow
  - Ideal for searches like "aspirin" or "diabetes medication"

- **text**: Uses MongoDB's full-text search with pre-configured weights
  - Faster for large datasets
  - Less flexible than weighted search
  - Good for general searches across all fields

- **standard**: Simple regex search across all fields
  - No prioritization
  - Includes indicationsAndUsage field
  - Good for finding drugs by conditions or symptoms

#### Example Requests

Search for a specific drug:
```bash
curl -X GET "http://localhost:3001/api/drugs?q=aspirin&searchType=weighted&limit=10"
```

Search for drugs by condition:
```bash
curl -X GET "http://localhost:3001/api/drugs?q=diabetes&searchType=weighted&limit=10"
```

Fast text search:
```bash
curl -X GET "http://localhost:3001/api/drugs?q=insulin&searchType=text&limit=10"
```

#### Example Response

```json
{
  "data": [
    {
      "drugName": "Aspirin",
      "genericName": "aspirin",
      "activeIngredient": "Aspirin 325 mg",
      "therapeuticClass": "Nonsteroidal Anti-inflammatory Drug",
      "manufacturer": "Bayer Healthcare LLC",
      "slug": "aspirin-325mg-bayer",
      "setId": "f9b93d7e-1234-5678-90ab-cdef12345678"
    },
    {
      "drugName": "Aspirin Low Dose",
      "genericName": "aspirin",
      "activeIngredient": "Aspirin 81 mg",
      "therapeuticClass": "Nonsteroidal Anti-inflammatory Drug",
      "manufacturer": "CVS Pharmacy",
      "slug": "aspirin-81mg-cvs",
      "setId": "a1b2c3d4-5678-90ab-cdef-123456789012"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 2. Get Drug Details

Get comprehensive information about a specific drug.

```http
GET /api/drugs/:slug
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Drug slug identifier |

#### Example Request

```bash
curl -X GET "http://localhost:3001/api/drugs/aspirin-325mg-bayer"
```

#### Example Response

```json
{
  "data": {
    "drugName": "Aspirin",
    "genericName": "aspirin",
    "activeIngredient": "Aspirin 325 mg",
    "boxedWarning": null,
    "warnings": "Reye's syndrome: Children and teenagers who have or are recovering from chicken pox or flu-like symptoms should not use this product...",
    "precautions": "Ask a doctor before use if stomach bleeding warning applies to you...",
    "adverseReactions": "Stop use and ask a doctor if you experience any of the following signs of stomach bleeding...",
    "drugInteractions": "Ask a doctor or pharmacist before use if you are taking a prescription drug for anticoagulation...",
    "contraindications": "Do not use if you have ever had an allergic reaction to aspirin or any other pain reliever/fever reducer",
    "indicationsAndUsage": "temporarily relieves minor aches and pains due to: headache, toothache, backache, menstrual cramps...",
    "dosageAndAdministration": "Adults and children 12 years and over: take 1 or 2 tablets every 4 hours while symptoms persist...",
    "overdosage": "In case of overdose, get medical help or contact a Poison Control Center right away",
    "description": "Active ingredient (in each tablet): Aspirin 325 mg (NSAID)*",
    "clinicalPharmacology": "Aspirin is a nonsteroidal anti-inflammatory drug (NSAID) that works by reducing substances in the body...",
    "nonClinicalToxicology": null,
    "clinicalStudies": null,
    "howSupplied": "White, round tablets imprinted with 'ASP 325' supplied in bottles of 100 and 500 tablets",
    "patientCounseling": "Patients should be informed of the following information...",
    "principalDisplayPanel": null,
    "spl": null,
    "setId": "f9b93d7e-1234-5678-90ab-cdef12345678",
    "therapeuticClass": "Nonsteroidal Anti-inflammatory Drug",
    "dea": null,
    "manufacturer": "Bayer Healthcare LLC",
    "slug": "aspirin-325mg-bayer"
  }
}
```

### 3. Get All Drugs (Index Format)

Get a list of all drugs in a simplified index format.

```http
GET /api/drugs/index
```

#### Example Request

```bash
curl -X GET "http://localhost:3001/api/drugs/index"
```

#### Example Response

```json
[
  {
    "drugName": "Aspirin",
    "setId": "f9b93d7e-1234-5678-90ab-cdef12345678",
    "slug": "aspirin-325mg-bayer",
    "labeler": "Bayer Healthcare LLC",
    "label": {
      "genericName": "aspirin",
      "labelerName": "Bayer Healthcare LLC",
      "productType": "HUMAN PRESCRIPTION DRUG LABEL"
    },
    "therapeuticClass": "Nonsteroidal Anti-inflammatory Drug",
    "manufacturer": "Bayer Healthcare LLC"
  }
]
```

### 4. List Therapeutic Classes

Get a list of all unique therapeutic classes.

```http
GET /api/drugs/therapeutic-classes
```

#### Example Request

```bash
curl -X GET "http://localhost:3001/api/drugs/therapeutic-classes"
```

#### Example Response

```json
{
  "data": [
    "Analgesics",
    "Antibiotics",
    "Antidepressants",
    "Antidiabetic Agents",
    "Antihistamines",
    "Antihypertensive Agents",
    "Cardiovascular Agents",
    "Gastrointestinal Agents",
    "Nonsteroidal Anti-inflammatory Drug",
    "Respiratory Agents"
  ]
}
```

### 5. List Manufacturers

Get a list of all unique drug manufacturers.

```http
GET /api/drugs/manufacturers
```

#### Example Request

```bash
curl -X GET "http://localhost:3001/api/drugs/manufacturers"
```

#### Example Response

```json
{
  "data": [
    "Abbott Laboratories",
    "Bayer Healthcare LLC",
    "CVS Pharmacy",
    "Johnson & Johnson",
    "Merck & Co., Inc.",
    "Novartis Pharmaceuticals",
    "Pfizer Inc.",
    "Roche Pharmaceuticals",
    "Sanofi-Aventis",
    "Teva Pharmaceuticals"
  ]
}
```

### 6. Get Drug Count

Get the total number of drugs in the database.

```http
GET /api/drugs/count
```

#### Example Request

```bash
curl -X GET "http://localhost:3001/api/drugs/count"
```

#### Example Response

```json
{
  "count": 15423
}
```

### 7. Health Check

Check the overall health status of the API.

```http
GET /health
```

#### Example Request

```bash
curl -X GET "http://localhost:3001/health"
```

#### Example Response

```json
{
  "status": "ok",
  "info": {
    "mongodb": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "used": 85983232,
      "threshold": 314572800
    },
    "memory_rss": {
      "status": "up",
      "used": 142606336,
      "threshold": 314572800
    }
  },
  "error": {},
  "details": {
    "mongodb": {
      "status": "up"
    },
    "memory_heap": {
      "status": "up",
      "used": 85983232,
      "threshold": 314572800
    },
    "memory_rss": {
      "status": "up",
      "used": 142606336,
      "threshold": 314572800
    }
  }
}
```

### 8. Liveness Check

Check if the application is alive (for Kubernetes).

```http
GET /health/liveness
```

### 9. Readiness Check

Check if the application is ready to serve requests (for Kubernetes).

```http
GET /health/readiness
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Window**: 15 minutes
- **Max Requests**: 100 per window
- **Headers**: Standard rate limit headers are included in responses

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705750800000
```

When rate limit is exceeded:

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Too many requests from this IP, please try again later."
}
```

## Caching

The API uses aggressive caching to improve performance:

| Endpoint | Cache Duration | Cache Level |
|----------|---------------|-------------|
| `/api/drugs` | 5 minutes | Memory + Redis |
| `/api/drugs/:slug` | 1 hour | Memory + Redis |
| `/api/drugs/therapeutic-classes` | 24 hours | Memory + Redis |
| `/api/drugs/manufacturers` | 24 hours | Memory + Redis |

Cache headers are included in responses:

```
Cache-Control: public, max-age=3600
```

## Best Practices

### 1. Use Pagination

Always use pagination for listing endpoints to avoid large responses:

```bash
# Good
GET /api/drugs?limit=20&page=1

# Bad
GET /api/drugs?limit=1000
```

### 2. Use Specific Queries

Be as specific as possible with search queries:

```bash
# Good - specific search
GET /api/drugs?q=aspirin&therapeuticClass=Analgesics

# Less optimal - broad search
GET /api/drugs?q=a
```

### 3. Handle Errors Gracefully

Always check for error responses and handle them appropriately:

```javascript
try {
  const response = await fetch('/api/drugs/invalid-slug');
  const data = await response.json();
  
  if (!response.ok) {
    console.error(`Error ${data.statusCode}: ${data.message}`);
    // Handle error appropriately
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### 4. Respect Rate Limits

Monitor rate limit headers and implement backoff strategies:

```javascript
const response = await fetch('/api/drugs');
const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

if (remaining === '0') {
  const waitTime = reset - Date.now();
  console.log(`Rate limited. Wait ${waitTime}ms before retry`);
}
```

### 5. Use ETags (Coming Soon)

Future versions will support ETags for efficient caching:

```bash
# First request
GET /api/drugs/aspirin-325mg-bayer
< ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"

# Subsequent request
GET /api/drugs/aspirin-325mg-bayer
> If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
< 304 Not Modified
```

## Examples

### JavaScript/TypeScript

```typescript
// Using fetch
async function searchDrugs(query: string, page: number = 1) {
  const params = new URLSearchParams({
    q: query,
    limit: '20',
    page: page.toString()
  });

  const response = await fetch(`http://localhost:3001/api/drugs?${params}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}

// Using axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

async function getDrugDetails(slug: string) {
  try {
    const { data } = await api.get(`/drugs/${slug}`);
    return data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.error('Drug not found');
    }
    throw error;
  }
}
```

### Python

```python
import requests
from typing import Dict, List, Optional

class DrugFactsAPI:
    def __init__(self, base_url: str = "http://localhost:3001/api"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def search_drugs(
        self, 
        query: Optional[str] = None,
        therapeutic_class: Optional[str] = None,
        manufacturer: Optional[str] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict:
        params = {
            "page": page,
            "limit": limit
        }
        
        if query:
            params["q"] = query
        if therapeutic_class:
            params["therapeuticClass"] = therapeutic_class
        if manufacturer:
            params["manufacturer"] = manufacturer
        
        response = self.session.get(f"{self.base_url}/drugs", params=params)
        response.raise_for_status()
        return response.json()
    
    def get_drug_details(self, slug: str) -> Dict:
        response = self.session.get(f"{self.base_url}/drugs/{slug}")
        response.raise_for_status()
        return response.json()["data"]

# Usage
api = DrugFactsAPI()
results = api.search_drugs(query="aspirin", limit=10)
drug = api.get_drug_details("aspirin-325mg-bayer")
```

### cURL Examples

```bash
# Search with multiple filters
curl -X GET "http://localhost:3001/api/drugs?q=diabetes&therapeuticClass=Antidiabetic%20Agents&limit=5"

# Get drug details with pretty print
curl -X GET "http://localhost:3001/api/drugs/metformin-500mg" | jq .

# Check API health
curl -X GET "http://localhost:3001/health" | jq .

# Get all therapeutic classes
curl -X GET "http://localhost:3001/api/drugs/therapeutic-classes" | jq '.data | sort'
```

## Postman Collection

Import this collection to test the API in Postman:

```json
{
  "info": {
    "name": "DrugFacts API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Search Drugs",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/drugs?q=aspirin&limit=10&page=1",
          "host": ["{{baseUrl}}"],
          "path": ["api", "drugs"],
          "query": [
            {"key": "q", "value": "aspirin"},
            {"key": "limit", "value": "10"},
            {"key": "page", "value": "1"}
          ]
        }
      }
    },
    {
      "name": "Get Drug Details",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/api/drugs/:slug",
          "host": ["{{baseUrl}}"],
          "path": ["api", "drugs", ":slug"],
          "variable": [
            {"key": "slug", "value": "aspirin-325mg-bayer"}
          ]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001",
      "type": "string"
    }
  ]
}
```