'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OAuth2Config } from '@/components/security/oauth2-config';
import { PermissionMatrix } from '@/components/security/permission-matrix';
import { GroupManagement } from '@/components/security/group-management';
import { TokenTester } from '@/components/security/token-tester';
import { Shield, Lock, Users, KeyRound, Save } from 'lucide-react';

export default function SecurityPage() {
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = () => {
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    setHasChanges(false);
    // In a real app, you would save to a backend here
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Security & Access Control
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage OAuth2, permissions, groups, and security settings for the Nexus Router
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveChanges} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <Tabs defaultValue="oauth2" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="oauth2" className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span className="hidden sm:inline">OAuth2</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Groups</span>
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Test Token</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="oauth2" className="space-y-4">
          <OAuth2Config onConfigChange={handleConfigChange} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">OAuth2 Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">JWKS Endpoint</h4>
                <p className="text-muted-foreground">
                  Use a URL that returns JSON Web Keys Set. This is used to verify token signatures. Most identity providers expose this at `/.well-known/jwks.json`.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Expected Issuer</h4>
                <p className="text-muted-foreground">
                  The issuer value should match the identity provider that issued the token. This prevents tokens from other providers from being accepted.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Expected Audience</h4>
                <p className="text-muted-foreground">
                  The audience identifies the recipient of the token (your application). Set this to your API identifier or app name.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionMatrix onPermissionsChange={handleConfigChange} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permission Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Server vs Tool Permissions</h4>
                <p className="text-muted-foreground">
                  Server-level permissions are inherited by all tools on that server. Tool-level permissions override server settings, allowing for fine-grained control.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Group Inheritance</h4>
                <p className="text-muted-foreground">
                  Users inherit permissions from all groups they belong to. If any group allows access, the user has access (OR logic).
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Default Deny</h4>
                <p className="text-muted-foreground">
                  The default policy is to deny all access. Permissions must be explicitly granted via group membership.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <GroupManagement onGroupsChange={handleConfigChange} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Group Management Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">Naming Convention</h4>
                <p className="text-muted-foreground">
                  Use descriptive names that clearly indicate the group's purpose. Examples: "Backend Developers", "QA Team", "Finance Department".
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Nested Groups</h4>
                <p className="text-muted-foreground">
                  You can create sub-groups for better organization. For example: "Developers", "Senior Developers", "Junior Developers".
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Dynamic Membership</h4>
                <p className="text-muted-foreground">
                  Groups can be automatically populated based on LDAP, Active Directory, or other identity sources for centralized management.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <TokenTester />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-1">What is a JWT?</h4>
                <p className="text-muted-foreground">
                  A JSON Web Token (JWT) is a compact, self-contained way to securely transmit information between parties. It consists of three base64-encoded parts: header, payload, and signature.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Standard Claims</h4>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li><code className="bg-muted px-1 rounded text-xs">iss</code> - Issuer of the token</li>
                  <li><code className="bg-muted px-1 rounded text-xs">sub</code> - Subject (typically user ID)</li>
                  <li><code className="bg-muted px-1 rounded text-xs">aud</code> - Audience (intended recipient)</li>
                  <li><code className="bg-muted px-1 rounded text-xs">exp</code> - Expiration time</li>
                  <li><code className="bg-muted px-1 rounded text-xs">iat</code> - Issued at time</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Security Note</h4>
                <p className="text-muted-foreground">
                  Token decoding happens entirely in your browser. No tokens are sent to any server when using this tool.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="bg-blue-950/20 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-base">Security Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-blue-50 mb-1">OAuth2 Status</div>
            <p className="text-blue-100/80">Enabled with token validation</p>
          </div>
          <div>
            <div className="font-semibold text-blue-50 mb-1">Active Groups</div>
            <p className="text-blue-100/80">3 groups with 23 total members</p>
          </div>
          <div>
            <div className="font-semibold text-blue-50 mb-1">Permission Rules</div>
            <p className="text-blue-100/80">12 rules across 4 tools</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}