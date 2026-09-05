import { NextRequest, NextResponse } from 'next/server';
import { getPatientRecord, setRecordSummary } from '@/lib/store';
import { ClinicalSummary } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token parameter is required' }, { status: 400 });
    }

    const record = await getPatientRecord(token);
    if (!record) {
      return NextResponse.json({ error: 'Patient record not found for token: ' + token }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      record,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { summary } = body as { summary: ClinicalSummary };

    if (!token || !summary) {
      return NextResponse.json({ error: 'Token and summary are required' }, { status: 400 });
    }

    const updated = await setRecordSummary(token, summary);
    if (!updated) {
      return NextResponse.json({ error: 'Patient record not found for token: ' + token }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      record: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
