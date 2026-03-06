'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SearchTerm } from '@/app/search-terms/page';

interface AddTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (term: Omit<SearchTerm, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function AddTermDialog({ open, onOpenChange, onSubmit }: AddTermDialogProps) {
  const [formData, setFormData] = useState({
    term: '',
    category: 'primary' as 'primary' | 'synonyms' | 'related',
    synonyms: '',
    related: '',
    weight: 0.5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.term.trim()) {
      newErrors.term = 'Term is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Parse comma-separated values
    const synonymsArray = formData.synonyms
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const relatedArray = formData.related
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSubmit({
      term: formData.term.trim(),
      category: formData.category,
      synonyms: synonymsArray,
      related: relatedArray,
      weight: formData.weight,
    });

    // Reset form
    setFormData({
      term: '',
      category: 'primary',
      synonyms: '',
      related: '',
      weight: 0.5,
    });
    setErrors({});
  };

  const handleCancel = () => {
    setFormData({
      term: '',
      category: 'primary',
      synonyms: '',
      related: '',
      weight: 0.5,
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Search Term</DialogTitle>
            <DialogDescription>
              Create a new search term with synonyms and related concepts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Term */}
            <div className="space-y-2">
              <Label htmlFor="term">
                Term <span className="text-destructive">*</span>
              </Label>
              <Input
                id="term"
                placeholder="e.g., authentication"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className={errors.term ? 'border-destructive' : ''}
              />
              {errors.term && (
                <p className="text-sm text-destructive">{errors.term}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: 'primary' | 'synonyms' | 'related') =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="synonyms">Synonyms</SelectItem>
                  <SelectItem value="related">Related</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Primary terms are main concepts, synonyms are alternative names, related are
                associated concepts
              </p>
            </div>

            {/* Synonyms */}
            <div className="space-y-2">
              <Label htmlFor="synonyms">Synonyms</Label>
              <Input
                id="synonyms"
                placeholder="auth, login, session"
                value={formData.synonyms}
                onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated alternative terms
              </p>
            </div>

            {/* Related */}
            <div className="space-y-2">
              <Label htmlFor="related">Related Terms</Label>
              <Input
                id="related"
                placeholder="access-control, identity"
                value={formData.related}
                onChange={(e) => setFormData({ ...formData, related: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated related concepts
              </p>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weight">Relevance Weight</Label>
                <span className="text-sm font-medium">
                  {(formData.weight * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                id="weight"
                value={[formData.weight]}
                onValueChange={(value) => setFormData({ ...formData, weight: value[0] })}
                min={0}
                max={1}
                step={0.05}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Higher weight means stronger relevance in fuzzy search (0-100%)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Term</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
