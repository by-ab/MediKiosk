'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  AlertTriangle,
  Clock,
  Printer,
  RotateCcw,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { ClinicalSummary, PatientInfo, DigitizedDocument } from '@/lib/types';

interface ClinicalSummaryViewProps {
  token: string;
  tokenNumber: number;
  patientInfo: PatientInfo;
  initialSummary?: ClinicalSummary;
  documents?: DigitizedDocument[];
}

export function ClinicalSummaryView({
  token,
  tokenNumber,
  patientInfo,
  initialSummary,
  documents = [],
}: ClinicalSummaryViewProps) {
  const [summary, setSummary] = useState<ClinicalSummary | null>(initialSummary || null);
  const [isLoading, setIsLoading] = useState(!initialSummary);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!summary) {
      fetchSummary();
    }
  }, [token]);

  const fetchSummary = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize summary');
      }

      setSummary(data.summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating summary';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Patient Queue Token & Status Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-teal-950/80 border border-teal-700/50 px-2.5 py-0.5 rounded text-teal-300 text-xs font-semibold mb-2.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Intake Complete • Queued for Doctor</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {patientInfo.name || 'Patient'}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              {patientInfo.abhaId ? `ABHA: ${patientInfo.abhaId}` : `Phone: ${patientInfo.phone}`} • {patientInfo.gender || 'Not specified'}, {patientInfo.age || '--'} yrs
            </p>

            <div className="mt-3.5 flex items-center space-x-2 text-teal-300 text-xs bg-slate-800/80 w-fit px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Waiting to be called by physician</span>
            </div>
          </div>

          {/* Big Token Badge */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 text-center w-full sm:w-auto min-w-[140px]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Queue Token
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-400 font-mono block my-1">
              #{tokenNumber || token}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {token}
            </span>
          </div>
        </div>
      </div>

      {/* Editable Draft Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-amber-950 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Clinical Intake Summary Draft: </span>
          <span>
            This structured summary has been transmitted directly to your physician's station. The doctor will review, verify, and confirm these details during your consultation.
          </span>
        </div>
      </div>

      {/* Low Confidence Document Warning (Carried Through) */}
      {summary?.flags && summary.flags.length > 0 && (
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-red-900 font-semibold text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Clinical Verification Notices:</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-xs text-red-800">
            {summary.flags.map((flag, idx) => (
              <li key={idx} className="font-medium">{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-teal-50 text-teal-600">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">Synthesizing 6-Part Clinical Summary...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Structuring chief complaint, HPI, past history, and medications for physician review.
          </p>
        </div>
      )}

      {/* Structured 6-Section Clinical Summary Card */}
      {summary && !isLoading && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5 print:border-none print:shadow-none">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">Clinical Intake Summary (Draft)</h2>
                <p className="text-xs text-slate-400">Generated at {new Date(summary.generatedAt).toLocaleTimeString()}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 min-h-[40px] rounded-xl transition-colors print:hidden cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Summary</span>
            </button>
          </div>

          {/* The Exact 6 Required Sections */}
          <div className="grid gap-4">
            {/* 1. Chief Complaint */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                1. Chief Complaint
              </span>
              <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                {summary.chiefComplaint}
              </p>
            </div>

            {/* 2. History of Present Illness (HPI) */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                2. History of Present Illness (HPI)
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {summary.hpi}
              </p>
            </div>

            {/* 3. Past Medical History */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                3. Past Medical History
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {summary.pastMedicalHistory}
              </p>
            </div>

            {/* 4. Drug & Allergy History */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                4. Drug &amp; Allergy History
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {summary.drugAllergies}
              </p>
            </div>

            {/* 5. Family History */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                5. Family History
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {summary.familyHistory}
              </p>
            </div>

            {/* 6. Review of Systems */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                6. Review of Systems (ROS)
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {summary.reviewOfSystems}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="text-xs text-slate-600 text-center sm:text-left">
          Please proceed to the waiting area. Your token <strong className="text-slate-900 font-mono">#{tokenNumber || token}</strong> will be called by the consultation desk.
        </div>

        <Link
          href="/"
          className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-4 py-2.5 min-h-[44px] rounded-xl transition-colors text-center flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>New Check-In</span>
        </Link>
      </div>
    </div>
  );
}

