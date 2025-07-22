# MCP (Model Context Protocol) Integration Guide

This guide explains how to integrate and use the DrugFacts API MCP tools with AI agents and applications.

## Overview

The DrugFacts API implements Model Context Protocol (MCP) tools that allow AI agents to interact with drug data programmatically. These tools provide structured interfaces for searching drugs, retrieving detailed information, and checking drug interactions.

## Available MCP Tools

### 1. drug_search

Search for drugs by name, generic name, active ingredient, or therapeutic class.

#### Tool Definition

```json
{
  "name": "drug_search",
  "description": "Search for drugs by name, generic name, active ingredient, conditions, or therapeutic class with prioritized results",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query for drug name, generic name, active ingredient, or medical conditions"
      },
      "filters": {
        "type": "object",
        "properties": {
          "therapeuticClass": {
            "type": "string",
            "description": "Filter by therapeutic class"
          },
          "manufacturer": {
            "type": "string",
            "description": "Filter by manufacturer"
          },
          "limit": {
            "type": "number",
            "description": "Maximum number of results to return",
            "default": 10,
            "minimum": 1,
            "maximum": 100
          },
          "page": {
            "type": "number",
            "description": "Page number for pagination",
            "default": 1,
            "minimum": 1
          },
          "searchType": {
            "type": "string",
            "description": "Search algorithm to use: 'weighted' (prioritizes drug names), 'text' (fast full-text), or 'standard' (all fields equal)",
            "default": "weighted",
            "enum": ["weighted", "text", "standard"]
          }
        }
      }
    },
    "required": ["query"]
  }
}
```

#### Example Usage

```javascript
// MCP tool call - Search for diabetes medications
{
  "name": "drug_search",
  "arguments": {
    "query": "diabetes",
    "filters": {
      "therapeuticClass": "Antidiabetic Agents",
      "limit": 5,
      "page": 1,
      "searchType": "weighted"
    }
  }
}

// MCP tool call - Search for drugs by condition
{
  "name": "drug_search",
  "arguments": {
    "query": "hypertension",
    "filters": {
      "limit": 10,
      "searchType": "weighted"
    }
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Found 42 drugs matching \"diabetes medication\"",
    "data": {
      "data": [
        {
          "drugName": "Metformin",
          "genericName": "metformin hydrochloride",
          "therapeuticClass": "Antidiabetic Agents",
          "manufacturer": "Teva Pharmaceuticals",
          "slug": "metformin-500mg-teva"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 5,
        "total": 42,
        "totalPages": 9,
        "hasNext": true,
        "hasPrev": false
      }
    }
  }]
}
```

### 2. drug_details

Get comprehensive information about a specific drug including warnings, usage, dosage, and clinical information.

#### Tool Definition

```json
{
  "name": "drug_details",
  "description": "Get comprehensive information about a specific drug including warnings, usage, dosage, and clinical information",
  "inputSchema": {
    "type": "object",
    "properties": {
      "slug": {
        "type": "string",
        "description": "Drug slug identifier (e.g., \"mounjaro-d2d7da5\")"
      }
    },
    "required": ["slug"]
  }
}
```

#### Example Usage

```javascript
// MCP tool call
{
  "name": "drug_details",
  "arguments": {
    "slug": "metformin-500mg-teva"
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Retrieved details for Metformin",
    "data": {
      "drugName": "Metformin",
      "genericName": "metformin hydrochloride",
      "activeIngredient": "Metformin hydrochloride 500 mg",
      "indicationsAndUsage": "Metformin is indicated as an adjunct to diet and exercise...",
      "dosageAndAdministration": "Starting dose: 500 mg orally twice a day...",
      "warnings": "Lactic Acidosis: Metformin-associated lactic acidosis...",
      "contraindications": "Severe renal impairment (eGFR below 30 mL/min/1.73 m2)...",
      "adverseReactions": "Most common adverse reactions (≥5%) are diarrhea, nausea...",
      "drugInteractions": "Carbonic Anhydrase Inhibitors may increase risk...",
      "slug": "metformin-500mg-teva"
    }
  }]
}
```

### 3. check_drug_interactions

Check potential interactions between multiple drugs.

#### Tool Definition

```json
{
  "name": "check_drug_interactions",
  "description": "Check potential interactions between multiple drugs",
  "inputSchema": {
    "type": "object",
    "properties": {
      "drugSlugs": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Array of drug slugs to check for interactions (minimum 2)",
        "minItems": 2
      }
    },
    "required": ["drugSlugs"]
  }
}
```

#### Example Usage

```javascript
// MCP tool call
{
  "name": "check_drug_interactions",
  "arguments": {
    "drugSlugs": [
      "metformin-500mg-teva",
      "aspirin-325mg-bayer",
      "lisinopril-10mg-lupin"
    ]
  }
}

// Response
{
  "content": [{
    "type": "text",
    "text": "Interaction check for Metformin, Aspirin, Lisinopril",
    "data": {
      "interactions": [
        {
          "drugName": "Metformin",
          "interactions": "Carbonic Anhydrase Inhibitors may increase the risk of lactic acidosis..."
        },
        {
          "drugName": "Aspirin",
          "interactions": "Increased risk of bleeding when used with anticoagulants..."
        },
        {
          "drugName": "Lisinopril",
          "interactions": "Potassium-sparing diuretics may increase risk of hyperkalemia..."
        }
      ]
    }
  }]
}
```

## Integration Methods

### 1. Direct MCP Server Integration

The API can be configured to run as an MCP server using stdio transport:

```javascript
// mcp-server.js
import { McpService } from './src/mcp/mcp.service';

const server = new McpService();
await server.initialize();

// The server will communicate via stdio
```

### 2. HTTP Endpoint Integration

You can also access MCP tools via HTTP endpoints:

```http
POST /api/mcp/tools/list
```

Response:
```json
{
  "tools": [
    { /* drug_search tool definition */ },
    { /* drug_details tool definition */ },
    { /* check_drug_interactions tool definition */ }
  ]
}
```

```http
POST /api/mcp/tools/call
Content-Type: application/json

{
  "name": "drug_search",
  "arguments": {
    "query": "aspirin"
  }
}
```

### 3. WebSocket Integration (Coming Soon)

Real-time MCP tool access via WebSocket:

```javascript
const ws = new WebSocket('ws://localhost:3001/mcp');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'tool_call',
    name: 'drug_search',
    arguments: { query: 'aspirin' }
  }));
});

ws.on('message', (data) => {
  const response = JSON.parse(data);
  console.log('Tool response:', response);
});
```

## Client Libraries

### JavaScript/TypeScript

```typescript
import { MCPClient } from '@modelcontextprotocol/sdk';

class DrugFactsMCPClient {
  private client: MCPClient;
  
  constructor(baseUrl: string = 'http://localhost:3001') {
    this.client = new MCPClient({
      name: 'drugfacts-client',
      version: '1.0.0',
    });
  }
  
  async searchDrugs(query: string, filters?: any) {
    return this.client.callTool('drug_search', {
      query,
      filters
    });
  }
  
  async getDrugDetails(slug: string) {
    return this.client.callTool('drug_details', { slug });
  }
  
  async checkInteractions(drugSlugs: string[]) {
    return this.client.callTool('check_drug_interactions', { drugSlugs });
  }
}

// Usage
const mcp = new DrugFactsMCPClient();
const results = await mcp.searchDrugs('diabetes medication', {
  therapeuticClass: 'Antidiabetic Agents'
});
```

### Python

```python
from mcp import MCPClient

class DrugFactsMCPClient:
    def __init__(self, base_url="http://localhost:3001"):
        self.client = MCPClient(
            name="drugfacts-client",
            version="1.0.0"
        )
    
    async def search_drugs(self, query: str, filters: dict = None):
        return await self.client.call_tool("drug_search", {
            "query": query,
            "filters": filters or {}
        })
    
    async def get_drug_details(self, slug: str):
        return await self.client.call_tool("drug_details", {"slug": slug})
    
    async def check_interactions(self, drug_slugs: list[str]):
        return await self.client.call_tool("check_drug_interactions", {
            "drugSlugs": drug_slugs
        })

# Usage
import asyncio

async def main():
    mcp = DrugFactsMCPClient()
    results = await mcp.search_drugs("aspirin")
    print(results)

asyncio.run(main())
```

## AI Agent Integration

### Claude Desktop Integration

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "drugfacts": {
      "command": "node",
      "args": ["path/to/drugfacts-api/dist/mcp-server.js"],
      "env": {
        "MONGODB_URL": "mongodb://localhost:27017",
        "MONGODB_DB_NAME": "drug_facts"
      }
    }
  }
}
```

### LangChain Integration

```python
from langchain.tools import Tool
from drugfacts_mcp import DrugFactsMCPClient

mcp_client = DrugFactsMCPClient()

drug_search_tool = Tool(
    name="drug_search",
    description="Search for drugs by name or therapeutic class",
    func=lambda query: mcp_client.search_drugs(query)
)

drug_details_tool = Tool(
    name="drug_details",
    description="Get detailed information about a specific drug",
    func=lambda slug: mcp_client.get_drug_details(slug)
)

# Add tools to your agent
tools = [drug_search_tool, drug_details_tool]
```

### OpenAI Function Calling

```javascript
const functions = [
  {
    name: "drug_search",
    description: "Search for drugs by name or therapeutic class",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query"
        },
        filters: {
          type: "object",
          properties: {
            therapeuticClass: { type: "string" },
            manufacturer: { type: "string" },
            limit: { type: "number" }
          }
        }
      },
      required: ["query"]
    }
  }
];

// Use with OpenAI API
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    {
      role: "user",
      content: "Find diabetes medications manufactured by Novo Nordisk"
    }
  ],
  functions: functions,
  function_call: "auto"
});
```

## Best Practices

### 1. Use Specific Queries

```javascript
// Good - specific query
await mcp.searchDrugs("metformin 500mg", {
  therapeuticClass: "Antidiabetic Agents"
});

// Less optimal - too broad
await mcp.searchDrugs("m");
```

### 2. Handle Errors Gracefully

```javascript
try {
  const result = await mcp.getDrugDetails("invalid-slug");
} catch (error) {
  if (error.message.includes("not found")) {
    console.log("Drug not found, trying search instead");
    const searchResults = await mcp.searchDrugs("drug name");
  }
}
```

### 3. Batch Interaction Checks

```javascript
// Check interactions for a patient's medication list
const patientMedications = [
  "metformin-500mg-teva",
  "lisinopril-10mg-lupin",
  "aspirin-81mg-cvs",
  "atorvastatin-20mg-pfizer"
];

const interactions = await mcp.checkInteractions(patientMedications);
```

### 4. Cache Results

```javascript
const cache = new Map();

async function getCachedDrugDetails(slug) {
  if (cache.has(slug)) {
    return cache.get(slug);
  }
  
  const details = await mcp.getDrugDetails(slug);
  cache.set(slug, details);
  return details;
}
```

### 5. Use Pagination for Large Results

```javascript
async function getAllDrugsInClass(therapeuticClass) {
  const allDrugs = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    const result = await mcp.searchDrugs("", {
      therapeuticClass,
      limit: 100,
      page
    });
    
    allDrugs.push(...result.data);
    hasMore = result.pagination.hasNext;
    page++;
  }
  
  return allDrugs;
}
```

## Security Considerations

1. **Authentication**: In production, implement proper authentication for MCP access
2. **Rate Limiting**: MCP tools respect the same rate limits as HTTP endpoints
3. **Input Validation**: All inputs are validated and sanitized
4. **Access Control**: Implement role-based access for sensitive operations

## Troubleshooting

### Common Issues

1. **Tool Not Found**
   ```
   Error: Unknown tool: drug_lookup
   ```
   Solution: Use the correct tool name (`drug_search`, not `drug_lookup`)

2. **Invalid Arguments**
   ```
   Error: Missing required field: query
   ```
   Solution: Ensure all required fields are provided

3. **Connection Failed**
   ```
   Error: Failed to connect to MCP server
   ```
   Solution: Check that the API is running and accessible

### Debug Mode

Enable debug logging:

```bash
DEBUG=mcp:* npm run start:dev
```

## Examples

### Medical Chatbot

```javascript
// Simple medical information chatbot
async function handleUserQuery(query) {
  // Check if asking about a specific drug
  const drugMatch = query.match(/tell me about ([\w\s]+)/i);
  if (drugMatch) {
    const drugName = drugMatch[1];
    const searchResults = await mcp.searchDrugs(drugName, { limit: 1 });
    
    if (searchResults.data.length > 0) {
      const drug = searchResults.data[0];
      const details = await mcp.getDrugDetails(drug.slug);
      return formatDrugInfo(details);
    }
  }
  
  // Check if asking about drug interactions
  const interactionMatch = query.match(/interaction between ([\w\s,]+)/i);
  if (interactionMatch) {
    const drugs = interactionMatch[1].split(',').map(d => d.trim());
    // Search for each drug and get slugs
    const slugs = await Promise.all(
      drugs.map(async (drug) => {
        const result = await mcp.searchDrugs(drug, { limit: 1 });
        return result.data[0]?.slug;
      })
    );
    
    const interactions = await mcp.checkInteractions(slugs.filter(Boolean));
    return formatInteractions(interactions);
  }
}
```

### Clinical Decision Support

```javascript
// Check drug interactions for a prescription
async function validatePrescription(prescription) {
  const drugSlugs = await Promise.all(
    prescription.medications.map(async (med) => {
      const result = await mcp.searchDrugs(med.name, { limit: 1 });
      return result.data[0]?.slug;
    })
  );
  
  const interactions = await mcp.checkInteractions(drugSlugs);
  
  // Analyze interactions and return warnings
  const warnings = analyzeInteractions(interactions);
  return {
    safe: warnings.length === 0,
    warnings
  };
}
```

## Future Enhancements

1. **Additional Tools**
   - `drug_alternatives`: Find alternative medications
   - `dosage_calculator`: Calculate appropriate dosages
   - `formulary_check`: Check insurance formulary coverage

2. **Enhanced Features**
   - Real-time updates via WebSocket
   - Bulk operations support
   - Advanced filtering options
   - Multi-language support

3. **Integration Improvements**
   - Native SDKs for more languages
   - GraphQL endpoint
   - gRPC support
   - Webhook notifications