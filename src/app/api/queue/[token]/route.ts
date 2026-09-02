import { NextRequest, NextResponse } from 'next/server';
import { getPatientRecord } from '@/lib/store';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token parameter is required' }, { status: 400 });
    }

    const record = getPatientRecord(token);
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
