'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Users } from 'lucide-react';

interface UserGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  members: string[];
}

interface GroupManagementProps {
  onGroupsChange?: (groups: UserGroup[]) => void;
}

export function GroupManagement({ onGroupsChange }: GroupManagementProps) {
  const [groups, setGroups] = useState<UserGroup[]>([
    {
      id: 'admin-group',
      name: 'Administrators',
      description: 'Full access to all systems',
      memberCount: 3,
      members: ['alice@example.com', 'bob@example.com', 'charlie@example.com'],
    },
    {
      id: 'dev-group',
      name: 'Developers',
      description: 'Access to development tools and APIs',
      memberCount: 8,
      members: ['dev1@example.com', 'dev2@example.com', 'dev3@example.com', 'dev4@example.com', 'dev5@example.com', 'dev6@example.com', 'dev7@example.com', 'dev8@example.com'],
    },
    {
      id: 'viewer-group',
      name: 'Viewers',
      description: 'Read-only access to dashboards',
      memberCount: 12,
      members: Array(12).fill(null).map((_, i) => `viewer${i + 1}@example.com`),
    },
  ]);

  const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const openAddDialog = () => {
    setEditingGroup(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (group: UserGroup) => {
    setEditingGroup(group);
    setFormData({ name: group.name, description: group.description });
    setIsDialogOpen(true);
  };

  const handleSaveGroup = () => {
    if (!formData.name.trim()) return;

    if (editingGroup) {
      const updatedGroups = groups.map((g) =>
        g.id === editingGroup.id
          ? { ...g, name: formData.name, description: formData.description }
          : g
      );
      setGroups(updatedGroups);
      onGroupsChange?.(updatedGroups);
    } else {
      const newGroup: UserGroup = {
        id: `group-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        memberCount: 0,
        members: [],
      };
      const updatedGroups = [...groups, newGroup];
      setGroups(updatedGroups);
      onGroupsChange?.(updatedGroups);
    }

    setIsDialogOpen(false);
  };

  const handleDeleteGroup = (id: string) => {
    const updatedGroups = groups.filter((g) => g.id !== id);
    setGroups(updatedGroups);
    onGroupsChange?.(updatedGroups);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>User Groups</CardTitle>
          <CardDescription>
            Manage user groups and their memberships
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </DialogTitle>
              <DialogDescription>
                {editingGroup
                  ? 'Update the group information'
                  : 'Create a new user group to manage permissions'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="e.g., Developers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <Input
                  id="group-description"
                  placeholder="e.g., Access to development tools and APIs"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveGroup}>
                  {editingGroup ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {group.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">{group.memberCount}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(group)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {groups.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No groups created yet</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-3">Default Groups</h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 rounded-md bg-muted/50">
              <div className="font-medium text-sm">Administrators</div>
              <p className="text-xs text-muted-foreground">Full system access</p>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <div className="font-medium text-sm">Developers</div>
              <p className="text-xs text-muted-foreground">Development and testing access</p>
            </div>
            <div className="p-3 rounded-md bg-muted/50">
              <div className="font-medium text-sm">Viewers</div>
              <p className="text-xs text-muted-foreground">Read-only dashboard access</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}