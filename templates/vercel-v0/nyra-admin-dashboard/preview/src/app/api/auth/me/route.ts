import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

// Mock user database with full user data
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@nyra.com',
    name: 'Ellis Andersen',
    role: 'admin',
    permissions: [
      'leads:view', 'leads:create', 'leads:edit', 'leads:delete', 'leads:assign',
      'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:lock_rates',
      'campaigns:view', 'campaigns:create', 'campaigns:edit', 'campaigns:send',
      'audit:view', 'users:manage', 'reports:view', 'system:config'
    ],
    avatar: null,
    lastLogin: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'lo@nyra.com',
    name: 'Sarah Johnson',
    role: 'loan_officer',
    permissions: [
      'leads:view', 'leads:create', 'leads:edit', 'leads:assign',
      'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:lock_rates',
      'campaigns:view', 'campaigns:create', 'campaigns:edit', 'campaigns:send',
      'reports:view'
    ],
    avatar: null,
    lastLogin: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'processor@nyra.com',
    name: 'Michael Chen',
    role: 'processor',
    permissions: [
      'leads:view', 'leads:edit',
      'quotes:view', 'quotes:edit',
      'campaigns:view',
      'reports:view'
    ],
    avatar: null,
    lastLogin: new Date().toISOString(),
  }
]

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Find user
    const user = MOCK_USERS.find(u => u.id === payload.userId)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { message: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}