import { NextRequest, NextResponse } from 'next/server';
import { createGraphClient } from '@/lib/scanner/graph-client';
import { runLiveTenantAudit } from '@/lib/scanner/live-scanner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tenantId = body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID saknas.' }, { status: 400 });
    }

    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'AZURE_CLIENT_ID eller AZURE_CLIENT_SECRET saknas i serverns .env.' },
        { status: 500 }
      );
    }

    // 1. Acquire application access token for this specific customer tenant via Client Credentials
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenRes.ok) {
      const errJson = await tokenRes.json().catch(() => ({}));
      console.error('[Live Scan Auth Error]', errJson);
      return NextResponse.json(
        {
          error: `Kunde inte hämta access token från Microsoft: ${errJson.error_description || errJson.error || tokenRes.statusText}`,
        },
        { status: 400 }
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Initialize Microsoft Graph Client & Run Full Audit
    const graphClient = createGraphClient(accessToken);
    const report = await runLiveTenantAudit(graphClient);

    return NextResponse.json({
      success: true,
      token: report.isPublicToken,
      reportId: report.id,
      companyName: report.companyName,
      score: report.score,
    });
  } catch (error: any) {
    console.error('[Live Scan Execution Error]', error);
    return NextResponse.json(
      { error: error.message || 'Ett oväntat fel uppstod under besiktningen.' },
      { status: 500 }
    );
  }
}

