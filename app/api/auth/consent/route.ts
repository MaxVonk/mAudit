import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  const clientId = process.env.AZURE_CLIENT_ID;
  const redirectUri = process.env.AZURE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

  if (!clientId) {
    // If client ID is not configured, redirect to demo mode with informative banner
    return NextResponse.redirect(
      new URL('/connect?error=no_azure_client_id', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
    );
  }

  const state = crypto.randomBytes(16).toString('hex');
  const encodedRedirect = encodeURIComponent(redirectUri);

  const consentUrl = `https://login.microsoftonline.com/common/adminconsent?client_id=${clientId}&redirect_uri=${encodedRedirect}&state=${state}`;

  const response = NextResponse.redirect(consentUrl);
  // Store CSRF state in cookie for validation
  response.cookies.set('maudit_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
  });

  return response;
}

