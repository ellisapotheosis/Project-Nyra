import { Router, Request, Response } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('search-terms-route');
const router = Router();

/**
 * Search Term Interface
 */
export interface SearchTerm {
  id: string;
  term: string;
  category: 'primary' | 'synonyms' | 'related';
  synonyms: string[];
  related: string[];
  weight: number; // 0-1 relevance scoring
  createdAt: Date;
  updatedAt: Date;
}

/**
 * In-memory storage (can be replaced with database later)
 */
let searchTerms: SearchTerm[] = [
  {
    id: '1',
    term: 'authentication',
    category: 'primary',
    synonyms: ['auth', 'login', 'session'],
    related: ['access-control', 'identity'],
    weight: 0.9,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    term: 'routing',
    category: 'primary',
    synonyms: ['route', 'router', 'request-routing'],
    related: ['load-balancing', 'proxy'],
    weight: 0.85,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    term: 'model',
    category: 'primary',
    synonyms: ['llm', 'ai-model', 'language-model'],
    related: ['inference', 'generation'],
    weight: 0.95,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Validation helpers
 */
function validateSearchTerm(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.term || typeof data.term !== 'string' || data.term.trim().length === 0) {
    errors.push('Term is required and must be a non-empty string');
  }

  if (!data.category || !['primary', 'synonyms', 'related'].includes(data.category)) {
    errors.push('Category must be one of: primary, synonyms, related');
  }

  if (data.synonyms && !Array.isArray(data.synonyms)) {
    errors.push('Synonyms must be an array');
  }

  if (data.related && !Array.isArray(data.related)) {
    errors.push('Related must be an array');
  }

  if (
    data.weight !== undefined &&
    (typeof data.weight !== 'number' || data.weight < 0 || data.weight > 1)
  ) {
    errors.push('Weight must be a number between 0 and 1');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Fuzzy matching algorithm (simple Levenshtein-based)
 */
function fuzzyMatch(query: string, target: string): number {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact match
  if (q === t) return 1.0;

  // Contains match
  if (t.includes(q)) return 0.8;

  // Levenshtein distance
  const distance = levenshteinDistance(q, t);
  const maxLen = Math.max(q.length, t.length);
  const similarity = 1 - distance / maxLen;

  return Math.max(0, similarity);
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * GET /api/search-terms
 * List all search terms with optional filtering
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, limit, offset } = req.query;

    let results = [...searchTerms];

    // Filter by category
    if (category && typeof category === 'string') {
      results = results.filter((term) => term.category === category);
    }

    // Search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (term) =>
          term.term.toLowerCase().includes(searchLower) ||
          term.synonyms.some((s) => s.toLowerCase().includes(searchLower)) ||
          term.related.some((r) => r.toLowerCase().includes(searchLower))
      );
    }

    // Pagination
    const total = results.length;
    const limitNum = limit ? parseInt(limit as string, 10) : 100;
    const offsetNum = offset ? parseInt(offset as string, 10) : 0;

    results = results.slice(offsetNum, offsetNum + limitNum);

    res.json({
      data: results,
      total,
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    logger.error('Search terms list error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to list search terms',
        type: 'server_error',
      },
    });
  }
});

/**
 * GET /api/search-terms/:id
 * Get a specific search term by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const term = searchTerms.find((t) => t.id === id);

    if (!term) {
      res.status(404).json({
        error: {
          message: `Search term with ID '${id}' not found`,
          type: 'not_found',
        },
      });
      return;
    }

    res.json({ data: term });
  } catch (error) {
    logger.error('Search term get error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to get search term',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /api/search-terms
 * Create a new search term
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { term, category, synonyms, related, weight } = req.body;

    // Validate input
    const validation = validateSearchTerm(req.body);
    if (!validation.valid) {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          type: 'validation_error',
          details: validation.errors,
        },
      });
      return;
    }

    // Check for duplicate term
    const existingTerm = searchTerms.find(
      (t) => t.term.toLowerCase() === term.toLowerCase()
    );
    if (existingTerm) {
      res.status(409).json({
        error: {
          message: `Search term '${term}' already exists`,
          type: 'conflict',
        },
      });
      return;
    }

    // Create new term
    const newTerm: SearchTerm = {
      id: Date.now().toString(),
      term: term.trim(),
      category,
      synonyms: synonyms || [],
      related: related || [],
      weight: weight !== undefined ? weight : 0.5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    searchTerms.push(newTerm);
    logger.info(`Created search term: ${newTerm.term}`);

    res.status(201).json({ data: newTerm });
  } catch (error) {
    logger.error('Search term creation error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to create search term',
        type: 'server_error',
      },
    });
  }
});

/**
 * PATCH /api/search-terms/:id
 * Update an existing search term
 */
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const termIndex = searchTerms.findIndex((t) => t.id === id);
    if (termIndex === -1) {
      res.status(404).json({
        error: {
          message: `Search term with ID '${id}' not found`,
          type: 'not_found',
        },
      });
      return;
    }

    // Validate updates
    const validation = validateSearchTerm({ ...searchTerms[termIndex], ...updates });
    if (!validation.valid) {
      res.status(400).json({
        error: {
          message: 'Validation failed',
          type: 'validation_error',
          details: validation.errors,
        },
      });
      return;
    }

    // Apply updates
    searchTerms[termIndex] = {
      ...searchTerms[termIndex],
      ...updates,
      id, // Ensure ID cannot be changed
      updatedAt: new Date(),
    };

    logger.info(`Updated search term: ${searchTerms[termIndex].term}`);

    res.json({ data: searchTerms[termIndex] });
  } catch (error) {
    logger.error('Search term update error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to update search term',
        type: 'server_error',
      },
    });
  }
});

/**
 * DELETE /api/search-terms/:id
 * Delete a search term
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const termIndex = searchTerms.findIndex((t) => t.id === id);
    if (termIndex === -1) {
      res.status(404).json({
        error: {
          message: `Search term with ID '${id}' not found`,
          type: 'not_found',
        },
      });
      return;
    }

    const deletedTerm = searchTerms[termIndex];
    searchTerms.splice(termIndex, 1);

    logger.info(`Deleted search term: ${deletedTerm.term}`);

    res.json({
      success: true,
      message: `Search term '${deletedTerm.term}' deleted successfully`,
    });
  } catch (error) {
    logger.error('Search term deletion error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to delete search term',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /api/search-terms/test
 * Test fuzzy search functionality
 */
router.post('/test', (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({
        error: {
          message: 'Query is required and must be a string',
          type: 'validation_error',
        },
      });
      return;
    }

    // Perform fuzzy matching
    const matches = searchTerms.map((term) => {
      // Calculate match scores
      const termScore = fuzzyMatch(query, term.term);
      const synonymScores = term.synonyms.map((s) => fuzzyMatch(query, s));
      const relatedScores = term.related.map((r) => fuzzyMatch(query, r));

      // Best match score
      const bestScore = Math.max(termScore, ...synonymScores, ...relatedScores);

      // Apply weight
      const weightedScore = bestScore * term.weight;

      return {
        term,
        score: weightedScore,
        matchType:
          termScore === bestScore
            ? 'term'
            : synonymScores.includes(bestScore)
              ? 'synonym'
              : 'related',
      };
    });

    // Filter and sort by score
    const results = matches
      .filter((m) => m.score > 0.3) // Threshold for relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Top 10 results

    res.json({
      query,
      results: results.map((r) => ({
        term: r.term,
        score: Math.round(r.score * 100) / 100,
        matchType: r.matchType,
      })),
      total: results.length,
    });
  } catch (error) {
    logger.error('Search term test error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to test search',
        type: 'server_error',
      },
    });
  }
});

/**
 * POST /api/search-terms/bulk
 * Bulk import search terms
 */
router.post('/bulk', (req: Request, res: Response) => {
  try {
    const { terms } = req.body;

    if (!Array.isArray(terms)) {
      res.status(400).json({
        error: {
          message: 'Terms must be an array',
          type: 'validation_error',
        },
      });
      return;
    }

    const results = {
      created: [] as SearchTerm[],
      updated: [] as SearchTerm[],
      errors: [] as { term: any; error: string }[],
    };

    for (const termData of terms) {
      try {
        // Validate
        const validation = validateSearchTerm(termData);
        if (!validation.valid) {
          results.errors.push({
            term: termData,
            error: validation.errors.join(', '),
          });
          continue;
        }

        // Check if exists
        const existingIndex = searchTerms.findIndex(
          (t) => t.term.toLowerCase() === termData.term.toLowerCase()
        );

        if (existingIndex !== -1) {
          // Update existing
          searchTerms[existingIndex] = {
            ...searchTerms[existingIndex],
            ...termData,
            updatedAt: new Date(),
          };
          results.updated.push(searchTerms[existingIndex]);
        } else {
          // Create new
          const newTerm: SearchTerm = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            term: termData.term.trim(),
            category: termData.category,
            synonyms: termData.synonyms || [],
            related: termData.related || [],
            weight: termData.weight !== undefined ? termData.weight : 0.5,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          searchTerms.push(newTerm);
          results.created.push(newTerm);
        }
      } catch (error) {
        results.errors.push({
          term: termData,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(
      `Bulk import: ${results.created.length} created, ${results.updated.length} updated, ${results.errors.length} errors`
    );

    res.json(results);
  } catch (error) {
    logger.error('Bulk import error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to bulk import',
        type: 'server_error',
      },
    });
  }
});

/**
 * GET /api/search-terms/export
 * Export all search terms as JSON
 */
router.get('/export/json', (_req: Request, res: Response) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="search-terms.json"');
    res.json(searchTerms);
  } catch (error) {
    logger.error('Export error:', error);
    res.status(500).json({
      error: {
        message: error instanceof Error ? error.message : 'Failed to export terms',
        type: 'server_error',
      },
    });
  }
});

export { router as searchTermsRouter };
