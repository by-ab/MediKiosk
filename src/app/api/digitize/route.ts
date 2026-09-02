import { NextRequest, NextResponse } from 'next/server';
import { getPatientRecord, addDocumentToRecord } from '@/lib/store';
import { digitizeDocument } from '@/lib/gemini';
import { DigitizedDocument } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, imageBase64, mimeType, filename, presetId } = body as {
      token: string;
      imageBase64?: string;
      mimeType?: string;
      filename?: string;
      presetId?: string;
    };

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const record = getPatientRecord(token);
    if (!record) {
      return NextResponse.json({ error: 'Patient record not found for token: ' + token }, { status: 404 });
    }

    // Process document using Gemini Vision or preset
    const extraction = await digitizeDocument({
      imageBase64,
      mimeType,
      filename,
      presetId,
    });

    const newDoc: DigitizedDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      filename: extraction.filename,
      documentType: extraction.documentType,
      date: extraction.date,
      medications: extraction.medications,
      diagnosis: extraction.diagnosis,
      confidenceAssessment: extraction.confidenceAssessment,
      confidenceReason: extraction.confidenceReason,
      flaggedForVerification: extraction.flaggedForVerification,
      imageUrl: extraction.imageUrl,
      uploadedAt: new Date().toISOString(),
    };

    addDocumentToRecord(token, newDoc);
    const updatedRecord = getPatientRecord(token)!;

    return NextResponse.json({
      success: true,
      document: newDoc,
      totalDocuments: updatedRecord.documents.length,
      allDocuments: updatedRecord.documents,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
