'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'abha' | 'register'>('abha');

  // ABHA Form State
  const [abhaName, setAbhaName] = useState('');
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload =
        activeTab === 'abha'
          ? {
              authMethod: 'abha',
              name: abhaName.trim(),
              abhaId: abhaId.trim(),
              otp: otp.trim() || '123456',
            }
          : {
              authMethod: 'phone_register',
              name: name.trim(),
              phone: phone.trim(),
              age: age.trim(),
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

      setGeneratedToken({
        token: data.token,
        tokenNumber: data.tokenNumber,
        name: data.patientInfo.name,
      });

      setTimeout(() => {
        router.push(`/intake/${data.token}`);
      }, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Check-in failed';
      setError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">MediKiosk</span>
              <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-bold px-2 py-0.5 rounded uppercase">
                Patient Kiosk
              </span>
            </div>
            <p className="text-xs text-slate-500">Autonomous Clinical Triage &amp; Intake</p>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="max-w-xl w-full mx-auto my-6">
        {generatedToken ? (
          /* Token Generated Card */
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center space-y-6">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto border border-teal-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
                Check-in Confirmed
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Welcome, {generatedToken.name}</h2>
              <p className="text-xs text-slate-500 mt-1">Your intake session has been created.</p>
            </div>

            <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block">
                Your Queue Token
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold font-mono my-2 block text-white">
                #{generatedToken.tokenNumber}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded inline-block">
                Reference ID: {generatedToken.token}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Opening symptom intake assistant...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header / Banner */}
            <div className="bg-slate-900 text-white p-6 sm:p-7 border-b border-slate-800">
              <div className="inline-flex items-center space-x-1.5 bg-teal-950/80 border border-teal-700/50 px-2.5 py-0.5 rounded text-teal-300 text-xs font-medium mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Patient Check-In</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Welcome to MediKiosk</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Please enter your details to generate your queue token and begin symptom intake.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('abha');
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'abha'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
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
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'register'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserPlus className="w-4 h-4 text-teal-600" />
                <span>Walk-In Registration</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-7 space-y-5">
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
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={abhaName}
                        onChange={(e) => setAbhaName(e.target.value)}
                        placeholder="e.g. Ramesh Verma"
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        ABHA ID (14-Digit Number)
                      </label>
                      <input
                        type="text"
                        value={abhaId}
                        onChange={handleAbhaChange}
                        placeholder="14-XXXX-XXXX-XXXX"
                        maxLength={17}
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 transition-colors tracking-wide"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        OTP Verification Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        maxLength={6}
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 tracking-wider transition-colors"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Aarav Patel"
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Age
                        </label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="e.g. 34"
                          className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Gender
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition-colors"
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 text-sm mt-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
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
      <footer className="max-w-xl w-full mx-auto text-center text-xs text-slate-400 py-3">
        MediKiosk • Intelligent Patient Intake &amp; Clinical Triage
      </footer>
    </div>
  );
}
