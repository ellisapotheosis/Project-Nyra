'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AlertCircle, Check, Copy } from 'lucide-react';

interface ConfigEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (errors: ValidationError[]) => void;
  readOnly?: boolean;
  title?: string;
  description?: string;
}

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

const TOML_KEYWORDS = [
  'true',
  'false',
  'null',
  'date',
  'time',
  'datetime',
  'integer',
  'float',
  'string',
  'array',
  'table',
];

const validateTOML = (content: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    const trimmed = line.trim();

    // Check for unclosed strings
    const stringCount = (line.match(/"/g) || []).length;
    if (stringCount % 2 !== 0) {
      errors.push({
        line: lineIndex + 1,
        column: line.lastIndexOf('"'),
        message: 'Unclosed string literal',
        severity: 'error',
      });
    }

    // Check for unclosed brackets
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      errors.push({
        line: lineIndex + 1,
        column: line.length,
        message: 'Mismatched brackets',
        severity: 'error',
      });
    }

    // Check for unclosed braces
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push({
        line: lineIndex + 1,
        column: line.length,
        message: 'Mismatched braces',
        severity: 'error',
      });
    }

    // Check for invalid key-value pairs
    if (!trimmed.startsWith('#') && !trimmed.startsWith('[') && trimmed.length > 0) {
      if (!trimmed.includes('=')) {
        errors.push({
          line: lineIndex + 1,
          column: 0,
          message: 'Invalid key-value pair (missing =)',
          severity: 'warning',
        });
      }
    }

    // Check for environment variable pattern
    const envVarMatches = line.match(/\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g);
    if (envVarMatches) {
      envVarMatches.forEach((match) => {
        const varName = match.slice(2, -1);
        if (!process.env[varName]) {
          const column = line.indexOf(match);
          errors.push({
            line: lineIndex + 1,
            column,
            message: `Environment variable not found: ${varName}`,
            severity: 'warning',
          });
        }
      });
    }
  });

  return errors;
};

const highlightTOML = (code: string): React.ReactNode[] => {
  const lines = code.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIndex) => {
    const tokens: React.ReactNode[] = [];
    let currentPos = 0;

    // Comment
    const commentIndex = line.indexOf('#');
    if (commentIndex !== -1) {
      if (currentPos < commentIndex) {
        tokens.push(processTokens(line.substring(currentPos, commentIndex)));
      }
      tokens.push(
        <span key={`comment-${lineIndex}`} className="text-green-600 dark:text-green-400">
          {line.substring(commentIndex)}
        </span>
      );
      result.push(
        <div key={lineIndex} className="flex">
          <span className="text-muted-foreground w-8 text-right pr-4 select-none">{lineIndex + 1}</span>
          <span className="flex-1 whitespace-pre-wrap break-words">{tokens}</span>
        </div>
      );
      return;
    }

    // Table header [section]
    if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
      tokens.push(
        <span key={`bracket-${lineIndex}`} className="text-yellow-600 dark:text-yellow-400">
          {line}
        </span>
      );
      result.push(
        <div key={lineIndex} className="flex">
          <span className="text-muted-foreground w-8 text-right pr-4 select-none">{lineIndex + 1}</span>
          <span className="flex-1 whitespace-pre-wrap break-words">{tokens}</span>
        </div>
      );
      return;
    }

    // Key-value pairs
    const eqIndex = line.indexOf('=');
    if (eqIndex !== -1) {
      // Key part
      tokens.push(
        <span key={`key-${lineIndex}`} className="text-blue-600 dark:text-blue-400">
          {line.substring(0, eqIndex).trim()}
        </span>
      );
      tokens.push(' = ');

      // Value part
      const valueStr = line.substring(eqIndex + 1).trim();
      tokens.push(parseValue(valueStr, lineIndex));

      result.push(
        <div key={lineIndex} className="flex">
          <span className="text-muted-foreground w-8 text-right pr-4 select-none">{lineIndex + 1}</span>
          <span className="flex-1 whitespace-pre-wrap break-words">{tokens}</span>
        </div>
      );
      return;
    }

    // Default case
    result.push(
      <div key={lineIndex} className="flex">
        <span className="text-muted-foreground w-8 text-right pr-4 select-none">{lineIndex + 1}</span>
        <span className="flex-1 whitespace-pre-wrap break-words">{line}</span>
      </div>
    );
  });

  return result;
};

const processTokens = (text: string): React.ReactNode[] => {
  const result: React.ReactNode[] = [];
  const regex = new RegExp(`\\b(${TOML_KEYWORDS.join('|')})\\b`, 'g');

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index));
    }
    result.push(
      <span key={`kw-${match.index}`} className="text-purple-600 dark:text-purple-400">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result;
};

const parseValue = (value: string, lineIndex: number): React.ReactNode => {
  if (value.startsWith('"') && value.endsWith('"')) {
    return (
      <span key={`str-${lineIndex}`} className="text-red-600 dark:text-red-400">
        {value}
      </span>
    );
  }
  if (value === 'true' || value === 'false') {
    return (
      <span key={`bool-${lineIndex}`} className="text-purple-600 dark:text-purple-400">
        {value}
      </span>
    );
  }
  if (/^\d+(\.\d+)?$/.test(value)) {
    return (
      <span key={`num-${lineIndex}`} className="text-cyan-600 dark:text-cyan-400">
        {value}
      </span>
    );
  }
  if (value.startsWith('${') && value.endsWith('}')) {
    return (
      <span key={`env-${lineIndex}`} className="text-orange-600 dark:text-orange-400">
        {value}
      </span>
    );
  }
  return value;
};

export function ConfigEditor({
  initialValue = '',
  onChange,
  onValidationChange,
  readOnly = false,
  title = 'Configuration Editor',
  description = 'Edit your TOML configuration with syntax highlighting',
}: ConfigEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [copied, setCopied] = useState(false);

  const errors = useMemo(() => {
    const validationErrors = validateTOML(value);
    onValidationChange?.(validationErrors);
    return validationErrors;
  }, [value, onValidationChange]);

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(newValue);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedLines = useMemo(() => highlightTOML(value), [value]);

  return (
    <Card className="bg-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status badges */}
        {(errorCount > 0 || warningCount > 0) && (
          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {errorCount} Error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                {warningCount} Warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {errorCount === 0 && warningCount === 0 && (
              <Badge variant="outline" className="gap-1 border-green-600 text-green-600">
                <Check className="h-3 w-3" />
                Valid
              </Badge>
            )}
          </div>
        )}

        {/* Editor Container */}
        <div className="relative border rounded-md bg-slate-50 dark:bg-slate-900 overflow-hidden">
          {/* Syntax-highlighted display */}
          <div className="absolute inset-0 text-sm font-mono p-4 pointer-events-none overflow-hidden whitespace-pre-wrap break-words">
            {highlightedLines}
          </div>

          {/* Actual textarea (transparent) */}
          <textarea
            value={value}
            onChange={handleChange}
            readOnly={readOnly}
            spellCheck={false}
            className={cn(
              'relative w-full h-96 p-4 bg-transparent text-sm font-mono text-foreground resize-none overflow-auto',
              'border-0 focus:outline-none focus:ring-0',
              readOnly && 'cursor-not-allowed opacity-50'
            )}
            style={{
              color: 'transparent',
              caretColor: 'white',
              textShadow: '0 0 0 #000',
            }}
          />
        </div>

        {/* Error/Warning details */}
        {errors.length > 0 && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {errors.map((error, index) => (
              <div
                key={index}
                className={cn(
                  'text-sm p-2 rounded-md border',
                  error.severity === 'error'
                    ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                    : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
                )}
              >
                <div className="font-medium">
                  Line {error.line}, Column {error.column}
                </div>
                <div className="text-xs opacity-90">{error.message}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
