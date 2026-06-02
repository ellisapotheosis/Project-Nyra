import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout';
import { Mail, FileText, Eye, Download } from 'lucide-react';

export default function HomePage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors min-h-screen">
        <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Mail Template Builder
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Create beautiful email templates for bulk email marketing
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/templates">
              <Button size="lg" className="gap-2">
                <FileText className="w-5 h-5" />
                View Templates
              </Button>
            </Link>
            <Link href="/editor">
              <Button size="lg" variant="outline" className="gap-2">
                <Mail className="w-5 h-5" />
                Create New Template
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Drag & Drop Editor</CardTitle>
              <CardDescription>
                Build emails visually with an intuitive drag and drop interface
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription>
                See how your email looks on desktop and mobile devices in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Merge Variables</CardTitle>
              <CardDescription>
                Add dynamic content with merge tags like name, email, and company
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Export HTML</CardTitle>
              <CardDescription>
                Export production-ready HTML with inlined CSS for email clients
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center transition-colors">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</div>
              <div className="text-gray-600 dark:text-gray-300">Email Client Compatible</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">Mobile</div>
              <div className="text-gray-600 dark:text-gray-300">Responsive by Default</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">Fast</div>
              <div className="text-gray-600 dark:text-gray-300">Create in Under 5 Minutes</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}
