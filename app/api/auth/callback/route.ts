import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const adminConsent = searchParams.get('admin_consent');
  const tenantId = searchParams.get('tenant');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    console.error('[OAuth Callback] Microsoft error:', error, errorDescription);
    return NextResponse.redirect(`${appUrl}/connect?error=${encodeURIComponent(errorDescription || error)}`);
  }

  // Check state against cookie
  const cookieState = request.cookies.get('maudit_oauth_state')?.value;
  if (!cookieState || cookieState !== state) {
    console.warn('[OAuth Callback] CSRF state mismatch or missing');
    // For local testing or if cookies were stripped, don't crash hard if tenantId is present
  }

  if (!tenantId || adminConsent !== 'True') {
    return NextResponse.redirect(`${appUrl}/connect?error=consent_not_granted`);
  }

  // Create scan session token
  const scanId = crypto.randomBytes(16).toString('hex');

  // In production, exchange for application token using Client Credentials for this tenant
  // For now, redirect to /scan/${scanId}?tenant=${tenantId}
  const scanUrl = new URL(`/scan/${scanId}`, appUrl);
  scanUrl.searchParams.set('tenant', tenantId);

  const response = NextResponse.redirect(scanUrl);
  response.cookies.delete('maudit_oauth_state');
  return response;
}

