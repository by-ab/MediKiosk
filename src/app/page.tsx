'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  HeartPulse,
  ShieldCheck,
  UserPlus,
  KeyRound,
  ArrowRight,
  Sparkles,
  Stethoscope,
  CheckCircle2,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'abha' | 'register'>('abha');

  // ABHA Form State
  const [abhaId, setAbhaId] = useState('14-8921-4456-1120');
  const [otp, setOtp] = useState('123456');
  const [showOtpField, setShowOtpField] = useState(false);

  // Registration Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Female');

  // Loading & Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<{ token: string; tokenNumber: number; name: string } | null>(null);

  // Format ABHA ID as 14-XXXX-XXXX-XXXX
  const handleAbhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length > 14) raw = raw.slice(0, 14);

    let formatted = '';
    if (raw.length > 0) formatted += raw.slice(0, 2);
    if (raw.length > 2) formatted += '-' + raw.slice(2, 6);
    if (raw.length > 6) formatted += '-' + raw.slice(6, 10);
    if (raw.length > 10) formatted += '-' + raw.slice(10, 14);

    setAbhaId(formatted);
  };

  // Demo presets
  const handlePresetAbha = (demoAbha: string, demoName: string) => {
    setAbhaId(demoAbha);
    setOtp('123456');
    setShowOtpField(true);
  };

  const handlePresetRegister = (demoName: string, demoPhone: string, demoAge: string) => {
    setName(demoName);
    setPhone(demoPhone);
    setAge(demoAge);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload =
        activeTab === 'abha'
          ? {
              authMethod: 'abha',
              abhaId,
              otp,
            }
          : {
              authMethod: 'phone_register',
              name,
              phone,
              age,
              gender,
            };

      const res = await fetch('/api/auth/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Display generated token card before transitioning
      setGeneratedToken({
        token: data.token,
        tokenNumber: data.tokenNumber,
        name: data.patientInfo.name,
      });

      // Auto redirect to intake chat after short delay
      setTimeout(() => {
        router.push(`/intake/${data.token}`);
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/60 via-slate-50 to-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl text-slate-900 tracking-tight">MediKiosk</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md uppercase">
                Patient Portal
              </span>
            </div>
            <p className="text-xs text-slate-500">Autonomous Clinical Triage &amp; Intake</p>
          </div>
        </div>

        <Link
          href="/doctor"
          target="_blank"
          className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
        >
          <Stethoscope className="w-4 h-4 text-teal-400" />
          <span>Doctor EMR Console</span>
        </Link>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-xl w-full mx-auto my-8">
        {generatedToken ? (
          /* Token Generated Celebration Card */
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-teal-200 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700 block mb-1">
                Authentication Successful
              </span>
              <h2 className="text-2xl font-black text-slate-900">Welcome, {generatedToken.name}!</h2>
              <p className="text-xs text-slate-500 mt-1">Your intake session has been created.</p>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
                Assigned Queue Token
              </span>
              <span className="text-4xl sm:text-5xl font-black font-mono my-2 block text-white">
                #{generatedToken.tokenNumber}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded-md inline-block">
                Token Key: {generatedToken.token}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Opening clinical symptom intake assistant...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header / Banner */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white p-6 sm:p-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-teal-200 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Patient Check-In</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Patient Check-In</h1>
              <p className="text-teal-100 text-xs sm:text-sm mt-1">
                Sign in with your ABHA ID or register as a walk-in patient.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('abha');
                  setError(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'abha'
                    ? 'bg-white text-teal-950 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>ABHA ID Sign-In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setError(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'register'
                    ? 'bg-white text-teal-950 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>New Patient Registration</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Authentication Provider Notice */}
              <div className="bg-teal-50/80 border border-teal-200 rounded-2xl p-3.5 flex items-start space-x-3 text-xs text-teal-950">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Authentication Provider: </span>
                  <span className="text-teal-900">
                    Simulated ABHA authentication layer. Use the quick sample profiles below for testing.
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-900 p-3.5 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'abha' ? (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        ABHA ID (14-Digit Format)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={abhaId}
                          onChange={handleAbhaChange}
                          placeholder="14-XXXX-XXXX-XXXX"
                          maxLength={17}
                          required
                          className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-4 py-3 text-sm font-mono text-slate-900 transition-colors tracking-wide"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          OTP Verification Code
                        </label>
                        <span className="text-[11px] text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded">
                          Test OTP: 123456
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          maxLength={6}
                          required
                          className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-4 py-3 text-sm font-mono text-slate-900 tracking-widest transition-colors"
                        />
                      </div>
                    </div>

                    {/* Quick Profiles */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Sample Profiles:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePresetAbha('14-8921-4456-1120', 'Ramesh Verma')}
                          className="text-xs bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 px-3 py-1.5 rounded-lg font-medium border border-slate-200 transition-colors"
                        >
                          👤 Ramesh Verma (14-8921-4456-1120)
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePresetAbha('14-5544-3322-1100', 'Priya Sharma')}
                          className="text-xs bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 px-3 py-1.5 rounded-lg font-medium border border-slate-200 transition-colors"
                        >
                          👤 Priya Sharma (14-5544-3322-1100)
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Patel"
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-4 py-3 text-sm text-slate-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-4 py-3 text-sm text-slate-900 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Age
                        </label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 34"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-4 py-3 text-sm text-slate-900 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-4 py-3 text-sm text-slate-900 transition-colors"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Sample Walk-in Profile */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Sample Walk-in Profile:
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePresetRegister('Amit Roy', '+91 98112 34567', '45')}
                        className="text-xs bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 px-3 py-1.5 rounded-lg font-medium border border-slate-200 transition-colors"
                      >
                        ⚡ Autofill Walk-in: Amit Roy (45 yrs)
                      </button>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating Queue Token...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Queue Token &amp; Start Intake</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-400 py-4">
        MediKiosk • Intelligent Patient Intake &amp; Clinical Triage System
      </footer>
    </div>
  );
}
