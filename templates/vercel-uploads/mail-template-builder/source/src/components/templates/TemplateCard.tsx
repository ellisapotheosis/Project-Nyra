import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { EmailTemplate } from '@/types/template';
import { Mail, MoreVertical, Edit, Trash2, Copy, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit?: (template: EmailTemplate) => void;
  onDelete?: (template: EmailTemplate) => void;
  onDuplicate?: (template: EmailTemplate) => void;
  onPreview?: (template: EmailTemplate) => void;
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: TemplateCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow flex flex-col h-full dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate leading-none">{template.name}</CardTitle>
              <CardDescription className="text-sm break-words line-clamp-2 mt-2">
                {template.description || 'No description'}
              </CardDescription>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onPreview && (
                <DropdownMenuItem onClick={() => onPreview(template)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(template)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem onClick={() => onDuplicate(template)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(template)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Subject */}
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">Subject: </span>
            <span className="font-medium break-words dark:text-gray-200">{template.subject}</span>
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {template.variables.length} variable(s): {template.variables.slice(0, 3).join(', ')}
              {template.variables.length > 3 && '...'}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <span>
              Updated {formatDistanceToNow(new Date(template.updatedAt), { addSuffix: true })}
            </span>
            {template.category && (
              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">
                {template.category}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="flex gap-2 pt-3 mt-auto">
          <Link href={`/editor?id=${template.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          {onPreview && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPreview(template)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
