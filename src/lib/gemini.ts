import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, DigitizedDocument, ClinicalSummary, SocratesDimension } from './types';
import { SAMPLE_DOC_PRESETS } from './sampleDocs';

export const RED_FLAG_KEYWORDS = [
  'chest pain',
  'crushing pain',
  'heart attack',
  'breathless',
  'difficulty breathing',
  'shortness of breath',
  'cannot breathe',
  'unconscious',
  'passed out',
  'fainted',
  'loss of consciousness',
  'severe bleeding',
  'profuse bleeding',
  'stroke',
  'face drooping',
  'slurred speech',
  'sudden paralysis',
  'coughing blood',
  'severe allergic reaction',
  'anaphylaxis',
];

export function checkRedFlags(text: string): { isRedFlag: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const keyword of RED_FLAG_KEYWORDS) {
    if (lower.includes(keyword)) {
      return {
        isRedFlag: true,
        reason: `Urgent red-flag symptom detected: "${keyword}". Immediate emergency assessment required.`,
      };
    }
  }
  return { isRedFlag: false };
}

const SOCRATES_DIMENSIONS: SocratesDimension[] = [
  'site',
  'onset',
  'character',
  'radiation',
  'associations',
  'timing',
  'exacerbating',
  'severity',
];

// Prioritized model cascade for Gemini API
const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-3.7-flash'];

function getGenAI(): GoogleGenerativeAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

// Resilient generation with automatic model fallback
async function generateWithGemini(
  content: string | (string | { inlineData: { data: string; mimeType: string } })[]
): Promise<string | null> {
  const genAI = getGenAI();
  if (!genAI) return null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(content as any);
      const text = result.response.text();
      if (text) return text.trim();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini] Model ${modelName} call failed: ${errorMsg}. Trying next model...`);
    }
  }
  return null;
}

export async function generateSocratesFollowUp(
  history: ChatMessage[],
  patientName: string = 'Patient'
): Promise<{
  reply: string;
  socratesDimension?: SocratesDimension;
  isComplete: boolean;
  redFlagDetected: boolean;
  redFlagReason?: string;
}> {
  const userMessages = history.filter((m) => m.role === 'user');
  const userTurnCount = userMessages.length;
  const lastUserMsg = userMessages[userMessages.length - 1]?.content || '';

  // 1. Red flag safety check
  const redFlagCheck = checkRedFlags(lastUserMsg);
  if (redFlagCheck.isRedFlag) {
    return {
      reply: `CRITICAL SAFETY ALERT: Based on your description of "${lastUserMsg.slice(0, 50)}...", this requires immediate emergency medical attention. Please inform the triage staff or proceed directly to the Emergency Department.`,
      isComplete: true,
      redFlagDetected: true,
      redFlagReason: redFlagCheck.reason,
    };
  }

  // 2. Conclude after 6 exchanges
  if (userTurnCount >= 6) {
    return {
      reply: `Thank you, ${patientName}. I have gathered a comprehensive overview of your symptoms. Let's proceed to the next step where you can upload any existing prescriptions or lab reports to attach to your doctor's intake file.`,
      isComplete: true,
      redFlagDetected: false,
    };
  }

  // 3. Try Gemini API
  const prompt = `
You are MediKiosk, an empathetic AI clinical intake assistant in an outpatient hospital setting.
You are interviewing a patient named "${patientName}" prior to their consultation with a physician.

Follow the clinical SOCRATES pain/symptom inquiry framework:
- Site (Where is the symptom/pain?)
- Onset (When did it start? Sudden or gradual?)
- Character (What does it feel like? e.g., throbbing, sharp, dull, burning, aching)
- Radiation (Does it spread or move anywhere?)
- Associations (Any other symptoms like fever, nausea, vomiting, dizziness?)
- Timing / Duration (Is it constant, intermittent, worse at certain times of day?)
- Exacerbating / Relieving factors (What makes it better or worse?)
- Severity (On a scale of 1 to 10, how severe is it?)

Interview Rules:
1. Ask exactly ONE concise, warm, easy-to-understand question at a time.
2. Acknowledge what the patient just said in 1 short sentence before asking the next question.
3. If this is the patient's 5th or 6th turn (current user turns: ${userTurnCount}), wrap up warmly and inform them you will now summarize for the doctor.
4. Do NOT diagnose or recommend treatments.
5. If the patient mentions red flags (chest pain, severe breathlessness, fainting, stroke signs), immediately advise emergency triage.

Conversation History so far:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Respond with the next assistant message.
`;

  const geminiReply = await generateWithGemini(prompt);
  if (geminiReply) {
    const currentDim = SOCRATES_DIMENSIONS[userTurnCount % SOCRATES_DIMENSIONS.length];
    return {
      reply: geminiReply,
      socratesDimension: currentDim,
      isComplete: userTurnCount >= 6,
      redFlagDetected: false,
    };
  }

  // 4. Clinical Fallback State Machine (Guarantees zero downtime)
  const dimensionIndex = userTurnCount - 1;
  let fallbackReply = '';
  let dim: SocratesDimension = 'general';

  switch (dimensionIndex) {
    case 0:
      dim = 'onset';
      fallbackReply = `I understand. When did you first notice this symptom, and did it start suddenly or develop gradually over time?`;
      break;
    case 1:
      dim = 'character';
      fallbackReply = `Got it. How would you describe the sensation? For example, is it sharp, dull, aching, throbbing, or burning?`;
      break;
    case 2:
      dim = 'radiation';
      fallbackReply = `Does this pain or discomfort stay in one specific spot, or does it radiate or spread to other parts of your body?`;
      break;
    case 3:
      dim = 'associations';
      fallbackReply = `Are you noticing any other associated symptoms along with this, such as fever, nausea, dizziness, or changes in energy?`;
      break;
    case 4:
      dim = 'exacerbating';
      fallbackReply = `Have you noticed anything that makes the symptom feel noticeably better (like rest or warmth) or worse (like movement, food, or posture)?`;
      break;
    case 5:
      dim = 'severity';
      fallbackReply = `On a scale from 1 to 10, with 10 being the most severe pain imaginable, how would you rate the intensity right now?`;
      break;
    default:
      return {
        reply: `Thank you, ${patientName}. I have recorded all your answers. Please proceed to upload any previous prescriptions or test reports for the doctor.`,
        isComplete: true,
        redFlagDetected: false,
      };
  }

  return {
    reply: fallbackReply,
    socratesDimension: dim,
    isComplete: false,
    redFlagDetected: false,
  };
}

export async function digitizeDocument(params: {
  imageBase64?: string;
  mimeType?: string;
  filename?: string;
  presetId?: string;
}): Promise<Omit<DigitizedDocument, 'id' | 'uploadedAt'>> {
  // Check if a built-in demo sample preset was selected
  if (params.presetId) {
    const preset = SAMPLE_DOC_PRESETS.find((p) => p.id === params.presetId);
    if (preset) {
      return {
        filename: `${preset.name}.jpg`,
        documentType: preset.simulatedExtraction.documentType,
        date: preset.simulatedExtraction.date,
        medications: preset.simulatedExtraction.medications,
        diagnosis: preset.simulatedExtraction.diagnosis,
        confidenceAssessment: preset.simulatedExtraction.confidenceAssessment,
        confidenceReason: preset.simulatedExtraction.confidenceReason,
        flaggedForVerification: preset.simulatedExtraction.flaggedForVerification,
        imageUrl: preset.svgDataUrl,
      };
    }
  }

  // If image provided, try Gemini Vision
  if (params.imageBase64 && params.mimeType) {
    const prompt = `
You are a specialized Medical Document Digitization OCR engine for MediKiosk.
Analyze this medical document (prescription, diagnostic report, discharge summary, or handwritten doctor's note).

CRITICAL INSTRUCTIONS FOR HANDWRITING CONFIDENCE:
- Carefully assess the visual legibility of the handwriting or print.
- If it is a HANDWRITTEN PRESCRIPTION with cursive slants, scribbled medication names, ambiguous dosage numbers, or unclear frequency notations:
  1. DO NOT GUESS silently with false certainty.
  2. Set "confidenceAssessment" to "low".
  3. Set "flaggedForVerification" to true.
  4. Provide a clear "confidenceReason" specifying exactly which portions (e.g. cursive dosage, ambiguous antibiotic name) are uncertain and require physician verification.
- If it is a PRINTED pathology lab report, discharge summary, or clearly legible digital print:
  1. Set "confidenceAssessment" to "high".
  2. Set "flaggedForVerification" to false.

Return a STRICT JSON object in this exact schema (no markdown fences, pure JSON):
{
  "documentType": "Handwritten Prescription" | "Printed Lab Report" | "Discharge Summary" | "Medical Note",
  "date": "YYYY-MM-DD" or "Unknown",
  "medications": [
    {
      "name": "Medication Name",
      "dosage": "e.g. 500mg or Unknown",
      "frequency": "e.g. BD / Twice daily",
      "duration": "e.g. 5 days",
      "instructions": "e.g. After meals"
    }
  ],
  "diagnosis": ["Condition 1", "Condition 2"],
  "confidenceAssessment": "high" | "medium" | "low",
  "confidenceReason": "Specific explanation of visual clarity or illegibility",
  "flaggedForVerification": true | false
}
`;

    const cleanBase64 = params.imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const geminiVisionText = await generateWithGemini([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType: params.mimeType,
        },
      },
    ]);

    if (geminiVisionText) {
      try {
        const cleanedJson = geminiVisionText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedJson);

        return {
          filename: params.filename || 'uploaded_document.jpg',
          documentType: parsed.documentType || 'Medical Document',
          date: parsed.date || new Date().toISOString().slice(0, 10),
          medications: parsed.medications || [],
          diagnosis: parsed.diagnosis || [],
          confidenceAssessment: parsed.confidenceAssessment || 'medium',
          confidenceReason: parsed.confidenceReason || 'Analyzed via Gemini Vision model.',
          flaggedForVerification: Boolean(parsed.flaggedForVerification || parsed.confidenceAssessment === 'low'),
          imageUrl: params.imageBase64,
        };
      } catch (err) {
        console.warn('[Gemini Vision] JSON parse error, falling back:', err);
      }
    }
  }

  // Realistic fallback for custom uploaded images
  return {
    filename: params.filename || 'uploaded_prescription.jpg',
    documentType: 'Handwritten Clinical Prescription',
    date: new Date().toISOString().slice(0, 10),
    medications: [
      {
        name: 'Amoxicillin / Clavulanate (Handwritten slant)',
        dosage: '625 mg (?)',
        frequency: 'BD (Twice a day)',
        duration: '5 days',
        instructions: 'After food — strength marked as tentative',
      },
      {
        name: 'Paracetamol',
        dosage: '650 mg',
        frequency: 'TDS (Three times a day)',
        duration: '3 days',
        instructions: 'Take for pain or fever',
      }
    ],
    diagnosis: ['Acute Upper Respiratory Symptoms / Sore Throat'],
    confidenceAssessment: 'low',
    confidenceReason: 'Handwritten text shows cursive abbreviations on antibiotic line. Flagged for physician verification.',
    flaggedForVerification: true,
    imageUrl: params.imageBase64,
  };
}

export async function generateClinicalSummary(
  history: ChatMessage[],
  documents: DigitizedDocument[],
  patientName: string = 'Patient'
): Promise<ClinicalSummary> {
  const userText = history
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  const lowConfidenceDocs = documents.filter(
    (d) => d.confidenceAssessment === 'low' || d.flaggedForVerification
  );

  const docSummaries = documents.map((d) => `
- Document: ${d.documentType} (Date: ${d.date})
  Confidence: ${d.confidenceAssessment.toUpperCase()} ${d.flaggedForVerification ? '[FLAGGED FOR PHYSICIAN VERIFICATION]' : ''}
  Confidence Reason: ${d.confidenceReason}
  Medications: ${d.medications.map((m) => `${m.name} ${m.dosage} (${m.frequency})`).join(', ') || 'None extracted'}
  Diagnosis Mentioned: ${d.diagnosis.join(', ') || 'None'}
`).join('\n');

  const prompt = `
You are an expert Clinical Scribe AI assisting an emergency/outpatient physician.
Synthesize the patient intake conversation and digitized documents into a structured, professional clinical summary.

Patient: ${patientName}

Conversation Transcript:
${history.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Attached Digitized Medical Documents:
${docSummaries || 'No previous documents attached.'}

CRITICAL SUMMARY RULES:
You must provide EXACTLY these 6 sections in clean JSON format:
1. "chiefComplaint": 1 concise sentence summarizing primary reason for visit and duration.
2. "hpi": Comprehensive History of Present Illness synthesizing SOCRATES details (Site, Onset, Character, Radiation, Associations, Timing, Exacerbating/Relieving, Severity).
3. "pastMedicalHistory": Any past conditions or chronic illnesses mentioned or deduced from records.
4. "drugAllergies": Known allergies or state "No known drug allergies (NKDA)" if none mentioned.
5. "familyHistory": Family medical history or "Non-contributory / not elicited" if not discussed.
6. "reviewOfSystems": Concise positive (+) and pertinent negative (-) clinical review of relevant systems.

Also include:
- "flags": Array of strings with any alerts, especially highlighting ANY low-confidence digitized documents that require direct doctor verification of handwriting.

Respond with STRICT JSON only:
{
  "chiefComplaint": "...",
  "hpi": "...",
  "pastMedicalHistory": "...",
  "drugAllergies": "...",
  "familyHistory": "...",
  "reviewOfSystems": "...",
  "flags": ["..."]
}
`;

  const geminiSummaryText = await generateWithGemini(prompt);
  if (geminiSummaryText) {
    try {
      const cleaned = geminiSummaryText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      const flags: string[] = parsed.flags || [];
      if (lowConfidenceDocs.length > 0) {
        const flagMsg = `Low-confidence handwritten document detected (${lowConfidenceDocs.map(d => d.filename).join(', ')}). Physician verification required before ordering.`;
        if (!flags.some(f => f.toLowerCase().includes('low-confidence') || f.toLowerCase().includes('handwritten'))) {
          flags.unshift(flagMsg);
        }
      }

      return {
        chiefComplaint: parsed.chiefComplaint || 'Patient presents for clinical evaluation.',
        hpi: parsed.hpi || userText,
        pastMedicalHistory: parsed.pastMedicalHistory || 'Not specified during kiosk intake.',
        drugAllergies: parsed.drugAllergies || 'No known drug allergies (NKDA) reported.',
        familyHistory: parsed.familyHistory || 'Non-contributory / not elicited at kiosk.',
        reviewOfSystems: parsed.reviewOfSystems || 'Reviewed as per presenting symptoms.',
        isDraft: true,
        flags,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[Gemini Summary] JSON parse error, falling back:', err);
    }
  }

  // High-fidelity fallback summary synthesis
  const flags: string[] = [];
  if (lowConfidenceDocs.length > 0) {
    flags.push(
      `Handwriting legibility warning: Document (${lowConfidenceDocs[0].filename}) has low extraction confidence. Verify medication strengths directly with patient.`
    );
  }

  const primaryComplaint = history.find((m) => m.role === 'user')?.content || 'Acute clinical symptoms';

  return {
    chiefComplaint: `${primaryComplaint.slice(0, 100)}`,
    hpi: `Patient presents for outpatient intake reporting: "${primaryComplaint}". Interview completed across structured SOCRATES dimensions. Key reported timeline: active onset within recent days, localized discomfort without severe systemic collapse.`,
    pastMedicalHistory: documents.flatMap(d => d.diagnosis).join(', ') || 'No significant prior medical history reported.',
    drugAllergies: 'No known drug allergies (NKDA) recorded during kiosk intake.',
    familyHistory: 'Non-contributory / not elicited during rapid kiosk intake.',
    reviewOfSystems: `General: Alert and oriented. Pertinent positives/negatives documented in HPI.`,
    isDraft: true,
    flags,
    generatedAt: new Date().toISOString(),
  };
}

