'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, Search, Download, Upload, TestTube } from 'lucide-react';
import { TermTable } from '@/components/search-terms/term-table';
import { AddTermDialog } from '@/components/search-terms/add-term-dialog';
import { TestSearchModal } from '@/components/search-terms/test-search-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SearchTerm {
  id: string;
  term: string;
  category: 'primary' | 'synonyms' | 'related';
  synonyms: string[];
  related: string[];
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const API_BASE = 'http://localhost:8000';

export default function SearchTermsPage() {
  const [terms, setTerms] = useState<SearchTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<SearchTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Fetch terms
  const fetchTerms = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/search-terms`);
      if (!response.ok) throw new Error('Failed to fetch terms');
      const data = await response.json();
      setTerms(data.data || []);
      setFilteredTerms(data.data || []);
    } catch (error) {
      console.error('Failed to fetch search terms:', error);
      // Use demo data on error
      const demoTerms: SearchTerm[] = [
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
      ];
      setTerms(demoTerms);
      setFilteredTerms(demoTerms);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  // Filter terms based on search and category
  useEffect(() => {
    let filtered = [...terms];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((term) => term.category === categoryFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (term) =>
          term.term.toLowerCase().includes(query) ||
          term.synonyms.some((s) => s.toLowerCase().includes(query)) ||
          term.related.some((r) => r.toLowerCase().includes(query))
      );
    }

    setFilteredTerms(filtered);
  }, [searchQuery, categoryFilter, terms]);

  // Handle term creation
  const handleAddTerm = async (termData: Omit<SearchTerm, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/api/search-terms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(termData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create term');
      }

      await fetchTerms();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to create term:', error);
      alert(error instanceof Error ? error.message : 'Failed to create term');
    }
  };

  // Handle term update
  const handleUpdateTerm = async (id: string, updates: Partial<SearchTerm>) => {
    try {
      const response = await fetch(`${API_BASE}/api/search-terms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update term');

      await fetchTerms();
    } catch (error) {
      console.error('Failed to update term:', error);
      alert('Failed to update term');
    }
  };

  // Handle term deletion
  const handleDeleteTerm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/search-terms/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete term');

      await fetchTerms();
    } catch (error) {
      console.error('Failed to delete term:', error);
      alert('Failed to delete term');
    }
  };

  // Export to JSON
  const handleExport = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/search-terms/export/json`);
      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'search-terms.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export terms');
    }
  };

  // Import from JSON
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedTerms = JSON.parse(text);

      const response = await fetch(`${API_BASE}/api/search-terms/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms: importedTerms }),
      });

      if (!response.ok) throw new Error('Failed to import');

      const result = await response.json();
      alert(
        `Import complete:\n- Created: ${result.created.length}\n- Updated: ${result.updated.length}\n- Errors: ${result.errors.length}`
      );

      await fetchTerms();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import terms. Please check the file format.');
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuzzy Search Term Editor</h1>
          <p className="text-muted-foreground mt-1">
            Manage search terms, synonyms, and relevance scoring for intelligent routing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTerms} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsTestModalOpen(true)}>
            <TestTube className="h-4 w-4 mr-2" />
            Test Search
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Term
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search terms, synonyms, or related..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="synonyms">Synonyms</SelectItem>
            <SelectItem value="related">Related</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      {/* Terms Table */}
      <TermTable
        terms={filteredTerms}
        onUpdate={handleUpdateTerm}
        onDelete={handleDeleteTerm}
        loading={loading}
      />

      {/* Empty State */}
      {!loading && filteredTerms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">
            {searchQuery || categoryFilter !== 'all'
              ? 'No terms match your filters'
              : 'No search terms configured'}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Term
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <AddTermDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddTerm}
      />

      <TestSearchModal
        open={isTestModalOpen}
        onOpenChange={setIsTestModalOpen}
        apiBase={API_BASE}
      />
    </div>
  );
}
