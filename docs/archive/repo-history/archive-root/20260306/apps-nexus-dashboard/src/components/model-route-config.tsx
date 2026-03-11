'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Zap, Edit, Trash2 } from 'lucide-react';
import { ModelRoute } from '@/lib/store';
import { useState } from 'react';

interface ModelRouteConfigProps {
  routes: ModelRoute[];
  onUpdate: (id: string, updates: Partial<ModelRoute>) => void;
  onDelete?: (id: string) => void;
}

export function ModelRouteConfig({ routes, onUpdate, onDelete }: ModelRouteConfigProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ModelRoute>>({});

  const startEdit = (route: ModelRoute) => {
    setEditingId(route.id);
    setEditValues(route);
  };

  const saveEdit = () => {
    if (editingId && editValues) {
      onUpdate(editingId, editValues);
      setEditingId(null);
      setEditValues({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  return (
    <div className="space-y-4">
      {routes.map((route) => {
        const isEditing = editingId === route.id;

        return (
          <Card key={route.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">
                    {isEditing ? (
                      <Input
                        value={editValues.pattern || route.pattern}
                        onChange={(e) =>
                          setEditValues({ ...editValues, pattern: e.target.value })
                        }
                        placeholder="Pattern"
                        className="h-8"
                      />
                    ) : (
                      <code className="font-mono text-base">{route.pattern}</code>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isEditing ? editValues.enabled : route.enabled}
                    onCheckedChange={(checked) =>
                      isEditing
                        ? setEditValues({ ...editValues, enabled: checked })
                        : onUpdate(route.id, { enabled: checked })
                    }
                  />
                  <Badge variant={route.enabled ? 'success' : 'secondary'}>
                    {route.enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Target Model</span>
                  {isEditing ? (
                    <Input
                      value={editValues.targetModel || route.targetModel}
                      onChange={(e) =>
                        setEditValues({ ...editValues, targetModel: e.target.value })
                      }
                      placeholder="Target Model"
                      className="h-8 w-1/2"
                    />
                  ) : (
                    <span className="font-mono font-semibold">{route.targetModel}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Priority</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={editValues.priority ?? route.priority}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          priority: parseInt(e.target.value),
                        })
                      }
                      className="h-8 w-20"
                    />
                  ) : (
                    <Badge variant="outline">{route.priority}</Badge>
                  )}
                </div>

                <Separator />

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={saveEdit} size="sm" className="flex-1">
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => startEdit(route)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {onDelete && (
                        <Button
                          onClick={() => onDelete(route.id)}
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
