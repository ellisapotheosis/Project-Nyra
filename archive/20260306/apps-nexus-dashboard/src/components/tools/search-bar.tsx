'use client';

import { useState, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { Search, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tool } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  tools: Tool[];
  onSearch: (query: string, results: Tool[]) => void;
  onFilterCategory?: (category: string) => void;
  categories?: string[];
}

export function SearchBar({
  tools,
  onSearch,
  onFilterCategory,
  categories,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const fuse = useMemo(
    () =>
      new Fuse(tools, {
        keys: ['name', 'description', 'category', 'server'],
        threshold: 0.3,
        includeScore: true,
        minMatchCharLength: 1,
      }),
    [tools]
  );

  const searchResults = useMemo(() => {
    let results = tools;

    if (query.trim()) {
      results = fuse.search(query).map((result) => result.item);
    }

    if (selectedCategory) {
      results = results.filter((tool) => tool.category === selectedCategory);
    }

    return results;
  }, [query, selectedCategory, fuse, tools]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      let results = tools;

      if (value.trim()) {
        results = fuse.search(value).map((result) => result.item);
      }

      if (selectedCategory) {
        results = results.filter((tool) => tool.category === selectedCategory);
      }

      onSearch(value, results);
    },
    [fuse, selectedCategory, tools, onSearch]
  );

  const handleCategorySelect = useCallback(
    (category: string) => {
      const newCategory = selectedCategory === category ? '' : category;
      setSelectedCategory(newCategory);
      onFilterCategory?.(newCategory);

      let results = tools;
      if (query.trim()) {
        results = fuse.search(query).map((result) => result.item);
      }
      if (newCategory) {
        results = results.filter((tool) => tool.category === newCategory);
      }
      onSearch(query, results);
    },
    [query, selectedCategory, fuse, tools, onSearch, onFilterCategory]
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools by name, description, category, or server..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant={selectedCategory ? 'default' : 'outline'} size="icon">
              <Zap className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Filter by Category</h4>
              <Separator />
              <div className="space-y-2">
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </Button>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No categories available</div>
                )}
              </div>
              {selectedCategory && (
                <>
                  <Separator />
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => handleCategorySelect(selectedCategory)}
                  >
                    Clear Filter
                  </Button>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="text-sm text-muted-foreground">
        Found {searchResults.length} tool{searchResults.length !== 1 ? 's' : ''}
        {selectedCategory && ` in "${selectedCategory}"`}
      </div>
    </div>
  );
}
