export type AuthMethod = 'abha' | 'phone_register';

export type IntakeStatus = 'waiting' | 'in_consultation' | 'completed';

export type SocratesDimension =
  | 'site'
  | 'onset'
  | 'character'
  | 'radiation'
  | 'associations'
  | 'timing'
  | 'exacerbating'
  | 'severity'
  | 'general';

export interface ChatMessage {
  id: string;
  role: 'system' | 'assistant' | 'user';
  content: string;
  timestamp: string;
  socratesDimension?: SocratesDimension;
  isRedFlag?: boolean;
}

export interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface DigitizedDocument {
  id: string;
  filename: string;
  documentType: string; // e.g. 'Handwritten Prescription', 'Printed Lab Report', etc.
  date: string;
  medications: ExtractedMedication[];
  diagnosis: string[];
  confidenceAssessment: 'high' | 'medium' | 'low';
  confidenceReason: string;
  flaggedForVerification: boolean;
  uploadedAt: string;
  imageUrl?: string;
}

export interface ClinicalSummary {
  chiefComplaint: string;
  hpi: string; // History of Present Illness
  pastMedicalHistory: string;
  drugAllergies: string;
  familyHistory: string;
  reviewOfSystems: string;
  isDraft: boolean;
  flags: string[];
  generatedAt: string;
}

export interface PatientInfo {
  name: string;
  phone: string;
  abhaId?: string;
  age?: string;
  gender?: string;
  authMethod: AuthMethod;
}

export interface PatientRecord {
  token: string; // e.g. 'TK-23'
  tokenNumber: number; // e.g. 23
  patientInfo: PatientInfo;
  messages: ChatMessage[];
  turnCount: number;
  interviewCompleted: boolean;
  redFlagDetected: boolean;
  redFlagReason?: string;
  documents: DigitizedDocument[];
  summary?: ClinicalSummary;
  status: IntakeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QueueItem {
  token: string;
  tokenNumber: number;
  name: string;
  abhaId?: string;
  phone: string;
  chiefComplaint?: string;
  hasRedFlag: boolean;
  hasLowConfidenceDocs: boolean;
  docCount: number;
  status: IntakeStatus;
  createdAt: string;
}
