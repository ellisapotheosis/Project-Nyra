'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Search, Loader2 } from 'lucide-react';
import type { SearchTerm } from '@/app/search-terms/page';

interface TestSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiBase: string;
}

interface SearchResult {
  term: SearchTerm;
  score: number;
  matchType: 'term' | 'synonym' | 'related';
}

const categoryColors = {
  primary: 'bg-blue-500/10 text-blue-500',
  synonyms: 'bg-green-500/10 text-green-500',
  related: 'bg-purple-500/10 text-purple-500',
};

const matchTypeColors = {
  term: 'bg-green-500/10 text-green-500',
  synonym: 'bg-blue-500/10 text-blue-500',
  related: 'bg-purple-500/10 text-purple-500',
};

export function TestSearchModal({ open, onOpenChange, apiBase }: TestSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(false);

    try {
      const response = await fetch(`${apiBase}/api/search-terms/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Test Fuzzy Search</DialogTitle>
          <DialogDescription>
            Test the fuzzy search algorithm with your search terms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type a search query..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
                autoFocus
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : searched && results.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No matching terms found for &quot;{query}&quot;
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try different keywords or add more search terms
                </p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Found {results.length} matching term{results.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {results.map((result, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{result.term.term}</span>
                          <Badge
                            variant="outline"
                            className={categoryColors[result.term.category]}
                          >
                            {result.term.category}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={matchTypeColors[result.matchType]}
                          >
                            {result.matchType} match
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {(result.score * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-muted-foreground">relevance</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <Progress value={result.score * 100} className="h-2" />

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      {result.term.synonyms.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Synonyms: </span>
                          <span>{result.term.synonyms.join(', ')}</span>
                        </div>
                      )}
                      {result.term.related.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Related: </span>
                          <span>{result.term.related.join(', ')}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Base weight: </span>
                        <span>{(result.term.weight * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
