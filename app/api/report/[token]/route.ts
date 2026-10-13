import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { StoredScanReport } from '@/lib/types';
import { computeScanDiff } from '@/lib/diff';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  try {
    const report = await prisma.scanReport.findUnique({
      where: { isPublicToken: token },
    });

    if (!report) {
      return NextResponse.json({ error: 'Rapporten kunde inte hittas eller har raderats.' }, { status: 404 });
    }

    // Check expiry (14 days)
    if (new Date() > new Date(report.expiresAt)) {
      await prisma.scanReport.delete({ where: { id: report.id } });
      return NextResponse.json({ error: 'Denna rapport har passerat sin 14-dagars giltighetstid och har raderats.' }, { status: 410 });
    }

    const categoryScores = JSON.parse(report.categoryScores);
    const findings = JSON.parse(report.findings);
    const summaryStats = JSON.parse(report.summaryStats);

    // Look for previous scan for diffing
    const previous = await prisma.scanReport.findFirst({
      where: {
        tenantIdHash: report.tenantIdHash,
        createdAt: { lt: report.createdAt },
      },
      orderBy: { createdAt: 'desc' },
    });

    let diff;
    if (previous) {
      try {
        const prevFindings = JSON.parse(previous.findings);
        diff = computeScanDiff(
          report.score,
          findings,
          previous.score,
          prevFindings,
          previous.createdAt.toISOString()
        );
      } catch (e) {
        console.warn('Diff parsing failed:', e);
      }
    }

    const responseData: StoredScanReport = {
      id: report.id,
      tenantIdHash: report.tenantIdHash,
      companyName: report.companyName,
      score: report.score,
      categoryScores,
      findings,
      summaryStats,
      createdAt: report.createdAt.toISOString(),
      expiresAt: report.expiresAt.toISOString(),
      isPublicToken: report.isPublicToken,
      diff,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('[API Report] Error:', error);
    return NextResponse.json({ error: 'Kunde inte hämta besiktningsrapporten.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  try {
    const report = await prisma.scanReport.findUnique({
      where: { isPublicToken: token },
    });

    if (!report) {
      return NextResponse.json({ error: 'Rapporten hittades inte.' }, { status: 404 });
    }

    await prisma.scanReport.delete({
      where: { id: report.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Rapporten och tillhörande analysdata har raderats permanent.',
    });
  } catch (error: any) {
    console.error('[API Report Delete] Error:', error);
    return NextResponse.json({ error: 'Kunde inte radera rapporten.' }, { status: 500 });
  }
}

