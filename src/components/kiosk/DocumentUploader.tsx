'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Pill,
  Activity,
  Plus
} from 'lucide-react';
import { DigitizedDocument } from '@/lib/types';

interface DocumentUploaderProps {
  token: string;
  existingDocs?: DigitizedDocument[];
  onComplete: () => void;
}

export function DocumentUploader({ token, existingDocs = [], onComplete }: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<DigitizedDocument[]>(existingDocs);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setPreviewImage(base64Data);

      try {
        const res = await fetch('/api/digitize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            filename: file.name,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Digitization failed');
        }

        setDocuments((prev) => [...prev, data.document]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error uploading document';
        setErrorMessage(msg);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setErrorMessage('Could not read file from device.');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload Prescriptions &amp; Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Optical document processing with handwriting verification
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-mono">
            {documents.length} Uploaded
          </span>
        </div>
      </div>

      {/* Dropzone & Custom Upload */}
      <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-slate-300 hover:border-teal-500 transition-colors text-center relative">
        <input
          type="file"
          id="doc-upload"
          accept="image/*,.pdf"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
              Drag &amp; drop or click to upload a photo/report
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP, or PDF</p>
          </div>
        </div>
      </div>

      {/* Loading Scanning Laser Indicator */}
      {isProcessing && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center animate-in fade-in space-y-3">
          <div className="inline-flex p-3 rounded-full bg-teal-100 text-teal-700 animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h4 className="font-bold text-teal-950 text-sm">Gemini Vision Scanning Document...</h4>
          <p className="text-xs text-teal-700 max-w-md mx-auto">
            Extracting medications, dates, diagnoses, and evaluating handwriting legibility confidence.
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-4 text-xs font-medium flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Uploaded & Extracted Documents List */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <span>Digitized Medical Records</span>
            <span className="text-xs font-normal text-slate-500">({documents.length} item{documents.length > 1 ? 's' : ''})</span>
          </h3>

          <div className="grid gap-4">
            {documents.map((doc) => {
              const isLowConfidence = doc.confidenceAssessment === 'low' || doc.flaggedForVerification;

              return (
                <div
                  key={doc.id}
                  className={`rounded-2xl border p-5 transition-all ${
                    isLowConfidence
                      ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Header row: Doc type, Date & Confidence badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center space-x-2">
                      <FileText className={`w-4 h-4 ${isLowConfidence ? 'text-amber-600' : 'text-teal-600'}`} />
                      <span className="font-bold text-sm text-slate-900">{doc.documentType}</span>
                      <span className="text-xs text-slate-400 font-mono">({doc.filename})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-500 flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.date}</span>
                      </span>

                      {/* CONFIDENCE ASSESSMENT BADGE */}
                      {isLowConfidence ? (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Low confidence — flagged for physician verification</span>
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>High Confidence (Printed)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Low confidence explicit warning banner */}
                  {isLowConfidence && (
                    <div className="mt-3 p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start space-x-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Physician Verification Flag: </span>
                        <span>{doc.confidenceReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Extracted Details Grid */}
                  <div className="mt-4 grid md:grid-cols-2 gap-4 text-xs">
                    {/* Medications */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center space-x-1.5 mb-2">
                        <Pill className="w-3.5 h-3.5 text-teal-600" />
                        <span>Extracted Medications</span>
                      </span>
                      {doc.medications && doc.medications.length > 0 ? (
                        <ul className="space-y-1.5">
                          {doc.medications.map((m, idx) => (
                            <li key={idx} className="text-slate-800 flex items-start justify-between border-b border-slate-200/60 pb-1 last:border-0">
                              <span className="font-medium text-slate-900">{m.name}</span>
                              <span className="text-slate-600 font-mono text-[11px]">{m.dosage} • {m.frequency}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-400 italic">No specific medications identified.</p>
                      )}
                    </div>

                    {/* Diagnoses */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 flex items-center space-x-1.5 mb-2">
                        <Activity className="w-3.5 h-3.5 text-teal-600" />
                        <span>Diagnostic Mentions</span>
                      </span>
                      {doc.diagnosis && doc.diagnosis.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {doc.diagnosis.map((d, idx) => (
                            <span
                              key={idx}
                              className="bg-white border border-slate-200 text-slate-800 px-2 py-0.5 rounded text-[11px] font-medium"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No previous diagnosis noted.</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500">
          {documents.length === 0
            ? 'You can proceed directly if you do not have documents to attach.'
            : `${documents.length} document(s) attached to your intake file.`}
        </p>

        <button
          type="button"
          onClick={onComplete}
          className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2"
        >
          <span>Generate Clinical Summary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

