# Fuzzy Search Term Editor

A comprehensive UI and API for managing fuzzy search terms, synonyms, and relevance scoring for the Nexus Router intelligent routing system.

## 📖 Overview

The Fuzzy Search Term Editor provides:
- **Term Management**: Create, read, update, and delete search terms
- **Category Organization**: Primary terms, synonyms, and related concepts
- **Relevance Weighting**: 0-1 scoring for search result ranking
- **Fuzzy Matching**: Levenshtein distance-based similarity matching
- **Bulk Operations**: Import/export terms as JSON
- **Test Interface**: Real-time fuzzy search testing

## 🏗️ Architecture

### Backend API (`services/nexus-router`)

**File**: `src/routes/search-terms.ts`

The backend provides a RESTful API with in-memory storage (easily replaceable with database).

### Frontend UI (`apps/nexus-dashboard`)

**Files**:
- `src/app/search-terms/page.tsx` - Main page component
- `src/components/search-terms/term-table.tsx` - Editable table
- `src/components/search-terms/add-term-dialog.tsx` - Add term dialog
- `src/components/search-terms/test-search-modal.tsx` - Test search modal

## 🚀 Getting Started

### Prerequisites

1. **Backend running**: Start the Nexus Router service
   ```bash
   cd services/nexus-router
   pnpm dev
   ```

2. **Frontend running**: Start the Nexus Dashboard
   ```bash
   cd apps/nexus-dashboard
   pnpm dev
   ```

3. **Access the UI**: Navigate to http://localhost:3005/search-terms

## 📡 API Endpoints

### Base URL
```
http://localhost:8000/api/search-terms
```

### Endpoints

#### 1. List All Terms
```http
GET /api/search-terms
```

**Query Parameters**:
- `category` (optional): Filter by category (`primary`, `synonyms`, `related`)
- `search` (optional): Search in term, synonyms, or related
- `limit` (optional): Max results per page (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "data": [
    {
      "id": "1",
      "term": "authentication",
      "category": "primary",
      "synonyms": ["auth", "login", "session"],
      "related": ["access-control", "identity"],
      "weight": 0.9,
      "createdAt": "2024-01-18T10:00:00.000Z",
      "updatedAt": "2024-01-18T10:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

#### 2. Get Term by ID
```http
GET /api/search-terms/:id
```

**Response**:
```json
{
  "data": {
    "id": "1",
    "term": "authentication",
    "category": "primary",
    "synonyms": ["auth", "login", "session"],
    "related": ["access-control", "identity"],
    "weight": 0.9,
    "createdAt": "2024-01-18T10:00:00.000Z",
    "updatedAt": "2024-01-18T10:00:00.000Z"
  }
}
```

#### 3. Create Term
```http
POST /api/search-terms
```

**Request Body**:
```json
{
  "term": "routing",
  "category": "primary",
  "synonyms": ["route", "router"],
  "related": ["load-balancing", "proxy"],
  "weight": 0.85
}
```

**Validation Rules**:
- `term`: Required, non-empty string
- `category`: Required, one of `primary`, `synonyms`, `related`
- `synonyms`: Optional array of strings
- `related`: Optional array of strings
- `weight`: Optional number between 0 and 1 (default: 0.5)

**Response**: `201 Created`
```json
{
  "data": {
    "id": "2",
    "term": "routing",
    "category": "primary",
    "synonyms": ["route", "router"],
    "related": ["load-balancing", "proxy"],
    "weight": 0.85,
    "createdAt": "2024-01-18T10:05:00.000Z",
    "updatedAt": "2024-01-18T10:05:00.000Z"
  }
}
```

#### 4. Update Term
```http
PATCH /api/search-terms/:id
```

**Request Body** (partial updates):
```json
{
  "weight": 0.95,
  "synonyms": ["auth", "login", "session", "credential"]
}
```

**Response**:
```json
{
  "data": {
    "id": "1",
    "term": "authentication",
    "category": "primary",
    "synonyms": ["auth", "login", "session", "credential"],
    "related": ["access-control", "identity"],
    "weight": 0.95,
    "createdAt": "2024-01-18T10:00:00.000Z",
    "updatedAt": "2024-01-18T10:10:00.000Z"
  }
}
```

#### 5. Delete Term
```http
DELETE /api/search-terms/:id
```

**Response**:
```json
{
  "success": true,
  "message": "Search term 'authentication' deleted successfully"
}
```

#### 6. Test Fuzzy Search
```http
POST /api/search-terms/test
```

**Request Body**:
```json
{
  "query": "auth"
}
```

**Response**:
```json
{
  "query": "auth",
  "results": [
    {
      "term": {
        "id": "1",
        "term": "authentication",
        "category": "primary",
        "synonyms": ["auth", "login", "session"],
        "related": ["access-control", "identity"],
        "weight": 0.9,
        "createdAt": "2024-01-18T10:00:00.000Z",
        "updatedAt": "2024-01-18T10:00:00.000Z"
      },
      "score": 0.9,
      "matchType": "synonym"
    }
  ],
  "total": 1
}
```

**Match Types**:
- `term`: Matched the primary term
- `synonym`: Matched a synonym
- `related`: Matched a related term

#### 7. Bulk Import
```http
POST /api/search-terms/bulk
```

**Request Body**:
```json
{
  "terms": [
    {
      "term": "caching",
      "category": "primary",
      "synonyms": ["cache", "memoization"],
      "related": ["performance", "optimization"],
      "weight": 0.8
    },
    {
      "term": "monitoring",
      "category": "primary",
      "synonyms": ["observability", "logging"],
      "related": ["metrics", "alerting"],
      "weight": 0.85
    }
  ]
}
```

**Response**:
```json
{
  "created": [
    { "id": "3", "term": "caching", ... }
  ],
  "updated": [],
  "errors": []
}
```

#### 8. Export as JSON
```http
GET /api/search-terms/export/json
```

**Response**: Downloads `search-terms.json` with all terms

## 🎨 UI Features

### Main Page
- **Search Bar**: Real-time filtering across terms, synonyms, and related
- **Category Filter**: Filter by primary, synonyms, or related
- **Action Buttons**: Refresh, Test Search, Add Term, Import, Export

### Term Table
- **Inline Editing**: Double-click or click Edit button
- **Category Badges**: Color-coded by category
  - Primary: Blue
  - Synonyms: Green
  - Related: Purple
- **Weight Slider**: Visual and interactive weight adjustment (0-100%)
- **Synonym/Related Badges**: Pill-style badges for arrays

### Add Term Dialog
- **Form Validation**: Required fields, category selection
- **Multi-Input Fields**: Comma-separated synonyms and related terms
- **Weight Slider**: Visual weight selection with percentage display
- **Error Handling**: Clear validation messages

### Test Search Modal
- **Real-time Search**: Enter query and see fuzzy matches
- **Result Cards**: Display matched terms with:
  - Relevance score (percentage)
  - Progress bar visualization
  - Match type badge (term/synonym/related)
  - Category badge
  - Synonyms and related terms
  - Base weight

## 🔍 Fuzzy Matching Algorithm

The system uses **Levenshtein distance** for fuzzy matching:

1. **Exact Match**: `1.0` (100%)
2. **Contains Match**: `0.8` (80%)
3. **Similarity Score**: `1 - (distance / maxLength)`
4. **Weight Application**: `finalScore = matchScore * term.weight`
5. **Threshold**: Results below `0.3` (30%) are filtered out

### Example

Query: `"auth"`

1. Term: `"authentication"`
   - Contains "auth": `0.8`
   - Weight: `0.9`
   - Final: `0.8 * 0.9 = 0.72` (72%)

2. Synonym: `"auth"`
   - Exact match: `1.0`
   - Weight: `0.9`
   - Final: `1.0 * 0.9 = 0.9` (90%)

## 📊 Data Model

### SearchTerm Interface

```typescript
interface SearchTerm {
  id: string;                                    // Unique identifier
  term: string;                                  // Primary term
  category: 'primary' | 'synonyms' | 'related';  // Category
  synonyms: string[];                            // Alternative terms
  related: string[];                             // Related concepts
  weight: number;                                // 0-1 relevance score
  createdAt: Date;                               // Creation timestamp
  updatedAt: Date;                               // Last update timestamp
}
```

### Category Types

- **Primary**: Main concepts (e.g., "authentication", "routing")
- **Synonyms**: Alternative names (e.g., "auth", "route")
- **Related**: Associated concepts (e.g., "access-control", "load-balancing")

## 🎯 Use Cases

### 1. MCP Tool Search
Improve tool discovery with fuzzy matching:
```json
{
  "term": "file-operations",
  "category": "primary",
  "synonyms": ["file-io", "fs", "filesystem"],
  "related": ["read", "write", "directory"],
  "weight": 0.9
}
```

### 2. Model Discovery
Help users find models by capabilities:
```json
{
  "term": "code-generation",
  "category": "primary",
  "synonyms": ["coding", "programming", "development"],
  "related": ["claude", "gpt-4", "codex"],
  "weight": 0.95
}
```

### 3. Routing Patterns
Match request patterns intelligently:
```json
{
  "term": "completion",
  "category": "primary",
  "synonyms": ["chat", "generation", "inference"],
  "related": ["streaming", "tokens", "response"],
  "weight": 0.85
}
```

## 🔧 Extending the System

### Add Database Persistence

Replace the in-memory storage in `search-terms.ts`:

```typescript
// Before (in-memory)
let searchTerms: SearchTerm[] = [];

// After (database)
import { db } from '../services/database';

// In routes
const terms = await db.searchTerms.findMany();
```

### Add More Match Algorithms

Extend the fuzzy matching:

```typescript
function advancedMatch(query: string, target: string): number {
  // Soundex for phonetic matching
  // Metaphone for pronunciation
  // N-gram for substring similarity
  // Custom domain-specific matching
  return score;
}
```

### Add Analytics

Track popular searches:

```typescript
router.post('/test', async (req, res) => {
  const { query } = req.body;

  // Track search
  await analytics.track('search', {
    query,
    timestamp: new Date(),
    resultsCount: results.length
  });

  res.json({ results });
});
```

## 🐛 Troubleshooting

### Backend Not Responding

1. Check if Nexus Router is running:
   ```bash
   curl http://localhost:8000/health
   ```

2. Verify route registration in `src/index.ts`:
   ```typescript
   import { searchTermsRouter } from './routes/search-terms';
   app.use('/api/search-terms', searchTermsRouter);
   ```

### Frontend CORS Errors

Update CORS configuration in `src/index.ts`:
```typescript
app.use(cors({
  origin: ['http://localhost:3005'],
  credentials: true
}));
```

### Import/Export Issues

Ensure JSON format matches the SearchTerm interface:
```json
[
  {
    "term": "example",
    "category": "primary",
    "synonyms": [],
    "related": [],
    "weight": 0.5
  }
]
```

## 📝 Best Practices

1. **Term Naming**: Use lowercase, hyphenated terms (`"access-control"`)
2. **Weight Strategy**:
   - Critical terms: `0.9-1.0`
   - Important terms: `0.7-0.9`
   - Supporting terms: `0.5-0.7`
   - Rare terms: `0.3-0.5`
3. **Synonyms**: Include common abbreviations and variants
4. **Related Terms**: Link conceptually similar terms
5. **Categories**: Use primary for main concepts, synonyms for alternatives

## 🚀 Future Enhancements

- [ ] Machine learning-based relevance scoring
- [ ] Automatic synonym discovery
- [ ] Search analytics dashboard
- [ ] Multi-language support
- [ ] Custom match algorithm plugins
- [ ] Term relationship graph visualization
- [ ] A/B testing for search improvements
- [ ] Redis caching for search results

## 📚 Related Documentation

- [Nexus Router Architecture](./NEXUS-ROUTER.md)
- [MCP Proxy Aggregator](./MCP-PROXY.md)
- [API Reference](./API-REFERENCE.md)

---

**Created**: 2024-01-18
**Last Updated**: 2024-01-18
**Maintainer**: Project Nyra Team
