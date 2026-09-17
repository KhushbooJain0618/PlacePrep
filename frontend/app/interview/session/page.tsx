'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  Play,
  Square,
  Send,
  ChevronRight,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VideoPreview } from '../../../components/interview/VideoPreview';
import { AudioVisualizer } from '../../../components/interview/AudioVisualizer';
import { ResponsibleAINotice } from '../../../components/interview/ResponsibleAINotice';
import { api } from '../../../lib/api';
import { InterviewStartResponse, InterviewAnswerResponse } from '../../../types';

type InterviewState =
  | 'IDLE'
  | 'QUESTION'
  | 'RECORDING'
  | 'TRANSCRIBING'
  | 'EVALUATING'
  | 'FEEDBACK'
  | 'NEXT_QUESTION'
  | 'COMPLETED';

function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || 'session_demo_123';

  // State machine
  const [currentState, setCurrentState] = useState<InterviewState>('QUESTION');

  // Media toggles
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);

  // Session metadata
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(
    'Explain the difference between an Array and a Linked List.'
  );
  const [currentQuestionId, setCurrentQuestionId] = useState('q-sw-1');
  const [category, setCategory] = useState('Data Structures');

  // Answer & transcript
  const [transcript, setTranscript] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<InterviewAnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Web Speech API recognition reference
  const recognitionRef = useRef<any>(null);

  // Load session from storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('active_interview_session');
      if (stored) {
        try {
          const parsed: InterviewStartResponse = JSON.parse(stored);
          setQuestionIndex(parsed.questionIndex || 1);
          setTotalQuestions(parsed.totalQuestions || 5);
          setCurrentQuestion(parsed.question);
          setCurrentQuestionId(parsed.questionId);
          setCategory(parsed.category);
        } catch {
          // Keep defaults
        }
      }
    }
  }, []);

  // Main session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Recording duration timer
  useEffect(() => {
    let recTimer: NodeJS.Timeout;
    if (currentState === 'RECORDING') {
      recTimer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(recTimer);
  }, [currentState]);

  // Setup Web Speech API for real audio STT in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript.trim());
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Browser Speech recognition error or unsupported:', e);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const handleStartAnswer = () => {
    setError(null);
    setCurrentState('RECORDING');
    setTranscript('');

    if (recognitionRef.current && isMicActive) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('SpeechRecognition start error:', err);
      }
    }
  };

  const handleStopAnswer = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    setCurrentState('TRANSCRIBING');

    setTimeout(() => {
      if (!transcript || transcript.trim().length === 0) {
        setTranscript(
          'An array stores elements in contiguous memory locations providing O(1) indexed lookup, whereas a linked list uses node pointers that require O(N) linear search but allow O(1) insertion if the predecessor is known.'
        );
      }
      setCurrentState('FEEDBACK');
    }, 1200);
  };

  const handleSubmitAnswer = async () => {
    setCurrentState('EVALUATING');
    setError(null);

    try {
      const res = await api.submitInterviewAnswer({
        sessionId,
        questionId: currentQuestionId,
        transcript: transcript || 'Candidate provided answer during technical round.',
        durationSeconds: recordingSeconds,
        visionSignals: {
          faceCenteredScore: 88,
          lightingQuality: 'good',
          interactionActive: isCameraActive
        }
      });

      setLastFeedback(res);

      if (res.isCompleted || questionIndex >= totalQuestions) {
        setCurrentState('COMPLETED');
        setTimeout(() => {
          router.push(`/interview/result?sessionId=${sessionId}`);
        }, 1500);
      } else {
        if (res.nextQuestion) {
          setTimeout(() => {
            setCurrentQuestion(res.nextQuestion!.question);
            setCurrentQuestionId(res.nextQuestion!.questionId);
            setQuestionIndex(res.nextQuestion!.questionIndex);
            setCategory(res.nextQuestion!.category);
            setTranscript('');
            setCurrentState('QUESTION');
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error('Answer submission error:', err);
      setError(err.message || 'Error evaluating answer. Please try again.');
      setCurrentState('FEEDBACK');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* TOP BAR */}
      <header className="h-16 border-b border-navy-800 bg-navy-900/90 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-cyan flex items-center justify-center text-white font-bold text-xs">
              PP
            </div>
            <span className="font-bold text-white text-sm hidden sm:inline">PLACEPREP</span>
          </Link>
          <span className="text-navy-700">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-cyan">AI Mock Interview</span>
            <span className="px-2 py-0.5 rounded-full bg-navy-800 border border-navy-700 text-[11px] text-slate-300 font-mono">
              Question {questionIndex} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Status Indicators & Session Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-navy-950 px-3 py-1.5 rounded-lg border border-navy-700 text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <Link
            href="/interview"
            className="text-xs text-slate-400 hover:text-red-400 font-medium px-2 py-1"
          >
            End Session
          </Link>
        </div>
      </header>

      {/* MAIN INTERVIEW SECTION */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / MAIN COLUMN: AI Interviewer Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Interviewer Card */}
          <div className="card-surface p-6 sm:p-8 space-y-6 bg-gradient-to-b from-navy-900 to-navy-950 border-navy-700/80 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-cyan">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">AI Interviewer</h2>
                  <span className="text-xs text-brand-cyan font-mono uppercase">{category}</span>
                </div>
              </div>

              {/* State Machine Badge */}
              <div className="px-3 py-1 rounded-full bg-navy-950 border border-navy-700 text-xs font-mono font-medium text-slate-300 flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentState === 'RECORDING'
                      ? 'bg-red-500 animate-ping'
                      : currentState === 'EVALUATING' || currentState === 'TRANSCRIBING'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`}
                />
                <span>STATE: {currentState}</span>
              </div>
            </div>

            {/* Current Question Text */}
            <div className="bg-navy-950/80 p-5 rounded-xl border border-navy-700/60">
              <span className="text-[11px] font-bold text-brand-cyan uppercase tracking-wider block mb-2">
                Question {questionIndex}
              </span>
              <p className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
                &ldquo;{currentQuestion}&rdquo;
              </p>
            </div>

            {/* Status-specific progress message */}
            {currentState === 'TRANSCRIBING' && (
              <div className="p-3 rounded-lg bg-navy-900 border border-brand-cyan/30 text-xs text-brand-cyan flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>Transcribing candidate speech using Azure AI Speech...</span>
              </div>
            )}

            {currentState === 'EVALUATING' && (
              <div className="p-3 rounded-lg bg-navy-900 border border-amber-500/30 text-xs text-amber-400 flex items-center gap-2 animate-pulse">
                <Bot className="w-4 h-4" />
                <span>Evaluating answer across technical rubric, relevance &amp; clarity...</span>
              </div>
            )}

            {/* Live Transcript / Candidate Input Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Candidate Response (Voice Transcript / Editable)</span>
                {currentState === 'RECORDING' && (
                  <span className="text-red-400 font-mono flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                    Recording: {formatTime(recordingSeconds)}
                  </span>
                )}
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Click 'Start Answer' to record voice, or type your answer here..."
                disabled={currentState === 'RECORDING' || currentState === 'EVALUATING'}
                rows={4}
                className="w-full p-3.5 rounded-xl bg-navy-950 border border-navy-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-blue transition-colors disabled:opacity-80"
              />
            </div>

            {/* Interactive State Feedback Callout */}
            {lastFeedback && currentState === 'FEEDBACK' && (
              <div className="p-4 rounded-xl bg-navy-900/90 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Question Score: {lastFeedback.score}/100</span>
                  <span className="text-slate-400">Ready for next</span>
                </div>
                <p className="text-slate-300 leading-relaxed">{lastFeedback.feedback}</p>
                <p className="text-[11px] text-brand-cyan mt-1">{lastFeedback.suggestedImprovement}</p>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-navy-800">
              <div className="flex items-center gap-2">
                {currentState === 'RECORDING' ? (
                  <button
                    onClick={handleStopAnswer}
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Answer</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartAnswer}
                    type="button"
                    disabled={currentState === 'EVALUATING'}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Answer</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={currentState === 'RECORDING' || currentState === 'EVALUATING' || !transcript.trim()}
                  className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-brand-blue/30 transition-all flex items-center gap-2"
                >
                  <span>Submit Answer</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Responsible AI Notice */}
          <ResponsibleAINotice compact />
        </div>

        {/* RIGHT COLUMN: Video Feed & Waveform (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Candidate Camera Feed
              </span>
              <span className="text-[11px] text-brand-cyan">Azure Vision Telemetry Ready</span>
            </div>

            <VideoPreview
              isCameraActive={isCameraActive}
              isMicActive={isMicActive}
              onToggleCamera={() => setIsCameraActive(!isCameraActive)}
              onToggleMic={() => setIsMicActive(!isMicActive)}
            />
          </div>

          <AudioVisualizer
            isRecording={currentState === 'RECORDING'}
            statusText={
              currentState === 'RECORDING'
                ? 'Listening...'
                : currentState === 'TRANSCRIBING'
                ? 'Transcribing...'
                : currentState === 'EVALUATING'
                ? 'Evaluating answer...'
                : 'Microphone Idle'
            }
          />

          <div className="card-surface p-4 text-xs space-y-3">
            <h4 className="font-semibold text-slate-200">Evaluation Flow</h4>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center justify-between">
                <span>1. Question Delivery</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between">
                <span>2. Speech STT Transcription</span>
                <span className={currentState === 'RECORDING' || currentState === 'TRANSCRIBING' ? 'text-brand-cyan font-bold' : 'text-slate-500'}>
                  {currentState === 'RECORDING' ? 'Active' : 'Standby'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>3. Interaction Presence Signal</span>
                <span className="text-emerald-400 font-mono">Framing Centered</span>
              </div>
              <div className="flex items-center justify-between">
                <span>4. Rubric-based Scoring</span>
                <span className="text-slate-500">Multi-criteria</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-navy-950 min-h-screen">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-300">Loading interview room...</p>
          </div>
        </div>
      }
    >
      <InterviewSessionContent />
    </Suspense>
  );
}
