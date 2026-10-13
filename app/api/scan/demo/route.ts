import { NextRequest, NextResponse } from 'next/server';
import { createDemoScan } from '@/lib/scanner/demo-runner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const profileKey = body.profile === 'remediated_sme' ? 'remediated_sme' : 'vulnerable_sme';

    const report = await createDemoScan(profileKey);

    return NextResponse.json({
      success: true,
      token: report.isPublicToken,
      reportId: report.id,
      score: report.score,
      companyName: report.companyName,
    });
  } catch (error: any) {
    console.error('[API Demo Scan] Error creating demo report:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Kunde inte generera demorapport' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const profileKey = searchParams.get('profile') === 'remediated_sme' ? 'remediated_sme' : 'vulnerable_sme';
  
  try {
    const report = await createDemoScan(profileKey);
    return NextResponse.json({
      success: true,
      token: report.isPublicToken,
      reportId: report.id,
      score: report.score,
      companyName: report.companyName,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

