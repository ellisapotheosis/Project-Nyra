import { TemplateCard } from './TemplateCard';
import type { EmailTemplate } from '@/types/template';

interface TemplateGridProps {
  templates: EmailTemplate[];
  onEdit?: (template: EmailTemplate) => void;
  onDelete?: (template: EmailTemplate) => void;
  onDuplicate?: (template: EmailTemplate) => void;
  onPreview?: (template: EmailTemplate) => void;
}

export function TemplateGrid({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onPreview,
}: TemplateGridProps) {
  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}
