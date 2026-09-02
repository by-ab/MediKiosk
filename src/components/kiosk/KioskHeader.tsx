'use client';

import React from 'react';
import Link from 'next/link';
import { HeartPulse, Stethoscope, ArrowRight, ShieldCheck } from 'lucide-react';

interface KioskHeaderProps {
  token?: string;
  patientName?: string;
  step?: 1 | 2 | 3;
}

export function KioskHeader({ token, patientName, step }: KioskHeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:bg-teal-700 transition-colors">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-slate-900 tracking-tight">MediKiosk</span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded">
                Kiosk
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">AI-Assisted Patient Intake</p>
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

        {/* Patient Token & Doctor Console Switcher */}
        <div className="flex items-center space-x-3">
          {token && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-1 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-teal-600 block leading-tight">Token</span>
                <span className="text-sm font-bold text-teal-950 font-mono leading-tight">{token}</span>
              </div>
            </div>
          )}

          <Link
            href="/doctor"
            target="_blank"
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors shadow-xs"
            title="Open Hospital EMR Doctor Console in a new tab"
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Doctor Console</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
