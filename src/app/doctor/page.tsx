'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Users,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FileCheck2,
  Clock,
  ShieldCheck,
  Edit3,
  Send,
  Sparkles,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Pill,
  Activity,
  HeartPulse
} from 'lucide-react';
import { QueueItem, PatientRecord, ClinicalSummary } from '@/lib/types';

export default function DoctorConsolePage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(true);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedHpi, setEditedHpi] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchQueue = async (autoSelectFirst = false) => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      if (data.success && data.queue) {
        setQueue(data.queue);
        if (autoSelectFirst && data.queue.length > 0 && !selectedToken) {
          handleCallToken(data.queue[0].token);
        }
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    fetchQueue(true);
    const interval = setInterval(() => fetchQueue(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCallToken = async (token: string) => {
    setSelectedToken(token);
    setIsLoadingRecord(true);
    setIsEditing(false);
    setActionNotice({
      message: `🔔 Calling Token ${token}... Auto-fetching pre-consultation intake summary.`,
      type: 'info',
    });

    try {
      // 1. Update status to in_consultation
      await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, status: 'in_consultation' }),
      });

      // 2. Auto-fetch full patient record
      const res = await fetch(`/api/queue/${token}`);
      const data = await res.json();
      if (data.success && data.record) {
        setSelectedRecord(data.record);
        setEditedHpi(data.record.summary?.hpi || '');
      }

      // Refresh queue status
      fetchQueue(false);
    } catch (err) {
      console.error('Error calling token:', err);
    } finally {
      setIsLoadingRecord(false);
    }
  };

  const handleConfirmAndFile = async () => {
    if (!selectedRecord) return;

    setActionNotice({
      message: `✅ Summary for Token ${selectedRecord.token} (#${selectedRecord.tokenNumber} - ${selectedRecord.patientInfo.name}) confirmed and filed into Hospital EMR!`,
      type: 'success',
    });

    // Mark as completed
    await fetch('/api/queue', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: selectedRecord.token, status: 'completed' }),
    });

    fetchQueue(false);
  };

  const handleSaveEdit = () => {
    if (!selectedRecord || !selectedRecord.summary) return;
    const updatedSummary: ClinicalSummary = {
      ...selectedRecord.summary,
      hpi: editedHpi,
      isDraft: false,
    };
    setSelectedRecord({
      ...selectedRecord,
      summary: updatedSummary,
    });
    setIsEditing(false);
    setActionNotice({
      message: `✏️ Physician edits saved to local intake draft.`,
      type: 'success',
    });
  };

  const filteredQueue = queue.filter(
    (item) =>
      item.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.chiefComplaint && item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* EMR Dark Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-slate-100 tracking-tight">
                  Hospital EMR — Physician Station
                </span>
                <span className="text-[10px] bg-teal-950 text-teal-300 font-mono font-bold px-2 py-0.5 rounded border border-teal-800">
                  TOKEN AUTO-FETCH ENABLED
                </span>
              </div>
              <p className="text-xs text-slate-400">Dr. Ananya Sen, MD | OPD Station #3</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => fetchQueue(false)}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
              <span>Open Patient Kiosk</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Simulated Notification Toast Banner */}
      {actionNotice && (
        <div
          className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : actionNotice.type === 'warning'
              ? 'bg-amber-950/80 border-amber-800 text-amber-200'
              : 'bg-teal-950/80 border-teal-800 text-teal-200'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span>{actionNotice.message}</span>
            <button
              type="button"
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-white text-[11px] font-mono ml-4 underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Dual-Panel EMR Layout */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 grid lg:grid-cols-12 gap-6 flex-1">
        {/* LEFT PANEL: Queue Management (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[780px] overflow-hidden shadow-lg">
          {/* Queue Header & Search */}
          <div className="p-4 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-teal-400" />
                <h2 className="text-sm font-bold text-slate-200">OPD Patient Queue</h2>
              </div>
              <span className="text-[11px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                {queue.length} in line
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token #, patient name..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 focus:outline-hidden rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Queue Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoadingQueue ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-500" />
                Loading hospital queue...
              </div>
            ) : filteredQueue.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No patients in queue.
              </div>
            ) : (
              filteredQueue.map((item) => {
                const isSelected = selectedToken === item.token;
                const isWaiting = item.status === 'waiting';
                const isCompleted = item.status === 'completed';

                return (
                  <div
                    key={item.token}
                    className={`rounded-xl p-3.5 border transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500/80 shadow-md ring-1 ring-teal-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sm text-teal-300">
                            #{item.tokenNumber}
                          </span>
                          <span className="font-bold text-xs text-slate-200">
                            {item.name}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {item.chiefComplaint || 'Pending intake completion'}
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        {item.hasRedFlag && (
                          <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-black uppercase px-1.5 py-0.2 rounded animate-pulse">
                            Red Flag
                          </span>
                        )}
                        {item.hasLowConfidenceDocs && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-bold px-1.5 py-0.2 rounded">
                            Verify Rx
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-slate-800 text-slate-400'
                              : isWaiting
                              ? 'bg-teal-900/60 text-teal-300 border border-teal-700/50'
                              : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Action Call Button */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.token} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCallToken(item.token)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-800 hover:bg-teal-600 hover:text-white text-slate-300'
                        }`}
                      >
                        <Bell className="w-3 h-3" />
                        <span>{isSelected ? 'Viewing' : 'Call'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Patient Intake Auto-Fetch Viewer (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col h-[780px] overflow-hidden shadow-lg">
          {isLoadingRecord ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-500" />
              <p className="text-sm font-semibold">Auto-fetching token intake record from MediKiosk...</p>
            </div>
          ) : !selectedRecord ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-500 p-8 text-center">
              <Stethoscope className="w-12 h-12 text-slate-700" />
              <h3 className="text-base font-bold text-slate-300">No Patient Token Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Click <strong>"Call"</strong> on any token in the left queue to automatically pull and view MediKiosk's synthesized clinical summary.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Patient Banner Bar */}
              <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-2xl font-black text-teal-400">
                      #{selectedRecord.tokenNumber}
                    </span>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {selectedRecord.patientInfo.name}
                    </h2>
                    <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {selectedRecord.token}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {selectedRecord.patientInfo.abhaId ? (
                      <span className="text-teal-300 font-mono">ABHA: {selectedRecord.patientInfo.abhaId}</span>
                    ) : (
                      <span>Walk-In Registration ({selectedRecord.patientInfo.phone})</span>
                    )} • {selectedRecord.patientInfo.gender || 'Not specified'}, {selectedRecord.patientInfo.age || '--'} yrs
                  </p>
                </div>

                {/* EMR Action Toolbar */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-teal-400" />
                    <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAndFile}
                    className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm &amp; File</span>
                  </button>
                </div>
              </div>

              {/* Scrollable Summary & Digitized Attachments */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Red Flag Warning Alert */}
                {selectedRecord.redFlagDetected && (
                  <div className="bg-red-950/60 border border-red-500/60 rounded-2xl p-4 flex items-start space-x-3 text-red-200 text-xs">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
                    <div>
                      <span className="font-bold uppercase text-red-300 tracking-wider">
                        Immediate Triage Alert:{' '}
                      </span>
                      <span>{selectedRecord.redFlagReason || 'Red-flag symptom flagged by patient.'}</span>
                    </div>
                  </div>
                )}

                {/* PROMINENT LOW CONFIDENCE HANDWRITING WARNING */}
                {selectedRecord.documents.some((d) => d.confidenceAssessment === 'low' || d.flaggedForVerification) && (
                  <div className="bg-amber-950/60 border-2 border-amber-500/70 rounded-2xl p-4 space-y-2 text-amber-200 text-xs shadow-md">
                    <div className="flex items-center space-x-2 text-amber-300 font-bold text-sm">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      <span>Physician Action Required: Low Confidence Document Extraction</span>
                    </div>
                    <p className="leading-relaxed text-amber-100/90">
                      MediKiosk's Gemini Vision model identified handwritten doctor notation with ambiguous cursive dosage/script. <strong>Do not dispense or confirm prescriptions without direct patient verification.</strong>
                    </p>
                    {selectedRecord.documents
                      .filter((d) => d.confidenceAssessment === 'low' || d.flaggedForVerification)
                      .map((d) => (
                        <div key={d.id} className="bg-amber-900/40 p-2.5 rounded-lg border border-amber-700/50 text-[11px] font-mono text-amber-200">
                          📌 {d.filename}: {d.confidenceReason}
                        </div>
                      ))}
                  </div>
                )}

                {/* 6-Part Clinical Summary Display */}
                {selectedRecord.summary ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <FileCheck2 className="w-4 h-4 text-teal-400" />
                        <h3 className="text-sm font-bold text-slate-200">
                          Synthesized Clinical Intake (SOCRATES + OCR)
                        </h3>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
                        Editable Draft
                      </span>
                    </div>

                    <div className="grid gap-3.5 text-xs">
                      {/* 1. Chief Complaint */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block mb-1">
                          1. Chief Complaint
                        </span>
                        <p className="text-slate-100 font-medium">{selectedRecord.summary.chiefComplaint}</p>
                      </div>

                      {/* 2. History of Present Illness */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                            2. History of Present Illness (HPI)
                          </span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="text-[11px] text-teal-400 hover:text-teal-300 font-bold underline"
                            >
                              Save HPI Edit
                            </button>
                          )}
                        </div>

                        {isEditing ? (
                          <textarea
                            value={editedHpi}
                            onChange={(e) => setEditedHpi(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-900 border border-teal-500 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-hidden"
                          />
                        ) : (
                          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {selectedRecord.summary.hpi}
                          </p>
                        )}
                      </div>

                      {/* 3. Past Medical History */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block mb-1">
                          3. Past Medical History
                        </span>
                        <p className="text-slate-300">{selectedRecord.summary.pastMedicalHistory}</p>
                      </div>

                      {/* 4. Drug / Allergy History */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block mb-1">
                          4. Drug &amp; Allergy History
                        </span>
                        <p className="text-slate-300">{selectedRecord.summary.drugAllergies}</p>
                      </div>

                      {/* 5. Family History */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block mb-1">
                          5. Family History
                        </span>
                        <p className="text-slate-300">{selectedRecord.summary.familyHistory}</p>
                      </div>

                      {/* 6. Review of Systems */}
                      <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-[10px] font-black uppercase tracking-wider text-teal-400 block mb-1">
                          6. Review of Systems (ROS)
                        </span>
                        <p className="text-slate-300">{selectedRecord.summary.reviewOfSystems}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                    Patient has not generated summary yet. Showing conversation transcript below.
                  </div>
                )}

                {/* Digitized Documents Section */}
                {selectedRecord.documents.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>Attached Digitized Documents ({selectedRecord.documents.length})</span>
                    </h4>

                    <div className="grid gap-3">
                      {selectedRecord.documents.map((doc) => {
                        const isLow = doc.confidenceAssessment === 'low' || doc.flaggedForVerification;

                        return (
                          <div
                            key={doc.id}
                            className={`p-3.5 rounded-xl border text-xs ${
                              isLow
                                ? 'bg-amber-950/30 border-amber-500/40'
                                : 'bg-slate-950/60 border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-200">{doc.documentType} ({doc.date})</span>
                              {isLow ? (
                                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                                  ⚠️ Low Confidence Handwriting
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded">
                                  ✓ High Confidence Printed
                                </span>
                              )}
                            </div>

                            {/* Meds */}
                            {doc.medications.length > 0 && (
                              <div className="space-y-1 mb-2">
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Extracted Meds:</span>
                                {doc.medications.map((m, i) => (
                                  <div key={i} className="text-slate-300 font-mono text-[11px]">
                                    • {m.name} — {m.dosage} ({m.frequency})
                                  </div>
                                ))}
                              </div>
                            )}

                            <p className="text-[10px] text-slate-500 italic">{doc.confidenceReason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
