import { NextRequest, NextResponse } from 'next/server';

const CRM_API_URL = process.env.CRM_API_URL || 'http://localhost:4001';
const CRM_API_KEY = process.env.CRM_API_KEY;

export async function GET() {
  try {
    const response = await fetch(`${CRM_API_URL}/api/leads`, {
      headers: {
        'x-crm-api-key': CRM_API_KEY || ''
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch leads from CRM API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
