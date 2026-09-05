import { NextRequest, NextResponse } from 'next/server';
import { getPatientRecord, setRecordSummary } from '@/lib/store';
import { generateClinicalSummary } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body as { token: string };

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const record = await getPatientRecord(token);
    if (!record) {
      return NextResponse.json({ error: 'Patient session not found for token: ' + token }, { status: 404 });
    }

    // Synthesize clinical summary
    const summary = await generateClinicalSummary(
      record.messages,
      record.documents,
      record.patientInfo.name
    );

    await setRecordSummary(token, summary);
    const updatedRecord = (await getPatientRecord(token))!;

    return NextResponse.json({
      success: true,
      token: updatedRecord.token,
      tokenNumber: updatedRecord.tokenNumber,
      patientInfo: updatedRecord.patientInfo,
      summary: updatedRecord.summary,
      documents: updatedRecord.documents,
      status: updatedRecord.status,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
