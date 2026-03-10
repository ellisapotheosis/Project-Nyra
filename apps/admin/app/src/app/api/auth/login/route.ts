import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

// Mock user database - Replace with actual database integration
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@nyra.com',
    password: 'admin123', // In production, use bcrypt
    name: 'Ellis Andersen',
    role: 'admin',
    permissions: [
      'leads:view', 'leads:create', 'leads:edit', 'leads:delete', 'leads:assign',
      'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:lock_rates',
      'campaigns:view', 'campaigns:create', 'campaigns:edit', 'campaigns:send',
      'audit:view', 'users:manage', 'reports:view', 'system:config'
    ],
    avatar: null,
    lastLogin: null,
  },
  {
    id: '2',
    email: 'lo@nyra.com',
    password: 'lo123',
    name: 'Sarah Johnson',
    role: 'loan_officer',
    permissions: [
      'leads:view', 'leads:create', 'leads:edit', 'leads:assign',
      'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:lock_rates',
      'campaigns:view', 'campaigns:create', 'campaigns:edit', 'campaigns:send',
      'reports:view'
    ],
    avatar: null,
    lastLogin: null,
  },
  {
    id: '3',
    email: 'processor@nyra.com',
    password: 'processor123',
    name: 'Michael Chen',
    role: 'processor',
    permissions: [
      'leads:view', 'leads:edit',
      'quotes:view', 'quotes:edit',
      'campaigns:view',
      'reports:view'
    ],
    avatar: null,
    lastLogin: null,
  }
]

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate tokens
    const now = Math.floor(Date.now() / 1000)
    const accessTokenExpiry = now + (15 * 60) // 15 minutes
    const refreshTokenExpiry = now + (7 * 24 * 60 * 60) // 7 days

    const accessToken = await new SignJWT({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(accessTokenExpiry)
      .setIssuedAt(now)
      .sign(JWT_SECRET)

    const refreshToken = await new SignJWT({ 
      userId: user.id, 
      type: 'refresh' 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(refreshTokenExpiry)
      .setIssuedAt(now)
      .sign(JWT_SECRET)

    // Update last login
    user.lastLogin = new Date().toISOString()

    // Return user data and tokens
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword,
      tokens: {
        accessToken,
        refreshToken,
        expiresAt: accessTokenExpiry * 1000, // Convert to milliseconds
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}