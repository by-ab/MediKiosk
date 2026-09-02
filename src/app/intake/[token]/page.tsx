'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { KioskHeader } from '@/components/kiosk/KioskHeader';
import { SocratesChat } from '@/components/kiosk/SocratesChat';
import { DocumentUploader } from '@/components/kiosk/DocumentUploader';
import { ClinicalSummaryView } from '@/components/kiosk/ClinicalSummaryView';
import { PatientRecord } from '@/lib/types';
import { MessageSquare, UploadCloud, FileCheck2, Loader2, AlertCircle } from 'lucide-react';

export default function PatientIntakePage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params?.token as string;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/queue/${token}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Patient intake session not found');
        }
        setRecord(data.record);
        if (data.record.summary) {
          setCurrentStep(3);
        } else if (data.record.documents && data.record.documents.length > 0) {
          setCurrentStep(2);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading intake';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading MediKiosk intake session...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 border border-red-200 max-w-md w-full text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Session Not Found</h2>
          <p className="text-xs text-slate-500">
            No active intake session exists for token <code className="font-mono text-slate-700">{token}</code>.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors"
          >
            Start New Check-In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Kiosk Header */}
      <KioskHeader
        token={record.token}
        patientName={record.patientInfo.name}
        step={currentStep}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 flex flex-col justify-center">
        {/* Step Navigation Pill Bar */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs mb-6 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              currentStep === 1
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>1. Symptom Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              currentStep === 2
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>2. Upload Documents</span>
            {record.documents.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${currentStep === 2 ? 'bg-teal-700 text-teal-100' : 'bg-slate-200 text-slate-700'}`}>
                {record.documents.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              currentStep === 3
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>3. Clinical Summary</span>
          </button>
        </div>

        {/* Dynamic Screen View */}
        <div className="flex-1">
          {currentStep === 1 && (
            <div className="h-[600px]">
              <SocratesChat
                token={record.token}
                patientName={record.patientInfo.name}
                initialMessages={record.messages}
                onComplete={() => setCurrentStep(2)}
              />
            </div>
          )}

          {currentStep === 2 && (
            <DocumentUploader
              token={record.token}
              existingDocs={record.documents}
              onComplete={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <ClinicalSummaryView
              token={record.token}
              tokenNumber={record.tokenNumber}
              patientInfo={record.patientInfo}
              initialSummary={record.summary}
              documents={record.documents}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-400 py-4">
        MediKiosk Token #{record.tokenNumber} • Patient: {record.patientInfo.name}
      </footer>
    </div>
  );
}
