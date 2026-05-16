import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const type = requestUrl.searchParams.get('type');

    if (code) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Redirect to dashboard after successful callback
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      }
    }

    // Handle different callback types
    if (type === 'recovery') {
      // For password recovery, redirect to reset password page
      const token = requestUrl.searchParams.get('token');
      return NextResponse.redirect(
        new URL(`/auth/reset-password?token=${token}`, requestUrl.origin)
      );
    }

    if (type === 'invite') {
      return NextResponse.redirect(new URL('/auth/signup', requestUrl.origin));
    }

    // Default: redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}
