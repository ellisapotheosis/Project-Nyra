'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TemplateGrid, DeleteTemplateDialog } from '@/components/templates';
import type { EmailTemplate } from '@/types/template';
import toast from 'react-hot-toast';
import { Plus, Search, Loader2 } from 'lucide-react';

function TemplatesContent() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      toast.error('Error loading templates');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      fetchTemplates();
      return;
    }

    try {
      const response = await fetch(`/api/templates?q=${encodeURIComponent(query)}`);
      const result = await response.json();

      if (result.success) {
        setTemplates(result.data);
      }
    } catch (error) {
      toast.error('Search failed');
      console.error(error);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    router.push(`/editor?id=${template.id}`);
  };

  const handleDelete = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/templates/${templateToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Template deleted successfully');
        setDeleteDialogOpen(false);
        setTemplateToDelete(null);
        fetchTemplates();
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      toast.error('Error deleting template');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          subject: template.subject,
          html: template.html,
          category: template.category,
          tags: template.tags,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Template duplicated successfully');
        fetchTemplates();
      } else {
        toast.error('Failed to duplicate template');
      }
    } catch (error) {
      toast.error('Error duplicating template');
      console.error(error);
    }
  };

  const handlePreview = (_template: EmailTemplate) => {
    // TODO: Implement preview modal
    toast.success('Preview feature coming soon');
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {templates.length} template{templates.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                className="pl-10 h-11"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Link href="/editor">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Create New
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <p className="text-gray-600 dark:text-gray-300">Loading templates...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && templates.length === 0 && !searchQuery && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-12 text-center transition-colors">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No templates yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Get started by creating your first email template
              </p>
              <Link href="/editor">
                <Button size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Template
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && templates.length === 0 && searchQuery && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-12 text-center transition-colors">
            <div className="max-w-md mx-auto">
              <Search className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No templates found
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Try adjusting your search query
              </p>
              <Button variant="outline" onClick={() => handleSearch('')}>
                Clear Search
              </Button>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && templates.length > 0 && (
          <TemplateGrid
            templates={templates}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onPreview={handlePreview}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <DeleteTemplateDialog
          template={templateToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </AppLayout>
  );
}

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <TemplatesContent />
    </ProtectedRoute>
  );
}
