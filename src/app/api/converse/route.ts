import { NextRequest, NextResponse } from 'next/server';
import { getPatientRecord, addMessageToRecord, updatePatientRecord } from '@/lib/store';
import { generateSocratesFollowUp } from '@/lib/gemini';
import { ChatMessage } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, message } = body as { token: string; message: string };

    if (!token || !message) {
      return NextResponse.json({ error: 'Token and message are required' }, { status: 400 });
    }

    const record = getPatientRecord(token);
    if (!record) {
      return NextResponse.json({ error: 'Patient session not found for token: ' + token }, { status: 404 });
    }

    // 1. Append patient message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    addMessageToRecord(token, userMsg);

    // 2. Query Gemini / SOCRATES engine
    const currentRecord = getPatientRecord(token)!;
    const socratesResponse = await generateSocratesFollowUp(
      currentRecord.messages,
      currentRecord.patientInfo.name
    );

    // 3. Append assistant response
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant',
      content: socratesResponse.reply,
      timestamp: new Date().toISOString(),
      socratesDimension: socratesResponse.socratesDimension,
      isRedFlag: socratesResponse.redFlagDetected,
    };
    addMessageToRecord(token, assistantMsg);

    // 4. Update session completion / red flag status
    updatePatientRecord(token, (rec) => ({
      ...rec,
      interviewCompleted: socratesResponse.isComplete,
      redFlagDetected: rec.redFlagDetected || socratesResponse.redFlagDetected,
      redFlagReason: socratesResponse.redFlagReason || rec.redFlagReason,
    }));

    const updatedRecord = getPatientRecord(token)!;

    return NextResponse.json({
      success: true,
      reply: socratesResponse.reply,
      socratesDimension: socratesResponse.socratesDimension,
      isComplete: socratesResponse.isComplete,
      redFlagDetected: socratesResponse.redFlagDetected,
      redFlagReason: socratesResponse.redFlagReason,
      turnCount: updatedRecord.turnCount,
      messages: updatedRecord.messages,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
