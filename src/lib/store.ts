import { kv } from '@vercel/kv';
import { PatientRecord, QueueItem, IntakeStatus, ChatMessage, DigitizedDocument, ClinicalSummary } from './types';

const SEED_KEY = 'medikiosk:seeded';
const TOKENS_KEY = 'medikiosk:tokens';
const COUNTER_KEY = 'medikiosk:token_counter';

let isSeeded = false;

async function ensureSeeded() {
  if (isSeeded) return;
  try {
    const alreadySeeded = await kv.get(SEED_KEY);
    if (alreadySeeded) {
      isSeeded = true;
      return;
    }

    // Seed Record 1: Patient intake with handwritten prescription attachment
    const p1Token = 'TK-14';
    const p1: PatientRecord = {
      token: p1Token,
      tokenNumber: 14,
      patientInfo: {
        name: 'Ramesh Verma',
        phone: '+91 98765 43210',
        abhaId: '14-8921-4456-1120',
        age: '54',
        gender: 'Male',
        authMethod: 'abha',
      },
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'Hello Ramesh. Welcome to MediKiosk. What brings you to the clinic today?',
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          socratesDimension: 'general',
        },
        {
          id: 'msg-2',
          role: 'user',
          content: 'I have had a throbbing pain in my lower abdomen for the past 3 days and slight fever.',
          timestamp: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
        },
        {
          id: 'msg-3',
          role: 'assistant',
          content: 'I understand. Does the abdominal pain stay in one spot, or does it spread anywhere else, like to your back or groin?',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          socratesDimension: 'radiation',
        },
        {
          id: 'msg-4',
          role: 'user',
          content: 'It stays mostly around the right lower side, worsens when I walk.',
          timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        },
      ],
      turnCount: 4,
      interviewCompleted: true,
      redFlagDetected: false,
      documents: [
        {
          id: 'doc-seed-1',
          filename: 'old_prescription_clinic.jpg',
          documentType: 'Handwritten Prescription',
          date: '2026-08-20',
          medications: [
            { name: 'Pantoprazole (Probable)', dosage: '40mg', frequency: 'OD', duration: '5 days', instructions: 'Before breakfast' },
            { name: 'Ciprofloxacin (Partially illegible)', dosage: '500mg?', frequency: 'BD', duration: 'Unclear', instructions: 'After meals' },
          ],
          diagnosis: ['Acute gastritis / Suspected RLQ tenderness'],
          confidenceAssessment: 'low',
          confidenceReason: 'Handwritten script has heavy cursive slant and faded ink on dosage line. High ambiguity on antibiotic strength.',
          flaggedForVerification: true,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        }
      ],
      summary: {
        chiefComplaint: 'Right lower quadrant abdominal pain x 3 days with low-grade fever.',
        hpi: '54M presents with continuous throbbing right lower quadrant pain starting 3 days ago. Pain is exacerbated by ambulation and localized with no radiation to groin. Associated with subjective fever.',
        pastMedicalHistory: 'Hypertension (diagnosed 2021, on medication).',
        drugAllergies: 'No known drug allergies (NKDA).',
        familyHistory: 'Non-contributory.',
        reviewOfSystems: 'Positive for fever and RLQ abdominal pain. Negative for nausea, vomiting, hematuria, or dysuria.',
        isDraft: true,
        flags: ['Low confidence prescription extraction — physician verification needed for Ciprofloxacin dosage.'],
        generatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      },
      status: 'waiting',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    };

    // Seed Record 2: Patient intake with printed lab report attachment
    const p2Token = 'TK-18';
    const p2: PatientRecord = {
      token: p2Token,
      tokenNumber: 18,
      patientInfo: {
        name: 'Sunita Sharma',
        phone: '+91 91234 56789',
        abhaId: '14-3321-9988-7744',
        age: '42',
        gender: 'Female',
        authMethod: 'abha',
      },
      messages: [
        {
          id: 'msg-p2-1',
          role: 'assistant',
          content: 'Hello Sunita. Welcome to MediKiosk. Please tell me what symptoms you are experiencing.',
          timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
          socratesDimension: 'general',
        },
        {
          id: 'msg-p2-2',
          role: 'user',
          content: 'Routine diabetic check-up, feeling extra thirsty and tired recently.',
          timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
        },
      ],
      turnCount: 2,
      interviewCompleted: true,
      redFlagDetected: false,
      documents: [
        {
          id: 'doc-seed-2',
          filename: 'apolo_lab_report_hba1c.pdf',
          documentType: 'Printed Lab Report',
          date: '2026-09-01',
          medications: [
            { name: 'Metformin Hydrochloride', dosage: '500mg', frequency: 'BD', duration: 'Ongoing', instructions: 'With meals' }
          ],
          diagnosis: ['Type 2 Diabetes Mellitus — HbA1c 8.4% (Elevated)'],
          confidenceAssessment: 'high',
          confidenceReason: 'Clean digital print with distinct tabular values and reference ranges.',
          flaggedForVerification: false,
          uploadedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        }
      ],
      summary: {
        chiefComplaint: 'Follow-up for diabetes management with increased fatigue and polydipsia.',
        hpi: '42F with known Type 2 Diabetes presents for routine review. Reports 2 weeks of worsening daytime lethargy and increased thirst. Denies polyuria or blurry vision.',
        pastMedicalHistory: 'Type 2 Diabetes Mellitus x 4 years.',
        drugAllergies: 'Sulfa drugs (causes rash).',
        familyHistory: 'Maternal history of T2D.',
        reviewOfSystems: 'Fatigue (+), Polydipsia (+). Weight loss (-), Paresthesia (-).',
        isDraft: true,
        flags: ['Recent HbA1c 8.4% exceeds target.'],
        generatedAt: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
      },
      status: 'in_consultation',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    };

    await Promise.all([
      kv.set(`patient:${p1Token}`, p1),
      kv.set(`patient:${p2Token}`, p2),
      kv.sadd(TOKENS_KEY, p1Token, p2Token),
      kv.set(COUNTER_KEY, 20),
      kv.set(SEED_KEY, true),
    ]);
    isSeeded = true;
  } catch (err) {
    console.error('Error during store seeding:', err);
  }
}

export async function generateNextToken(): Promise<{ token: string; tokenNumber: number }> {
  await ensureSeeded();
  const tokenNumber = await kv.incr(COUNTER_KEY);
  const token = `TK-${tokenNumber}`;
  return { token, tokenNumber };
}

export async function createPatientRecord(data: {
  patientInfo: PatientRecord['patientInfo'];
}): Promise<PatientRecord> {
  await ensureSeeded();
  const { token, tokenNumber } = await generateNextToken();
  const now = new Date().toISOString();

  const record: PatientRecord = {
    token,
    tokenNumber,
    patientInfo: data.patientInfo,
    messages: [
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Hello ${data.patientInfo.name || 'there'}. I am your MediKiosk clinical intake assistant. To help the doctor prepare for your visit, could you describe what main symptom or concern brings you in today?`,
        timestamp: now,
        socratesDimension: 'general',
      }
    ],
    turnCount: 0,
    interviewCompleted: false,
    redFlagDetected: false,
    documents: [],
    status: 'waiting',
    createdAt: now,
    updatedAt: now,
  };

  await Promise.all([
    kv.set(`patient:${token}`, record),
    kv.sadd(TOKENS_KEY, token),
  ]);
  return record;
}

export async function getPatientRecord(token: string): Promise<PatientRecord | null> {
  await ensureSeeded();
  return await kv.get<PatientRecord>(`patient:${token}`);
}

export async function updatePatientRecord(
  token: string,
  updater: (record: PatientRecord) => PatientRecord
): Promise<PatientRecord | null> {
  await ensureSeeded();
  const existing = await kv.get<PatientRecord>(`patient:${token}`);
  if (!existing) return null;
  const updated = updater({ ...existing, updatedAt: new Date().toISOString() });
  await kv.set(`patient:${token}`, updated);
  return updated;
}

export async function addMessageToRecord(token: string, message: ChatMessage): Promise<PatientRecord | null> {
  return await updatePatientRecord(token, (rec) => ({
    ...rec,
    messages: [...rec.messages, message],
    turnCount: message.role === 'user' ? rec.turnCount + 1 : rec.turnCount,
  }));
}

export async function addDocumentToRecord(token: string, doc: DigitizedDocument): Promise<PatientRecord | null> {
  return await updatePatientRecord(token, (rec) => ({
    ...rec,
    documents: [...rec.documents, doc],
  }));
}

export async function setRecordSummary(token: string, summary: ClinicalSummary): Promise<PatientRecord | null> {
  return await updatePatientRecord(token, (rec) => ({
    ...rec,
    summary,
    interviewCompleted: true,
  }));
}

export async function updateStatus(token: string, status: IntakeStatus): Promise<PatientRecord | null> {
  return await updatePatientRecord(token, (rec) => ({
    ...rec,
    status,
  }));
}

export async function listQueue(): Promise<QueueItem[]> {
  await ensureSeeded();
  const tokens = await kv.smembers<string[]>(TOKENS_KEY);
  if (!tokens || tokens.length === 0) return [];

  const keys = tokens.map((t) => `patient:${t}`);
  const records = await kv.mget<(PatientRecord | null)[]>(...keys);

  const list: QueueItem[] = [];
  for (const record of records) {
    if (!record) continue;
    const hasLowConfidenceDocs = record.documents?.some(
      (d) => d.confidenceAssessment === 'low' || d.flaggedForVerification
    ) ?? false;
    list.push({
      token: record.token,
      tokenNumber: record.tokenNumber,
      name: record.patientInfo?.name || 'Anonymous Patient',
      abhaId: record.patientInfo?.abhaId,
      phone: record.patientInfo?.phone,
      chiefComplaint: record.summary?.chiefComplaint || record.messages?.find((m) => m.role === 'user')?.content?.slice(0, 60),
      hasRedFlag: record.redFlagDetected,
      hasLowConfidenceDocs,
      docCount: record.documents?.length || 0,
      status: record.status,
      createdAt: record.createdAt,
    });
  }

  return list.sort((a, b) => a.tokenNumber - b.tokenNumber);
}
