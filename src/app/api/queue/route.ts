import { NextRequest, NextResponse } from 'next/server';
import { listQueue, updateStatus } from '@/lib/store';
import { IntakeStatus } from '@/lib/types';

export async function GET() {
  try {
    const queue = await listQueue();
    return NextResponse.json({
      success: true,
      count: queue.length,
      queue,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, status } = body as { token: string; status: IntakeStatus };

    if (!token || !status) {
      return NextResponse.json({ error: 'Token and status are required' }, { status: 400 });
    }

    const updated = await updateStatus(token, status);
    if (!updated) {
      return NextResponse.json({ error: 'Patient token not found: ' + token }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      token: updated.token,
      status: updated.status,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
