import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates, createTemplate, searchTemplates } from '@/lib/storage/templates';
import type { CreateTemplateInput } from '@/types/template';

// GET /api/templates - Get all templates or search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    let templates;
    if (query) {
      templates = await searchTemplates(query);
    } else {
      templates = await getAllTemplates();
    }

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
      },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.subject) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and subject are required',
        },
        { status: 400 }
      );
    }

    const input: CreateTemplateInput = {
      name: body.name,
      description: body.description,
      subject: body.subject,
      html: body.html,
      category: body.category,
      tags: body.tags,
    };

    // TODO: Get userId from session/auth
    const userId = 'default-user';

    const template = await createTemplate(input, userId);

    return NextResponse.json(
      {
        success: true,
        data: template,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create template',
      },
      { status: 500 }
    );
  }
}
