'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, CheckCircle2, Bot, User, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

interface SocratesChatProps {
  token: string;
  patientName: string;
  initialMessages?: ChatMessage[];
  onComplete: () => void;
}

export function SocratesChat({ token, patientName, initialMessages = [], onComplete }: SocratesChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redFlag, setRedFlag] = useState<{ isRedFlag: boolean; reason?: string }>({ isRedFlag: false });
  const [isCompleted, setIsCompleted] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, redFlag]);

  // If there are no initial messages, load or initialize
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `Hello ${patientName || 'there'}. I am your MediKiosk clinical intake assistant. To help your doctor prepare for your visit, could you describe what main symptom or health concern brings you in today?`,
          timestamp: new Date().toISOString(),
          socratesDimension: 'general',
        }
      ]);
    }
  }, [patientName, messages.length]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading || isCompleted) return;

    setInput('');
    setIsLoading(true);

    // Optimistically append user message
    const tempUserMsg: ChatMessage = {
      id: `temp-u-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/converse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message: messageText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to communicate with intake assistant');
      }

      if (data.messages) {
        setMessages(data.messages);
      } else if (data.reply) {
        const assistantMsg: ChatMessage = {
          id: `temp-a-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
          socratesDimension: data.socratesDimension,
          isRedFlag: data.redFlagDetected,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }

      if (data.turnCount !== undefined) {
        setTurnCount(data.turnCount);
      }

      if (data.redFlagDetected) {
        setRedFlag({
          isRedFlag: true,
          reason: data.redFlagReason || 'Urgent symptom detected requiring immediate triage evaluation.',
        });
        setIsCompleted(true);
      } else if (data.isComplete) {
        setIsCompleted(true);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error communicating with server';
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `I encountered a temporary connection issue (${errorMsg}). Please type your message again or continue.`,
          timestamp: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Chat Top Banner */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100 flex items-center space-x-1.5">
              <span>Symptom Intake Assessment</span>
              <span className="text-[10px] bg-teal-950 text-teal-300 font-mono px-1.5 py-0.5 rounded border border-teal-800">
                SOCRATES AI
              </span>
            </h2>
            <p className="text-xs text-slate-400">Structured pre-consultation clinical inquiry</p>
          </div>
        </div>

        {/* Turn counter */}
        <div className="text-right">
          <span className="text-xs text-slate-400 block font-mono">
            {isCompleted ? 'Complete' : `Question ${Math.min(turnCount + 1, 6)} of 6`}
          </span>
          <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full transition-all duration-300 ${redFlag.isRedFlag ? 'bg-red-500' : 'bg-teal-500'}`}
              style={{ width: `${Math.min(((turnCount + 1) / 6) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Red Flag Alert Banner */}
      {redFlag.isRedFlag && (
        <div className="bg-red-50 border-b border-red-300 p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  Clinical Alert
                </span>
                <h3 className="font-bold text-red-950 text-sm">Immediate Triage Assessment Required</h3>
              </div>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">
                {redFlag.reason}
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onComplete}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <span>Proceed to Upload Documents &amp; Alert Doctor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          const isAlert = msg.isRedFlag;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-xs ${isAlert ? 'bg-red-600' : 'bg-teal-600'}`}>
                  {isAlert ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-sm leading-relaxed shadow-xs ${
                  isAssistant
                    ? isAlert
                      ? 'bg-red-50 border border-red-200 text-red-950 rounded-tl-xs font-medium'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    : 'bg-teal-600 text-white rounded-tr-xs'
                }`}
              >
                {/* SOCRATES Dimension pill if available */}
                {isAssistant && msg.socratesDimension && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded mb-2">
                    Focus: {msg.socratesDimension}
                  </span>
                )}

                <p className="whitespace-pre-wrap">{msg.content}</p>

                <span
                  className={`text-[10px] block mt-1.5 text-right ${
                    isAssistant ? 'text-slate-400' : 'text-teal-200'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-white shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading typing bubble */}
        {isLoading && (
          <div className="flex items-start gap-2.5 justify-start">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center shrink-0 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span className="text-xs text-slate-500 font-medium">Formulating clinical follow-up...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Completion Banner */}
      {isCompleted && !redFlag.isRedFlag && (
        <div className="bg-teal-50 border-t border-teal-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-teal-900 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>Symptom interview complete. You may now attach any relevant prescriptions or test reports.</span>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-1.5 shrink-0"
          >
            <span>Next: Upload Documents</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Controls */}
      {!isCompleted && (
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Describe your symptoms in your own words..."
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-teal-500 focus:bg-white focus:outline-hidden rounded-xl px-4 py-2.5 text-sm text-slate-900 transition-colors disabled:bg-slate-100"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl transition-colors shrink-0 shadow-xs flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

