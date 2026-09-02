import { PatientRecord, QueueItem, IntakeStatus, ChatMessage, DigitizedDocument, ClinicalSummary } from './types';

// Declare a global repository for Next.js hot module reload preservation
declare global {
  // eslint-disable-next-line no-var
  var __medikiosk_store__: Map<string, PatientRecord> | undefined;
  // eslint-disable-next-line no-var
  var __medikiosk_token_counter__: number | undefined;
}

const store: Map<string, PatientRecord> = globalThis.__medikiosk_store__ ?? new Map<string, PatientRecord>();
globalThis.__medikiosk_store__ = store;

let tokenCounter: number = globalThis.__medikiosk_token_counter__ ?? 20;
globalThis.__medikiosk_token_counter__ = tokenCounter;

function seedInitialData() {
  if (store.size > 0) return;

  // Pre-seed Demo Patient 1: Pre-existing intake with low-confidence handwritten prescription
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

  // Pre-seed Demo Patient 2: High confidence printed lab report
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

  store.set(p1Token, p1);
  store.set(p2Token, p2);
}

seedInitialData();

export function generateNextToken(): { token: string; tokenNumber: number } {
  tokenCounter += 1;
  globalThis.__medikiosk_token_counter__ = tokenCounter;
  const token = `TK-${tokenCounter}`;
  return { token, tokenNumber: tokenCounter };
}

export function createPatientRecord(data: {
  patientInfo: PatientRecord['patientInfo'];
}): PatientRecord {
  const { token, tokenNumber } = generateNextToken();
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

  store.set(token, record);
  return record;
}

export function getPatientRecord(token: string): PatientRecord | undefined {
  return store.get(token);
}

export function updatePatientRecord(
  token: string,
  updater: (record: PatientRecord) => PatientRecord
): PatientRecord | undefined {
  const existing = store.get(token);
  if (!existing) return undefined;
  const updated = updater({ ...existing, updatedAt: new Date().toISOString() });
  store.set(token, updated);
  return updated;
}

export function addMessageToRecord(token: string, message: ChatMessage): PatientRecord | undefined {
  return updatePatientRecord(token, (rec) => ({
    ...rec,
    messages: [...rec.messages, message],
    turnCount: message.role === 'user' ? rec.turnCount + 1 : rec.turnCount,
  }));
}

export function addDocumentToRecord(token: string, doc: DigitizedDocument): PatientRecord | undefined {
  return updatePatientRecord(token, (rec) => ({
    ...rec,
    documents: [...rec.documents, doc],
  }));
}

export function setRecordSummary(token: string, summary: ClinicalSummary): PatientRecord | undefined {
  return updatePatientRecord(token, (rec) => ({
    ...rec,
    summary,
    interviewCompleted: true,
  }));
}

export function updateStatus(token: string, status: IntakeStatus): PatientRecord | undefined {
  return updatePatientRecord(token, (rec) => ({
    ...rec,
    status,
  }));
}

export function listQueue(): QueueItem[] {
  const list: QueueItem[] = [];
  store.forEach((record) => {
    const hasLowConfidenceDocs = record.documents.some(
      (d) => d.confidenceAssessment === 'low' || d.flaggedForVerification
    );
    list.push({
      token: record.token,
      tokenNumber: record.tokenNumber,
      name: record.patientInfo.name || 'Anonymous Patient',
      abhaId: record.patientInfo.abhaId,
      phone: record.patientInfo.phone,
      chiefComplaint: record.summary?.chiefComplaint || record.messages.find(m => m.role === 'user')?.content?.slice(0, 60),
      hasRedFlag: record.redFlagDetected,
      hasLowConfidenceDocs,
      docCount: record.documents.length,
      status: record.status,
      createdAt: record.createdAt,
    });
  });

  return list.sort((a, b) => a.tokenNumber - b.tokenNumber);
}
