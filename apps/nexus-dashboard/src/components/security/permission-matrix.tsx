'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Save, RotateCcw } from 'lucide-react';

interface Permission {
  resource: string;
  group: string;
  allow: boolean;
  override?: boolean;
}

interface PermissionMatrixProps {
  onPermissionsChange?: (permissions: Permission[]) => void;
}

export function PermissionMatrix({ onPermissionsChange }: PermissionMatrixProps) {
  const [permissions, setPermissions] = useState<Permission[]>([
    // Server-level permissions
    { resource: 'claude-flow-server', group: 'administrators', allow: true },
    { resource: 'claude-flow-server', group: 'developers', allow: true },
    { resource: 'claude-flow-server', group: 'viewers', allow: false },
    // Tool-level permissions (more specific overrides)
    { resource: 'function_calling_tool', group: 'administrators', allow: true, override: true },
    { resource: 'function_calling_tool', group: 'developers', allow: true, override: true },
    { resource: 'function_calling_tool', group: 'viewers', allow: false, override: true },
    { resource: 'web_search_tool', group: 'administrators', allow: true },
    { resource: 'web_search_tool', group: 'developers', allow: true },
    { resource: 'web_search_tool', group: 'viewers', allow: false },
    { resource: 'code_interpreter', group: 'administrators', allow: true, override: true },
    { resource: 'code_interpreter', group: 'developers', allow: false, override: true },
    { resource: 'code_interpreter', group: 'viewers', allow: false },
  ]);

  const servers = ['claude-flow-server'];
  const tools = ['function_calling_tool', 'web_search_tool', 'code_interpreter'];
  const groups = ['administrators', 'developers', 'viewers'];

  const handlePermissionChange = (resource: string, group: string, allow: boolean) => {
    const updatedPermissions = permissions.map((p) =>
      p.resource === resource && p.group === group ? { ...p, allow } : p
    );
    setPermissions(updatedPermissions);
    onPermissionsChange?.(updatedPermissions);
  };

  const handleReset = () => {
    setPermissions(permissions.map((p) => ({ ...p, allow: false })));
  };

  const getPermission = (resource: string, group: string) => {
    return permissions.find((p) => p.resource === resource && p.group === group);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <CardDescription>
          Configure access control for servers and tools by user group
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              Server-Level Permissions
              <Badge variant="secondary" className="text-xs">Global</Badge>
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Server</TableHead>
                    {groups.map((group) => (
                      <TableHead key={group} className="text-center w-24">
                        {group}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servers.map((server) => (
                    <TableRow key={server}>
                      <TableCell className="font-medium">{server}</TableCell>
                      {groups.map((group) => {
                        const perm = getPermission(server, group);
                        return (
                          <TableCell key={`${server}-${group}`} className="text-center">
                            <Checkbox
                              checked={perm?.allow || false}
                              onCheckedChange={(checked) =>
                                handlePermissionChange(server, group, checked === true)
                              }
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              Tool-Level Permissions
              <Badge variant="secondary" className="text-xs">Overrides Server</Badge>
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Tool</TableHead>
                    {groups.map((group) => (
                      <TableHead key={group} className="text-center w-24">
                        {group}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.map((tool) => (
                    <TableRow key={tool}>
                      <TableCell className="font-medium">{tool}</TableCell>
                      {groups.map((group) => {
                        const perm = getPermission(tool, group);
                        return (
                          <TableCell key={`${tool}-${group}`} className="text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perm?.allow || false}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(tool, group, checked === true)
                                }
                              />
                              {perm?.override && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Override
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Deny All
          </Button>
          <Button className="ml-auto">
            <Save className="h-4 w-4 mr-2" />
            Save Permissions
          </Button>
        </div>

        <div className="bg-blue-950/20 border border-blue-500/20 rounded-md p-3 text-sm text-muted-foreground">
          <p className="font-semibold text-blue-50 mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Server-level permissions apply globally to all tools on that server</li>
            <li>Tool-level permissions override server settings (more specific rules win)</li>
            <li>Allow access by checking the box; unchecked means deny</li>
            <li>Changes take effect immediately after saving</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}