'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, User, Calendar, Shield } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';

interface ProfileCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    createdAt: Date;
  };
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="md:col-span-2 dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          View and manage your account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <ProfileAvatar
          name={user.name}
          email={user.email}
          avatar={user.avatar}
        />

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                value={user.name}
                className="pl-10"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                value={user.email}
                className="pl-10"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="userId"
                value={user.id}
                className="pl-10"
                disabled
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdAt">Member Since</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="createdAt"
                value={new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                className="pl-10"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
          <Button variant="outline" disabled>
            Edit Profile
          </Button>
          <Button variant="outline" disabled>
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
