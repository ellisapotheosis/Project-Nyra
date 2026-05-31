'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { Save, Download, Eye, ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';

interface EditorToolbarProps {
  templateName: string;
  templateSubject: string;
  templateDescription?: string;
  templateCategory?: string;
  templateTags?: string[];
  onTemplateNameChange: (name: string) => void;
  onTemplateSubjectChange: (subject: string) => void;
  onTemplateDescriptionChange?: (description: string) => void;
  onTemplateCategoryChange?: (category: string) => void;
  onTemplateTagsChange?: (tags: string[]) => void;
  onSave: () => void;
  onExport: () => void;
  onPreview: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
}

export function EditorToolbar({
  templateName,
  templateSubject,
  templateDescription = '',
  templateCategory = '',
  templateTags = [],
  onTemplateNameChange,
  onTemplateSubjectChange,
  onTemplateDescriptionChange,
  onTemplateCategoryChange,
  onTemplateTagsChange,
  onSave,
  onExport,
  onPreview,
  isSaving = false,
  isDirty = false,
}: EditorToolbarProps) {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 transition-colors">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Back button and Template info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link href="/templates">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setShowSettingsDialog(true)}
                className="text-left w-full"
              >
                <h2 className="text-lg font-semibold truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors dark:text-white">
                  {templateName || 'Untitled Template'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {templateSubject || 'No subject'}
                </p>
              </button>
            </div>
            {isDirty && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Unsaved changes
              </span>
            )}
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>

            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving || !isDirty}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Template Settings</DialogTitle>
            <DialogDescription>
              Update your template name and email subject
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Welcome Email"
                value={templateName}
                onChange={(e) => onTemplateNameChange(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                placeholder="e.g., A warm welcome email for new subscribers"
                value={templateDescription}
                onChange={(e) => onTemplateDescriptionChange?.(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-subject">Email Subject</Label>
              <Input
                id="template-subject"
                placeholder="e.g., Welcome to {{company_name}}!"
                value={templateSubject}
                onChange={(e) => onTemplateSubjectChange(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tip: Use variables like {'{{'} name {'}}'},  {'{{'} email {'}}'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-category">Category (Optional)</Label>
              <Select
                value={templateCategory}
                onValueChange={(value) => onTemplateCategoryChange?.(value)}
              >
                <SelectTrigger id="template-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Newsletter">Newsletter</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Transactional">Transactional</SelectItem>
                  <SelectItem value="Onboarding">Onboarding</SelectItem>
                  <SelectItem value="Promotional">Promotional</SelectItem>
                  <SelectItem value="Announcement">Announcement</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-tags">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="template-tags"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagInput.trim()) {
                      e.preventDefault();
                      if (!templateTags.includes(tagInput.trim())) {
                        onTemplateTagsChange?.([...templateTags, tagInput.trim()]);
                      }
                      setTagInput('');
                    }
                  }}
                />
              </div>
              {templateTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {templateTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          onTemplateTagsChange?.(templateTags.filter((_, i) => i !== index));
                        }}
                        className="hover:text-red-600 dark:hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Press Enter to add tags
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettingsDialog(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
