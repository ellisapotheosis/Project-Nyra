import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"
);

// Mock user database - should match login route
const MOCK_USERS = [
  {
    id: "1",
    email: "admin@nyra.com",
    name: "Ellis Andersen",
    role: "admin",
  },
  {
    id: "2",
    email: "lo@nyra.com",
    name: "Sarah Johnson",
    role: "loan_officer",
  },
  {
    id: "3",
    email: "processor@nyra.com",
    name: "Michael Chen",
    role: "processor",
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify refresh token
    const { payload } = await jwtVerify(refreshToken, JWT_SECRET);

    if (payload.type !== "refresh") {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Find user
    const user = MOCK_USERS.find((u) => u.id === payload.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 });
    }

    // Generate new access token
    const now = Math.floor(Date.now() / 1000);
    const accessTokenExpiry = now + 15 * 60; // 15 minutes

    const accessToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(accessTokenExpiry)
      .setIssuedAt(now)
      .sign(JWT_SECRET);

    return NextResponse.json({
      tokens: {
        accessToken,
        refreshToken, // Keep the same refresh token
        expiresAt: accessTokenExpiry * 1000,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 401 }
    );
  }
}
