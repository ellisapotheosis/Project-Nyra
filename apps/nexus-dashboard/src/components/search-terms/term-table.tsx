'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import type { SearchTerm } from '@/app/search-terms/page';

interface TermTableProps {
  terms: SearchTerm[];
  onUpdate: (id: string, updates: Partial<SearchTerm>) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const categoryColors = {
  primary: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  synonyms: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  related: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
};

export function TermTable({ terms, onUpdate, onDelete, loading }: TermTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SearchTerm>>({});

  const startEdit = (term: SearchTerm) => {
    setEditingId(term.id);
    setEditForm(term);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdate(editingId, editForm);
      cancelEdit();
    }
  };

  const handleWeightChange = (id: string, value: number[]) => {
    if (editingId === id) {
      setEditForm({ ...editForm, weight: value[0] });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Term</TableHead>
            <TableHead className="w-[120px]">Category</TableHead>
            <TableHead>Synonyms</TableHead>
            <TableHead>Related</TableHead>
            <TableHead className="w-[200px]">Weight</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {terms.map((term) => {
            const isEditing = editingId === term.id;
            const currentData = isEditing ? editForm : term;

            return (
              <TableRow key={term.id}>
                {/* Term */}
                <TableCell className="font-medium">
                  {isEditing ? (
                    <Input
                      value={currentData.term || ''}
                      onChange={(e) => setEditForm({ ...editForm, term: e.target.value })}
                      className="h-8"
                    />
                  ) : (
                    term.term
                  )}
                </TableCell>

                {/* Category */}
                <TableCell>
                  {isEditing ? (
                    <select
                      value={currentData.category || 'primary'}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          category: e.target.value as 'primary' | 'synonyms' | 'related',
                        })
                      }
                      className="h-8 px-2 rounded border bg-background"
                    >
                      <option value="primary">Primary</option>
                      <option value="synonyms">Synonyms</option>
                      <option value="related">Related</option>
                    </select>
                  ) : (
                    <Badge variant="outline" className={categoryColors[term.category]}>
                      {term.category}
                    </Badge>
                  )}
                </TableCell>

                {/* Synonyms */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={(currentData.synonyms || []).join(', ')}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          synonyms: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      placeholder="comma, separated, values"
                      className="h-8"
                    />
                  ) : term.synonyms.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {term.synonyms.map((syn, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {syn}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>

                {/* Related */}
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={(currentData.related || []).join(', ')}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          related: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      placeholder="comma, separated, values"
                      className="h-8"
                    />
                  ) : term.related.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {term.related.map((rel, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {rel}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>

                {/* Weight */}
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {((currentData.weight || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    {isEditing ? (
                      <Slider
                        value={[currentData.weight || 0]}
                        onValueChange={(value) => handleWeightChange(term.id, value)}
                        min={0}
                        max={1}
                        step={0.05}
                        className="w-full"
                      />
                    ) : (
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${(term.weight || 0) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={saveEdit}
                        className="h-8 w-8"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={cancelEdit}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(term)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(term.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
