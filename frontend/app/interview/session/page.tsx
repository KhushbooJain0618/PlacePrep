'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Clock,
  Mic,
  MicOff,
  Square,
  Send,
  ArrowRight,
  Bot,
  User,
  ShieldCheck,
  ShieldAlert,
  Users,
  Camera,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  SkipForward,
  Trophy,
  Check,
  Lightbulb,
  Code2,
  RotateCcw,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { VideoPreview, ProctoringStatus } from '../../../components/interview/VideoPreview';
import { AudioVisualizer } from '../../../components/interview/AudioVisualizer';
import { ResponsibleAINotice } from '../../../components/interview/ResponsibleAINotice';
import { api } from '../../../lib/api';
import { InterviewStartResponse, InterviewAnswerResponse } from '../../../types';

type InterviewState =
  | 'IDLE'
  | 'VERIFYING'
  | 'QUESTION'
  | 'RECORDING'
  | 'EVALUATING'
  | 'FEEDBACK'
  | 'COMPLETED'
  | 'TERMINATED';

function InterviewSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || 'session_demo_123';

  // State machine (Starts with Candidate Identity & Camera Verification)
  const [currentState, setCurrentState] = useState<InterviewState>('VERIFYING');

  // Media toggles
  const [isMicActive, setIsMicActive] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);

  // Session metadata
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(
    'Explain the difference between an Array and a Linked List, along with their time complexities.'
  );
  const [currentQuestionId, setCurrentQuestionId] = useState('q-sw-1');
  const [category, setCategory] = useState('Data Structures');
  const [hint, setHint] = useState('contiguous memory, pointers, O(1) vs O(n) access');
  const [showHint, setShowHint] = useState(false);

  // Workspace Tabs: Voice/Text response vs Code Scratchpad
  const [activeTab, setActiveTab] = useState<'response' | 'scratchpad'>('response');
  const [codeNotes, setCodeNotes] = useState('');

  // Audio Playback (TTS)
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [autoReadQuestion, setAutoReadQuestion] = useState(true);

  // Timers
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Answer & transcript
  const [transcript, setTranscript] = useState('');
  const transcriptRef = useRef(transcript);
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const [lastFeedback, setLastFeedback] = useState<InterviewAnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Live Proctoring State & Violations
  const [proctoringStatus, setProctoringStatus] = useState<ProctoringStatus>({
    alert: 'NONE',
    facesDetected: 1,
    isCentered: true,
    message: 'Camera Standby'
  });
  const [violationCountdown, setViolationCountdown] = useState<number | null>(null);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  // References for reliable STT
  const recognitionRef = useRef<any>(null);
  const baseTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  // Load session from storage if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('active_interview_session');
      if (stored) {
        try {
          const parsed: InterviewStartResponse = JSON.parse(stored);
          setQuestionIndex(parsed.questionIndex || 1);
          setTotalQuestions(parsed.totalQuestions || 5);
          if (parsed.question) setCurrentQuestion(parsed.question);
          if (parsed.questionId) setCurrentQuestionId(parsed.questionId);
          if (parsed.category) setCategory(parsed.category);
          if (parsed.hint) setHint(parsed.hint);
        } catch {
          // Keep defaults
        }
      }
    }
  }, []);

  // Update session storage whenever question state changes to persist through browser refresh
  const persistSessionProgress = (newIdx: number, newQId: string, newQ: string, newCat: string, newHint?: string) => {
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('active_interview_session');
        const existing = stored ? JSON.parse(stored) : {};
        sessionStorage.setItem('active_interview_session', JSON.stringify({
          ...existing,
          sessionId,
          questionIndex: newIdx,
          totalQuestions,
          questionId: newQId,
          question: newQ,
          category: newCat,
          hint: newHint || hint
        }));
      } catch {}
    }
  };

  // Main session elapsed timer (runs only during active interview)
  useEffect(() => {
    if (currentState === 'VERIFYING' || currentState === 'COMPLETED' || currentState === 'TERMINATED') return;
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [currentState]);

  // Per-question timer (resets whenever questionIndex changes)
  useEffect(() => {
    setQuestionSeconds(0);
  }, [questionIndex]);

  useEffect(() => {
    if (currentState === 'COMPLETED' || currentState === 'TERMINATED' || currentState === 'VERIFYING') return;
    const qTimer = setInterval(() => {
      setQuestionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(qTimer);
  }, [currentState]);

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

  // Auto-read question aloud when question loads or transitions
  useEffect(() => {
    if (!currentQuestion || currentState !== 'QUESTION') return;
    if (autoReadQuestion) {
      const timer = setTimeout(() => {
        setIsPlayingTTS(true);
        api.playQuestionSpeech(currentQuestion, () => {
          setIsPlayingTTS(false);
        }).catch(() => {
          setIsPlayingTTS(false);
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        api.stopQuestionSpeech();
        setIsPlayingTTS(false);
      };
    }
  }, [currentQuestion, autoReadQuestion, currentState]);

  // Clean up media and speech recognition on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      api.stopQuestionSpeech();
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Auto-terminate handler for proctoring violations
  const handleTerminateInterview = async (reason: string) => {
    setTerminationReason(reason);
    setCurrentState('TERMINATED');
    setViolationCountdown(null);

    api.stopQuestionSpeech();
    setIsPlayingTTS(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      await api.finishInterview(sessionId);
    } catch (err) {
      console.warn('Finish interview call notice:', err);
    }
  };

  // Live Proctoring Violation Monitor (Auto-terminate after 10s grace period)
  useEffect(() => {
    if (currentState !== 'QUESTION' && currentState !== 'RECORDING') {
      setViolationCountdown(null);
      return;
    }

    const isViolation =
      proctoringStatus.alert === 'OUT_OF_FRAME' ||
      proctoringStatus.alert === 'MULTIPLE_PERSONS' ||
      !isCameraActive;

    if (!isViolation) {
      setViolationCountdown(null);
      return;
    }

    // Start 10s grace countdown if not already counting
    if (violationCountdown === null) {
      setViolationCountdown(10);
      return;
    }

    if (violationCountdown <= 0) {
      const reason =
        proctoringStatus.alert === 'OUT_OF_FRAME'
          ? 'Candidate remained out of camera frame for over 10 seconds.'
          : proctoringStatus.alert === 'MULTIPLE_PERSONS'
          ? `Multiple persons (${proctoringStatus.facesDetected}) were detected in the camera frame.`
          : 'Camera feed was disconnected during the interview.';
      handleTerminateInterview(reason);
      return;
    }

    const timer = setTimeout(() => {
      setViolationCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [proctoringStatus.alert, proctoringStatus.facesDetected, isCameraActive, violationCountdown, currentState]);
  const handleToggleQuestionAudio = async () => {
    if (isPlayingTTS) {
      api.stopQuestionSpeech();
      setIsPlayingTTS(false);
      return;
    }

    setIsPlayingTTS(true);
    try {
      await api.playQuestionSpeech(currentQuestion, () => {
        setIsPlayingTTS(false);
      });
    } catch (e) {
      console.warn('TTS playback notice:', e);
      setIsPlayingTTS(false);
    }
  };

  const handleToggleMic = () => {
    const nextState = !isMicActive;
    setIsMicActive(nextState);
    if (!nextState && currentState === 'RECORDING') {
      handleStopAnswer();
    }
  };

  // Fresh recognition factory for continuous live speech-to-text
  const createAndStartRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setSpeechSupported(false);
      setError('Live speech recognition is not supported in this browser. Please use Google Chrome or type your answer directly.');
      isRecordingRef.current = false;
      setCurrentState('QUESTION');
      return;
    }

    // Clean up any lingering instance before starting fresh
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let sessionSpeech = '';
      for (let i = 0; i < event.results.length; i++) {
        sessionSpeech += event.results[i][0].transcript + ' ';
      }
      sessionSpeech = sessionSpeech.trim();
      if (sessionSpeech) {
        const base = baseTranscriptRef.current;
        const full = base ? `${base} ${sessionSpeech}` : sessionSpeech;
        setTranscript(full);
      }
    };

    recognition.onerror = (e: any) => {
      console.warn('Speech recognition notice:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone permission was denied. Please allow microphone access in your browser address bar.');
        isRecordingRef.current = false;
        setCurrentState('QUESTION');
      } else if (e.error === 'audio-capture') {
        setError('Microphone hardware is unavailable or in use by another application.');
        isRecordingRef.current = false;
        setCurrentState('QUESTION');
      }
    };

    recognition.onend = () => {
      // If user is still recording, preserve current transcript into base and restart
      if (isRecordingRef.current && isMicActive) {
        baseTranscriptRef.current = transcriptRef.current.trim();
        try {
          recognition.start();
        } catch {
          setTimeout(() => {
            if (isRecordingRef.current) {
              createAndStartRecognition();
            }
          }, 100);
        }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.warn('SpeechRecognition start error:', err);
      setError('Could not start microphone recording. Please try again or type directly.');
      isRecordingRef.current = false;
      setCurrentState('QUESTION');
    }
  };

  // Start Voice Recording
  const handleStartAnswer = () => {
    if (!isMicActive) {
      setError('Your microphone is currently muted. Click the microphone icon to unmute before speaking.');
      return;
    }

    // Stop question speech immediately if active so it doesn't bleed into mic
    api.stopQuestionSpeech();
    setIsPlayingTTS(false);

    setError(null);
    baseTranscriptRef.current = transcript.trim();
    isRecordingRef.current = true;
    setCurrentState('RECORDING');

    createAndStartRecognition();
  };

  // Stop Voice Recording
  const handleStopAnswer = () => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    baseTranscriptRef.current = transcriptRef.current.trim();
    setCurrentState('QUESTION');
  };

  // Reset answer
  const handleClearAnswer = () => {
    if (confirm('Clear your current spoken and typed answer to start fresh?')) {
      setTranscript('');
      setCodeNotes('');
      baseTranscriptRef.current = '';
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    const trimmedTranscript = transcript.trim();
    const trimmedCode = codeNotes.trim();

    if (!trimmedTranscript && !trimmedCode) {
      setError('Please provide your spoken or typed response before submitting.');
      return;
    }

    // Stop recording if active
    if (isRecordingRef.current && recognitionRef.current) {
      isRecordingRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    // Combine verbal explanation with code notes if provided
    const combinedAnswer = trimmedCode
      ? `${trimmedTranscript || 'Code implementation provided.'}\n\n[Candidate Code / Notes]:\n${trimmedCode}`
      : trimmedTranscript;

    setCurrentState('EVALUATING');
    setError(null);

    try {
      const res = await api.submitInterviewAnswer({
        sessionId,
        questionId: currentQuestionId,
        transcript: combinedAnswer,
        durationSeconds: recordingSeconds || questionSeconds,
        visionSignals: {
          faceCenteredScore: 88,
          lightingQuality: 'good',
          interactionActive: isCameraActive
        }
      });

      setLastFeedback(res);
      setCurrentState('FEEDBACK');
    } catch (err: any) {
      console.error('Answer submission error:', err);
      setError(err.message || 'Error evaluating answer. Please try again.');
      setCurrentState('QUESTION');
    }
  };

  // Proceed to next question or view report
  const handleProceedNextQuestion = () => {
    if (!lastFeedback) return;

    if (lastFeedback.isCompleted || questionIndex >= totalQuestions || !lastFeedback.nextQuestion) {
      setCurrentState('COMPLETED');
      router.push(`/interview/result?sessionId=${sessionId}`);
    } else {
      const nq = lastFeedback.nextQuestion;
      setCurrentQuestion(nq.question);
      setCurrentQuestionId(nq.questionId);
      setQuestionIndex(nq.questionIndex);
      setCategory(nq.category);
      setHint(nq.hint || 'Key concepts and trade-offs related to ' + nq.category);
      setShowHint(false);
      setTranscript('');
      setCodeNotes('');
      baseTranscriptRef.current = '';
      setLastFeedback(null);
      setError(null);
      setCurrentState('QUESTION');

      persistSessionProgress(nq.questionIndex, nq.questionId, nq.question, nq.category, nq.hint);
    }
  };

  // Skip question
  const handleSkipQuestion = async () => {
    if (confirm('Are you sure you want to skip this question? It will be marked as unanswered.')) {
      setCurrentState('EVALUATING');
      try {
        const res = await api.submitInterviewAnswer({
          sessionId,
          questionId: currentQuestionId,
          transcript: 'Candidate chose to skip this question.',
          durationSeconds: questionSeconds,
          visionSignals: {
            faceCenteredScore: 88,
            lightingQuality: 'good',
            interactionActive: isCameraActive
          }
        });
        setLastFeedback(res);
        setCurrentState('FEEDBACK');
      } catch (err: any) {
        setError(err.message || 'Error skipping question.');
        setCurrentState('QUESTION');
      }
    }
  };

  // End interview early with confirmation
  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end this interview round now? Your completed answers will be evaluated.')) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      router.push(`/interview/result?sessionId=${sessionId}`);
    }
  };

  const progressPercent = Math.min(100, Math.round((questionIndex / totalQuestions) * 100));

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col relative font-sans">
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
              Q{questionIndex} of {totalQuestions}
            </span>
          </div>
        </div>

        {/* Question Stepper Dots */}
        <div className="hidden md:flex items-center gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < questionIndex;
            const isCurrent = stepNum === questionIndex;
            return (
              <div
                key={i}
                title={`Question ${stepNum}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCurrent
                    ? 'w-7 bg-purple-500 shadow-sm shadow-purple-500/50'
                    : isCompleted
                    ? 'w-4 bg-emerald-500/80'
                    : 'w-2 bg-white/15'
                }`}
              />
            );
          })}
        </div>

        {/* Timers & End Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 bg-[#0E0E14] px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-neutral-300">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span title="Total session elapsed time">{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={handleEndInterview}
            className="text-xs text-neutral-400 hover:text-red-400 font-medium px-2.5 py-1.5 transition-colors border border-transparent hover:border-red-500/20 rounded-lg cursor-pointer"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* VISUAL PROGRESS BAR */}
      <div className="w-full bg-white/[0.04] h-1.5 relative z-10">
        <div
          className="bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* PROCTORING ALERT BANNER (Active when grace countdown is ticking) */}
      {violationCountdown !== null && (
        <div className="bg-red-600/95 text-white px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3 z-50 animate-pulse border-b border-red-400/50 shadow-xl shadow-red-600/20">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-white animate-bounce" />
            <div>
              <p className="font-bold text-xs sm:text-sm tracking-wide">
                {proctoringStatus.alert === 'OUT_OF_FRAME'
                  ? 'PROCTORING VIOLATION: Candidate Out of Frame!'
                  : proctoringStatus.alert === 'MULTIPLE_PERSONS'
                  ? 'SECURITY ALERT: Multiple Persons Detected in Camera Frame!'
                  : 'CAMERA ALERT: Camera Feed Disconnected!'}
              </p>
              <p className="text-[11px] text-red-100 font-normal">
                {proctoringStatus.alert === 'OUT_OF_FRAME'
                  ? 'Please return to your camera view immediately. The test will automatically terminate if you stay away.'
                  : proctoringStatus.alert === 'MULTIPLE_PERSONS'
                  ? 'Only the registered candidate is permitted during the examination.'
                  : 'A live camera feed is strictly required for interview integrity.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/20">
            <Clock className="w-4 h-4 text-red-300" />
            <span className="font-mono font-bold text-xs sm:text-sm text-red-200">
              Test Closes in: {violationCountdown}s
            </span>
          </div>
        </div>
      )}

      {/* CANDIDATE VERIFICATION VIEW (Step 1: Calibration & Identity Check) */}
      {currentState === 'VERIFYING' && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 relative z-10 flex flex-col justify-center animate-fadeIn">
          <div className="card-surface p-6 sm:p-8 bg-[#09090E]/95 border border-white/[0.08] rounded-2xl shadow-2xl space-y-6">
            <div className="flex items-center gap-3 border-b border-white/[0.08] pb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Candidate Identity &amp; Environment Verification
                </h2>
                <p className="text-xs text-neutral-400">
                  Align your camera and verify your presence to calibrate the AI proctoring system before the interview begins.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left: Video Preview with Guide */}
              <div className="md:col-span-7 space-y-2">
                <VideoPreview
                  isCameraActive={isCameraActive}
                  isMicActive={isMicActive}
                  onToggleCamera={() => setIsCameraActive(!isCameraActive)}
                  onToggleMic={handleToggleMic}
                  onProctoringStatus={setProctoringStatus}
                  showVerificationGuide={true}
                />
                <p className="text-[11px] text-center text-neutral-400">
                  Position your face within the oval alignment guide with good front lighting.
                </p>
              </div>

              {/* Right: Verification Checklist */}
              <div className="md:col-span-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Pre-Flight System Check
                </h3>

                <div className="space-y-2.5">
                  {/* Item 1: Camera Feed */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E0E14] border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-neutral-400" />
                      <span>Camera Feed</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isCameraActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isCameraActive ? 'Connected' : 'Offline'}
                    </span>
                  </div>

                  {/* Item 2: Person in Frame */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E0E14] border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-400" />
                      <span>Candidate Presence</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      proctoringStatus.facesDetected === 1
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : proctoringStatus.facesDetected > 1
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {proctoringStatus.facesDetected === 1
                        ? '1 Candidate'
                        : proctoringStatus.facesDetected > 1
                        ? `Multiple (${proctoringStatus.facesDetected})`
                        : 'Out of Frame'}
                    </span>
                  </div>

                  {/* Item 3: Centering */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E0E14] border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                      <span>Camera Framing</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      proctoringStatus.isCentered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {proctoringStatus.isCentered ? 'Centered' : 'Adjust Framing'}
                    </span>
                  </div>

                  {/* Item 4: Microphone */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E0E14] border border-white/[0.06] text-xs">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-neutral-400" />
                      <span>Microphone</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isMicActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {isMicActive ? 'Active' : 'Muted'}
                    </span>
                  </div>
                </div>

                {/* Verification Call to action */}
                {proctoringStatus.facesDetected === 1 && proctoringStatus.isCentered && isCameraActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentState('QUESTION');
                      setQuestionSeconds(0);
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirm Verification &amp; Begin Interview</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 rounded-xl bg-white/10 text-neutral-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-white/5"
                  >
                    <span>
                      {proctoringStatus.facesDetected === 0
                        ? 'Face camera to complete verification...'
                        : proctoringStatus.facesDetected > 1
                        ? 'Only 1 person allowed in frame...'
                        : 'Center your face to begin...'}
                    </span>
                  </button>
                )}

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentState('QUESTION');
                      setQuestionSeconds(0);
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors underline cursor-pointer"
                  >
                    Skip calibration (Dev/Testing Mode)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TEST TERMINATED VIEW (Closed due to proctoring violation) */}
      {currentState === 'TERMINATED' && (
        <div className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-6 relative z-10 flex flex-col justify-center animate-fadeIn my-auto">
          <div className="card-surface p-8 bg-[#09090E]/95 border border-red-500/40 rounded-2xl shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Interview Terminated
              </h2>
              <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-300">
                Proctoring Violation
              </span>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-200 text-left space-y-1.5">
              <span className="font-semibold text-red-300 block">Violation Details:</span>
              <p className="leading-relaxed">
                {terminationReason || 'Candidate was out of the camera frame or multiple persons were detected during the examination.'}
              </p>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
              PlacePrep mock interviews enforce standard proctoring policies to ensure realistic assessment conditions. Because the proctoring violation was not resolved within the grace period, this session has been locked and closed.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/interview')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors cursor-pointer"
              >
                Restart New Interview
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 font-semibold text-xs transition-colors cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN INTERVIEW SECTION (Active when not verifying or terminated) */}
      {currentState !== 'VERIFYING' && currentState !== 'TERMINATED' && (
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        {/* LEFT / MAIN COLUMN: AI Interviewer & Candidate Answer Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Interviewer Card */}
          <div className="card-surface p-6 sm:p-7 space-y-6 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl relative shadow-xl">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">AI Technical Interviewer</h2>
                  <span className="text-xs text-purple-400 font-mono uppercase">{category}</span>
                </div>
              </div>

              {/* State Badge & Question Timer */}
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-[#0E0E14] border border-white/10 text-xs font-mono text-neutral-300 flex items-center gap-1.5" title="Time spent on this question">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{formatTime(questionSeconds)}</span>
                </div>

                <div className="px-3 py-1 rounded-full bg-black/60 border border-white/10 text-xs font-mono font-medium text-neutral-300 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentState === 'RECORDING'
                        ? 'bg-red-500 animate-ping'
                        : currentState === 'EVALUATING'
                        ? 'bg-amber-400 animate-pulse'
                        : currentState === 'FEEDBACK'
                        ? 'bg-purple-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span>{currentState}</span>
                </div>
              </div>
            </div>

            {/* Current Question Box with TTS Audio & Hint Buttons */}
            <div className="bg-[#0E0E14] p-5 rounded-xl border border-white/[0.08] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                  Question {questionIndex} of {totalQuestions}
                </span>

                <div className="flex items-center gap-2">
                  {/* Auto-Speak Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const nextVal = !autoReadQuestion;
                      setAutoReadQuestion(nextVal);
                      if (!nextVal && isPlayingTTS) {
                        api.stopQuestionSpeech();
                        setIsPlayingTTS(false);
                      } else if (nextVal && !isPlayingTTS) {
                        setIsPlayingTTS(true);
                        api.playQuestionSpeech(currentQuestion, () => setIsPlayingTTS(false)).catch(() => setIsPlayingTTS(false));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                      autoReadQuestion
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-400 border-white/10'
                    }`}
                    title={autoReadQuestion ? 'Auto-speak is ON (questions are read aloud automatically). Click to disable.' : 'Auto-speak is OFF. Click to enable automatic reading of questions.'}
                  >
                    <span className={`w-2 h-2 rounded-full ${autoReadQuestion ? 'bg-purple-400 animate-pulse' : 'bg-neutral-500'}`} />
                    <span>Auto-Speak: {autoReadQuestion ? 'ON' : 'OFF'}</span>
                  </button>

                  {/* TTS Read Aloud Button */}
                  <button
                    type="button"
                    onClick={handleToggleQuestionAudio}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                      isPlayingTTS
                        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/40 animate-pulse'
                        : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border-purple-500/20'
                    }`}
                    title={isPlayingTTS ? 'Stop reading' : 'Listen to AI interviewer read question aloud'}
                  >
                    {isPlayingTTS ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Speaking...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Listen Aloud</span>
                      </>
                    )}
                  </button>

                  {/* Practice Hint Button */}
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 transition-colors border cursor-pointer ${
                      showHint
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 border-white/10'
                    }`}
                    title="Get a practice hint for this question"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
                &ldquo;{currentQuestion}&rdquo;
              </p>

              {/* Hint Box (Collapsible) */}
              {showHint && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Interviewer Hint &amp; Key Concepts:</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed pl-5">
                    Consider structuring your answer around: <span className="text-amber-200 font-mono font-medium">{hint}</span>.
                    Discuss time/space trade-offs and real-world performance implications.
                  </p>
                </div>
              )}
            </div>

            {/* Status-specific progress message */}
            {currentState === 'EVALUATING' && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-3 animate-pulse">
                <Bot className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-200">Evaluating Your Response...</p>
                  <p className="text-[11px] text-amber-300/80">Analyzing technical depth, accuracy, relevance, and communication clarity against the hiring rubric.</p>
                </div>
              </div>
            )}

            {/* Error / Permission notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-red-200">Notice</p>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* CANDIDATE INPUT AREA (TABS: Verbal / Written Answer vs Code Scratchpad) */}
            {currentState !== 'FEEDBACK' && (
              <div className="space-y-3">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('response')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'response'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Verbal / Written Answer</span>
                      {transcript.trim() && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 ml-0.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('scratchpad')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        activeTab === 'scratchpad'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Code Scratchpad &amp; Notes</span>
                      {codeNotes.trim() && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Clear button */}
                  {(transcript.trim() || codeNotes.trim()) && currentState !== 'RECORDING' && currentState !== 'EVALUATING' && (
                    <button
                      type="button"
                      onClick={handleClearAnswer}
                      className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Clear answer to start fresh"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>

                {/* Response Tab: Live Transcript & Direct Input */}
                {activeTab === 'response' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span>Live Speech Transcript or Direct Input</span>
                      {currentState === 'RECORDING' && (
                        <span className="text-red-400 font-mono flex items-center gap-1.5 font-semibold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Listening: {formatTime(recordingSeconds)}
                        </span>
                      )}
                    </div>

                    {currentState === 'RECORDING' && (
                      <div className="flex items-center justify-between p-2.5 px-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 animate-pulse">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                          <span className="font-semibold text-red-200">Microphone Live: Speak your answer now...</span>
                        </div>
                        <span className="text-[11px] text-red-300/80">Speech transcribes automatically below</span>
                      </div>
                    )}

                    <textarea
                      value={transcript}
                      onChange={(e) => {
                        setTranscript(e.target.value);
                        baseTranscriptRef.current = e.target.value;
                      }}
                      placeholder={
                        currentState === 'RECORDING'
                          ? "Listening to your voice... Speak clearly and your words will appear here in real time."
                          : "Click 'Start Speaking' to answer with your microphone, or type your technical explanation here directly..."
                      }
                      disabled={currentState === 'EVALUATING'}
                      rows={6}
                      className={`w-full p-4 rounded-xl bg-[#0E0E14] border text-white placeholder-neutral-500 text-sm focus:outline-none transition-all disabled:opacity-80 leading-relaxed font-sans ${
                        currentState === 'RECORDING'
                          ? 'border-red-500/50 shadow-sm shadow-red-500/20 ring-1 ring-red-500/30'
                          : 'border-white/10 focus:border-purple-500/60'
                      }`}
                    />
                  </div>
                )}

                {/* Scratchpad Tab: Code & Structure */}
                {activeTab === 'scratchpad' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Code Implementation &amp; Pseudo-Code (Optional)</span>
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">Monospace editor</span>
                    </div>

                    <textarea
                      value={codeNotes}
                      onChange={(e) => setCodeNotes(e.target.value)}
                      placeholder="// Type code snippets, edge cases, or algorithm logic here...&#10;function solution(input) {&#10;  // O(N) time complexity approach&#10;  return true;&#10;}"
                      disabled={currentState === 'EVALUATING'}
                      rows={6}
                      className="w-full p-4 rounded-xl bg-[#08080C] border border-white/10 text-emerald-300 placeholder-neutral-600 text-xs sm:text-sm focus:outline-none focus:border-purple-500/60 transition-colors disabled:opacity-80 leading-relaxed font-mono"
                    />
                    <p className="text-[11px] text-neutral-400">
                      Code and notes written here are automatically submitted alongside your verbal explanation for technical evaluation.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* REAL-TIME EVALUATION FEEDBACK CARD (stays on screen until user clicks Next) */}
            {lastFeedback && currentState === 'FEEDBACK' && (
              <div className="p-5 rounded-2xl bg-[#0E0E14] border border-purple-500/30 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-sm text-white">Answer Evaluation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-400">Score:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      lastFeedback.score >= 70
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : lastFeedback.score >= 40
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {lastFeedback.score}/100
                    </span>
                  </div>
                </div>

                {/* Qualitative Feedback */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-neutral-300">Interviewer Assessment:</h4>
                  <p className="text-xs text-neutral-200 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                    {lastFeedback.feedback}
                  </p>
                </div>

                {/* Key Points Covered */}
                {lastFeedback.keyPointsCovered && lastFeedback.keyPointsCovered.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Key Points Covered:</span>
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-neutral-300">
                      {lastFeedback.keyPointsCovered.map((point, idx) => (
                        <li key={idx} className="flex items-center gap-2 bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10">
                          <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Improvement */}
                {lastFeedback.suggestedImprovement && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                    <span className="font-semibold text-purple-300">Suggested Improvement:</span>
                    <p className="text-neutral-300 leading-relaxed">{lastFeedback.suggestedImprovement}</p>
                  </div>
                )}

                {/* Action button: Next Question or Complete */}
                <div className="pt-2 flex items-center justify-end">
                  {questionIndex < totalQuestions && !lastFeedback.isCompleted ? (
                    <button
                      onClick={handleProceedNextQuestion}
                      type="button"
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
                    >
                      <span>Next Question ({questionIndex + 1}/{totalQuestions})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedNextQuestion}
                      type="button"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Finish &amp; View Evaluation Report</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* CONTROLS BAR (Only visible when not in FEEDBACK state) */}
            {currentState !== 'FEEDBACK' && (
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.07]">
                <div className="flex items-center gap-2">
                  {currentState === 'RECORDING' ? (
                    <button
                      onClick={handleStopAnswer}
                      type="button"
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition-all cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Speaking</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStartAnswer}
                      type="button"
                      disabled={currentState === 'EVALUATING'}
                      className="px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-black" />
                      <span>{transcript.trim() ? 'Add More Voice' : 'Start Speaking'}</span>
                    </button>
                  )}

                  {/* Skip question button */}
                  <button
                    onClick={handleSkipQuestion}
                    type="button"
                    disabled={currentState === 'EVALUATING' || currentState === 'RECORDING'}
                    className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 text-neutral-400 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Skip to next question"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={currentState === 'RECORDING' || currentState === 'EVALUATING' || (!transcript.trim() && !codeNotes.trim())}
                    className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
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
              <span className="text-[11px] text-purple-400">Live Attention Ready</span>
            </div>

            <VideoPreview
              isCameraActive={isCameraActive}
              isMicActive={isMicActive}
              onToggleCamera={() => setIsCameraActive(!isCameraActive)}
              onToggleMic={handleToggleMic}
              onProctoringStatus={setProctoringStatus}
              showVerificationGuide={false}
            />
          </div>

          {/* Audio Visualizer (Dynamic frequency modulation) */}
          <AudioVisualizer
            isRecording={currentState === 'RECORDING'}
            isMicActive={isMicActive}
            statusText={
              !isMicActive
                ? 'Microphone Muted'
                : currentState === 'RECORDING'
                ? 'Listening to candidate voice...'
                : currentState === 'EVALUATING'
                ? 'Evaluating answer...'
                : currentState === 'FEEDBACK'
                ? 'Reviewing evaluation feedback'
                : 'Microphone Standby'
            }
          />

          {/* Session Overview Card */}
          <div className="card-surface p-5 text-xs space-y-3 bg-[#09090E]/90 border border-white/[0.08] rounded-2xl">
            <h4 className="font-semibold text-neutral-200">Session Overview</h4>
            <div className="space-y-2 text-neutral-400">
              <div className="flex items-center justify-between">
                <span>Progress</span>
                <span className="text-purple-400 font-bold">{progressPercent}% ({questionIndex}/{totalQuestions})</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Time on Current Question</span>
                <span className="text-neutral-300 font-mono">{formatTime(questionSeconds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Elapsed Time</span>
                <span className="text-neutral-300 font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Camera Stream</span>
                <span className={isCameraActive ? 'text-emerald-400' : 'text-neutral-500'}>
                  {isCameraActive ? 'Active' : 'Off'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span>Auto-Read Questions</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoReadQuestion}
                    onChange={(e) => setAutoReadQuestion(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

export default function InterviewSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-neutral-300">Loading interview room...</p>
          </div>
        </div>
      }
    >
      <InterviewSessionContent />
    </Suspense>
  );
}
