'use client';

import React from 'react';
import Link from 'next/link';
import { HeartPulse, ShieldCheck } from 'lucide-react';

interface KioskHeaderProps {
  token?: string;
  patientName?: string;
  step?: 1 | 2 | 3;
}

export function KioskHeader({ token, patientName, step }: KioskHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base text-slate-900 tracking-tight">MediKiosk</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Clinical Intake &amp; Triage</p>
          </div>
        </Link>

        {/* Step Indicator (when in intake flow) */}
        {step && (
          <div className="hidden md:flex items-center space-x-3 text-xs font-medium text-slate-600">
            <div className={`flex items-center space-x-1.5 ${step >= 1 ? 'text-teal-700 font-semibold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
              <span>Symptom Chat</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center space-x-1.5 ${step >= 2 ? 'text-teal-700 font-semibold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
              <span>Documents</span>
            </div>
            <span className="text-slate-300">→</span>
            <div className={`flex items-center space-x-1.5 ${step >= 3 ? 'text-teal-700 font-semibold' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
              <span>Summary</span>
            </div>
          </div>
        )}

        {/* Patient Token Badge */}
        {token && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-500 block leading-tight">Token</span>
              <span className="text-xs font-bold text-slate-900 font-mono leading-tight">{token}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

