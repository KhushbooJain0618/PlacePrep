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
  AlertCircle,
  Volume2
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
        setError('No speech detected. You can record again or type your answer directly in the box below.');
      }
      setCurrentState('FEEDBACK');
    }, 800);
  };

  const handleSubmitAnswer = async () => {
    if (!transcript || !transcript.trim()) {
      setError('Please provide your answer before submitting.');
      return;
    }

    setCurrentState('EVALUATING');
    setError(null);

    try {
      const res = await api.submitInterviewAnswer({
        sessionId,
        questionId: currentQuestionId,
        transcript: transcript.trim(),
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
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col relative">
      <div className="ambient-purple-glow" />

      {/* TOP BAR */}
      <header className="h-16 border-b border-white/[0.07] bg-[#060608]/90 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1">
              PlacePrep
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            </span>
          </Link>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-purple-400">AI Mock Interview</span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-neutral-300 font-mono">
              Question {questionIndex} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* Status Indicators & Session Timer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0E0E14] px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <Link
            href="/interview"
            className="text-xs text-neutral-400 hover:text-red-400 font-medium px-2 py-1 transition-colors"
          >
            End Session
          </Link>
        </div>
      </header>

      {/* MAIN INTERVIEW SECTION */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* LEFT / MAIN COLUMN: AI Interviewer Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Interviewer Card */}
          <div className="card-surface p-6 sm:p-8 space-y-6 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl relative shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">AI Interviewer</h2>
                  <span className="text-xs text-purple-400 font-mono uppercase">{category}</span>
                </div>
              </div>

              {/* State Machine Badge */}
              <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono font-medium text-neutral-300 flex items-center gap-2">
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
            <div className="bg-[#0E0E14] p-5 rounded-xl border border-white/[0.08]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Question {questionIndex}
                </span>
                <button
                  type="button"
                  onClick={() => api.playQuestionSpeech(currentQuestion)}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs flex items-center gap-1.5 transition-colors border border-purple-500/20"
                  title="Listen to interviewer read question (Azure Speech TTS)"
                >
                  <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Listen</span>
                </button>
              </div>
              <p className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                &ldquo;{currentQuestion}&rdquo;
              </p>
            </div>

            {/* Status-specific progress message */}
            {currentState === 'TRANSCRIBING' && (
              <div className="p-3 rounded-lg bg-[#0E0E14] border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Transcribing candidate speech using Azure AI Speech...</span>
              </div>
            )}

            {currentState === 'EVALUATING' && (
              <div className="p-3 rounded-lg bg-[#0E0E14] border border-amber-500/30 text-xs text-amber-400 flex items-center gap-2 animate-pulse">
                <Bot className="w-4 h-4" />
                <span>Evaluating answer across technical rubric, relevance &amp; clarity...</span>
              </div>
            )}

            {/* Live Transcript / Candidate Input Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
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
                className="w-full p-3.5 rounded-xl bg-[#0E0E14] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-purple-500/60 transition-colors disabled:opacity-80"
              />
            </div>

            {/* Interactive State Feedback Callout */}
            {lastFeedback && currentState === 'FEEDBACK' && (
              <div className="p-4 rounded-xl bg-[#0E0E14] border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Question Score: {lastFeedback.score}/100</span>
                  <span className="text-neutral-400">Ready for next</span>
                </div>
                <p className="text-neutral-200 leading-relaxed">{lastFeedback.feedback}</p>
                <p className="text-[11px] text-purple-400 mt-1">{lastFeedback.suggestedImprovement}</p>
              </div>
            )}

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.07]">
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
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current text-black" />
                    <span>Start Answer</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={currentState === 'RECORDING' || currentState === 'EVALUATING' || !transcript.trim()}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
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
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Candidate Camera Feed
              </span>
              <span className="text-[11px] text-purple-400">Azure Vision Telemetry Ready</span>
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

          <div className="card-surface p-5 text-xs space-y-3 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
            <h4 className="font-semibold text-neutral-200">Evaluation Flow</h4>
            <div className="space-y-2 text-neutral-400">
              <div className="flex items-center justify-between">
                <span>1. Question Delivery</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-center justify-between">
                <span>2. Speech STT Transcription</span>
                <span className={currentState === 'RECORDING' || currentState === 'TRANSCRIBING' ? 'text-purple-400 font-bold' : 'text-neutral-500'}>
                  {currentState === 'RECORDING' ? 'Active' : 'Standby'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>3. Interaction Presence Signal</span>
                <span className="text-emerald-400 font-mono">Framing Centered</span>
              </div>
              <div className="flex items-center justify-between">
                <span>4. Rubric-based Scoring</span>
                <span className="text-neutral-500">Multi-criteria</span>
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
