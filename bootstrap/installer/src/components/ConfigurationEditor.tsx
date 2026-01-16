import React, { useState, useEffect } from 'react';
import { ConfigFileData } from '../types/manifest';

interface ConfigurationEditorProps {
  onComplete?: () => void;
}

const CONFIG_FILES: Omit<ConfigFileData, 'content'>[] = [
  {
    path: '.env',
    type: 'env',
    editable: true,
  },
  {
    path: 'docker-compose.yml',
    type: 'yaml',
    editable: true,
  },
  {
    path: 'docker-compose.infisical.yml',
    type: 'yaml',
    editable: true,
  },
  {
    path: '.mcp.json',
    type: 'json',
    editable: true,
  },
  {
    path: 'claude-flow.config.json',
    type: 'json',
    editable: true,
  },
];

export const ConfigurationEditor: React.FC<ConfigurationEditorProps> = ({ onComplete }) => {
  const [configFiles, setConfigFiles] = useState<ConfigFileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<ConfigFileData | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      setEditedContent(selectedFile.content);
      setHasChanges(false);
    }
  }, [selectedFile]);

  const loadConfigFiles = async () => {
    setLoading(true);
    try {
      // TODO: Load actual file contents from backend
      const filesWithContent: ConfigFileData[] = CONFIG_FILES.map((file) => ({
        ...file,
        content: getMockContent(file.path),
      }));
      setConfigFiles(filesWithContent);
      if (filesWithContent.length > 0) {
        setSelectedFile(filesWithContent[0]);
      }
    } catch (error) {
      console.error('Failed to load config files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockContent = (path: string): string => {
    switch (path) {
      case '.env':
        return `# Project Nyra Environment Variables
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
INFISICAL_TOKEN=...

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
POSTGRES_DB=nyra

# Services
GITEA_ADMIN_USER=admin
GITEA_ADMIN_PASSWORD=changeme

# Environment
NODE_ENV=development
LOG_LEVEL=info`;

      case 'docker-compose.yml':
        return `version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  gitea:
    image: gitea/gitea:latest
    environment:
      - USER_UID=1000
      - USER_GID=1000
    ports:
      - "3000:3000"
      - "2222:22"
    volumes:
      - gitea-data:/data
    depends_on:
      - postgres

volumes:
  postgres-data:
  gitea-data:`;

      case '.mcp.json':
        return JSON.stringify(
          {
            mcpServers: {
              'claude-flow': {
                command: 'npx',
                args: ['-y', '@claude-flow/cli@latest'],
              },
              'ruv-swarm': {
                command: 'npx',
                args: ['-y', 'ruv-swarm', 'mcp', 'start'],
              },
            },
          },
          null,
          2
        );

      case 'claude-flow.config.json':
        return JSON.stringify(
          {
            version: '3.0.0',
            providers: {
              anthropic: {
                apiKey: '${ANTHROPIC_API_KEY}',
                model: 'claude-sonnet-4-5',
              },
            },
            memory: {
              backend: 'hybrid',
              path: './data/memory',
            },
            hooks: {
              enabled: true,
            },
          },
          null,
          2
        );

      default:
        return '';
    }
  };

  const handleContentChange = (value: string) => {
    setEditedContent(value);
    setHasChanges(value !== selectedFile?.content);
  };

  const handleSave = async () => {
    if (!selectedFile || !hasChanges) return;

    setSaving(true);
    try {
      // TODO: Save to backend
      console.log('Saving file:', selectedFile.path, editedContent);

      // Update local state
      setConfigFiles((prev) =>
        prev.map((file) =>
          file.path === selectedFile.path ? { ...file, content: editedContent } : file
        )
      );
      setSelectedFile({ ...selectedFile, content: editedContent });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save file:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedFile) {
      setEditedContent(selectedFile.content);
      setHasChanges(false);
    }
  };

  const getFileIcon = (type: ConfigFileData['type']) => {
    switch (type) {
      case 'env':
        return '📄';
      case 'yaml':
        return '📋';
      case 'json':
        return '📦';
      case 'toml':
        return '⚙️';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configuration files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuration Editor</h1>
        <p className="text-gray-600">Edit environment variables and configuration files</p>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* File List Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Files</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {configFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                    ${selectedFile?.path === file.path ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.path}</p>
                      <p className="text-xs text-gray-500">{file.type.toUpperCase()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Panel */}
        <div className="col-span-12 lg:col-span-9">
          {selectedFile ? (
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedFile.path}</h3>
                  {hasChanges && (
                    <p className="text-xs text-orange-600 mt-0.5">Unsaved changes</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    disabled={!hasChanges}
                    className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>

              <textarea
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                disabled={!selectedFile.editable}
                className="w-full h-[500px] p-4 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none resize-none"
                spellCheck={false}
              />

              {!selectedFile.editable && (
                <div className="bg-yellow-50 border-t border-yellow-200 px-4 py-3">
                  <p className="text-sm text-yellow-800">This file is read-only</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
              <p className="text-gray-500">Select a file to edit</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">ℹ</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Configuration Tips</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>API keys in .env file will be encrypted with Infisical</li>
                <li>Docker Compose files support environment variable substitution</li>
                <li>MCP server configuration is auto-generated from enabled servers</li>
                <li>Changes will be validated before being applied</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
