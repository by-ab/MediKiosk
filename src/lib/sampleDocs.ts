export interface SampleDocPreset {
  id: string;
  name: string;
  category: 'handwritten' | 'printed';
  description: string;
  confidenceExpected: 'low' | 'high';
  previewBadge: string;
  svgDataUrl: string;
  simulatedExtraction: {
    documentType: string;
    date: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration?: string;
      instructions?: string;
    }>;
    diagnosis: string[];
    confidenceAssessment: 'low' | 'high';
    confidenceReason: string;
    flaggedForVerification: boolean;
  };
}

// Generate high-resolution SVG visual representations for demo preview
const handwrittenRxSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="%23fdfbf7"><rect width="600" height="750" fill="%23fffef8" stroke="%23d6d3cb" stroke-width="2"/><rect x="20" y="20" width="560" height="80" fill="%23f0fdf4" rx="6"/><text x="40" y="55" font-family="sans-serif" font-size="20" font-weight="bold" fill="%23065f46">CITY CARE CLINIC</text><text x="40" y="80" font-family="sans-serif" font-size="12" fill="%23047857">Dr. S. K. Roy, MD (Internal Med) | Reg: 44921</text><line x1="20" y1="120" x2="580" y2="120" stroke="%23cbd5e1" stroke-width="1.5"/><text x="40" y="145" font-family="sans-serif" font-size="13" fill="%23475569">Pt Name: Ramesh Verma | Age/Sex: 54/M | Date: 20-08-2026</text><text x="40" y="185" font-family="serif" font-size="28" font-style="italic" font-weight="bold" fill="%231e3a8a">Rx</text><path d="M 50 240 Q 150 210, 280 245 T 450 230" fill="none" stroke="%231e293b" stroke-width="3" stroke-linecap="round"/><text x="60" y="275" font-family="cursive, serif" font-size="18" fill="%23334155">1. Tab Pantocid 40 mg — 1 tab OD b/f (5d)</text><path d="M 50 330 Q 200 300, 380 340 T 520 320" fill="none" stroke="%231e293b" stroke-width="2.5" stroke-dasharray="8 4"/><text x="60" y="375" font-family="cursive, serif" font-size="18" fill="%23334155">2. Tab Cipro-500?? (Unclear slant) — BD x ??</text><path d="M 50 430 Q 180 400, 310 440" fill="none" stroke="%23334155" stroke-width="3"/><text x="60" y="475" font-family="cursive, serif" font-size="18" fill="%23334155">3. Paracit... SOS for fever</text><rect x="40" y="560" width="520" height="70" fill="%23fef2f2" stroke="%23fecaca" rx="6"/><text x="60" y="590" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23991b1b">DIAGNOSTIC IMPRESSION:</text><text x="60" y="612" font-family="sans-serif" font-size="12" fill="%237f1d1d">Acute Gastric Spasm / Evaluate RLQ Pain</text><text x="420" y="710" font-family="cursive" font-size="22" fill="%231e3a8a">Dr. SK Roy</text></svg>`;

const printedReportSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750" fill="%23ffffff"><rect width="600" height="750" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><rect x="20" y="20" width="560" height="80" fill="%23f8fafc" rx="6"/><text x="40" y="55" font-family="sans-serif" font-size="20" font-weight="bold" fill="%230f172a">METROPOLIS DIAGNOSTICS</text><text x="40" y="80" font-family="sans-serif" font-size="12" fill="%2364748b">Accredited Clinical Pathology Lab | NABL ISO 15189</text><line x1="20" y1="120" x2="580" y2="120" stroke="%23e2e8f0" stroke-width="1.5"/><text x="40" y="145" font-family="sans-serif" font-size="13" fill="%23334155">Patient: Sunita Sharma | Ref Dr: Self | Date: 01-Sep-2026</text><rect x="30" y="170" width="540" height="30" fill="%230284c7" rx="3"/><text x="45" y="190" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23ffffff">TEST NAME</text><text x="320" y="190" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23ffffff">RESULT</text><text x="440" y="190" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23ffffff">REF INTERVAL</text><text x="45" y="240" font-family="sans-serif" font-size="14" fill="%231e293b">Fasting Plasma Glucose</text><text x="320" y="240" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23dc2626">158 mg/dL</text><text x="440" y="240" font-family="sans-serif" font-size="13" fill="%2364748b">70 - 100 mg/dL</text><line x1="30" y1="260" x2="570" y2="260" stroke="%23f1f5f9"/><text x="45" y="295" font-family="sans-serif" font-size="14" fill="%231e293b">Glycated Hemoglobin (HbA1c)</text><text x="320" y="295" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23dc2626">8.4 %</text><text x="440" y="295" font-family="sans-serif" font-size="13" fill="%2364748b">&lt; 5.7 %</text><line x1="30" y1="315" x2="570" y2="315" stroke="%23f1f5f9"/><text x="45" y="350" font-family="sans-serif" font-size="14" fill="%231e293b">Serum Creatinine</text><text x="320" y="350" font-family="sans-serif" font-size="14" fill="%230f172a">0.9 mg/dL</text><text x="440" y="350" font-family="sans-serif" font-size="13" fill="%2364748b">0.6 - 1.2 mg/dL</text><rect x="30" y="440" width="540" height="90" fill="%23f0fdf4" stroke="%23bbf7d0" rx="6"/><text x="50" y="470" font-family="sans-serif" font-size="13" font-weight="bold" fill="%23166534">LAB INTERPRETATION &amp; CURRENT MEDS:</text><text x="50" y="495" font-family="sans-serif" font-size="12" fill="%2315803d">- Poorly controlled glycemic status (HbA1c &gt; 8%).</text><text x="50" y="515" font-family="sans-serif" font-size="12" fill="%2315803d">- Patient is currently taking Tab Metformin 500mg BD.</text></svg>`;

export const SAMPLE_DOC_PRESETS: SampleDocPreset[] = [
  {
    id: 'sample-rx-handwritten',
    name: 'Handwritten Prescription (Dr. Roy)',
    category: 'handwritten',
    description: 'Cursive handwriting with partially illegible dosage notation.',
    confidenceExpected: 'low',
    previewBadge: 'Low Confidence Demo',
    svgDataUrl: handwrittenRxSvg,
    simulatedExtraction: {
      documentType: 'Handwritten Prescription',
      date: '2026-08-20',
      medications: [
        {
          name: 'Pantocid (Pantoprazole)',
          dosage: '40 mg',
          frequency: 'OD (Once daily)',
          duration: '5 days',
          instructions: 'Before breakfast'
        },
        {
          name: 'Ciprofloxacin (Partially Illegible)',
          dosage: '500 mg (?)',
          frequency: 'BD (Twice daily)',
          duration: 'Unclear duration',
          instructions: 'After meals — dosage strength uncertain'
        },
        {
          name: 'Paracetamol',
          dosage: '650 mg',
          frequency: 'SOS (As needed)',
          instructions: 'For fever'
        }
      ],
      diagnosis: ['Acute Gastric Spasm', 'Suspected RLQ Pain / Appendicular Tenderness'],
      confidenceAssessment: 'low',
      confidenceReason: 'Handwritten prescription contains ambiguous cursive strokes on second antibiotic dosage (Ciprofloxacin strength and duration uncertain). Flagged for physician verification.',
      flaggedForVerification: true,
    }
  },
  {
    id: 'sample-lab-printed',
    name: 'Printed Blood Lab Report (Metropolis)',
    category: 'printed',
    description: 'Crisp digital pathology lab report with clear tabular parameters.',
    confidenceExpected: 'high',
    previewBadge: 'High Confidence Demo',
    svgDataUrl: printedReportSvg,
    simulatedExtraction: {
      documentType: 'Printed Pathology Lab Report',
      date: '2026-09-01',
      medications: [
        {
          name: 'Metformin Hydrochloride',
          dosage: '500 mg',
          frequency: 'BD (Twice daily)',
          duration: 'Ongoing',
          instructions: 'With meals'
        }
      ],
      diagnosis: [
        'Type 2 Diabetes Mellitus — Suboptimal Glycemic Control (HbA1c 8.4%)',
        'Impaired Fasting Glucose (158 mg/dL)'
      ],
      confidenceAssessment: 'high',
      confidenceReason: 'High visual clarity, digital font with unambiguous numerical values and reference ranges.',
      flaggedForVerification: false,
    }
  }
];
