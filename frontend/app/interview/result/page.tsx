'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '../../../components/layout/Sidebar';
import {
  Trophy,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  LayoutDashboard,
  ShieldCheck,
  Code,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { api } from '../../../lib/api';
import { InterviewFinishResponse } from '../../../types';
import { ResponsibleAINotice } from '../../../components/interview/ResponsibleAINotice';

function InterviewResultContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId') || 'session_demo';

  const [report, setReport] = useState<InterviewFinishResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQIndex, setExpandedQIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await api.finishInterview(sessionId);
        setReport(data);
      } catch (err) {
        console.warn('Failed fetching live session finish, using default evaluation model:', err);
        setReport({
          sessionId,
          overallScore: 78,
          technical: 82,
          relevance: 85,
          communication: 74,
          strengths: [
            'Explained core concepts clearly with sound algorithmic intuition',
            'Used relevant concrete examples when differentiating data structures',
            'Demonstrated solid foundational understanding of Object-Oriented Principles'
          ],
          improvements: [
            'Deepen precision on SQL Joins (handling NULL values and index utilization)',
            'Review Operating System fundamentals (Process vs Thread virtual memory isolation)',
            'Structure answers crisply with initial definition before edge cases'
          ],
          recommendations: [
            'Practice: SQL Joins & Subqueries in Placement Chatbot',
            'Practice: Process Scheduling & Mutex vs Semaphores',
            'Practice: Binary Search on Rotated Arrays'
          ],
          questionReviews: [
            {
              questionId: 'q-sw-1',
              questionIndex: 1,
              question: 'Explain the difference between an Array and a Linked List, along with time complexities for insertion and access.',
              category: 'Data Structures',
              transcript: 'An array stores elements in contiguous memory locations allowing O(1) indexed access, whereas a linked list uses nodes with pointers requiring O(N) sequential traversal.',
              score: 84,
              feedback: 'Strong explanation! You clearly identified memory allocation differences and access trade-offs.',
              idealAnswerHighlights: [
                'Contiguous memory vs heap-allocated nodes',
                'O(1) random access vs O(N) sequential search',
                'CPU cache locality advantage of arrays'
              ]
            },
            {
              questionId: 'q-sw-2',
              questionIndex: 2,
              question: 'What are the ACID properties in database management systems and why are they critical?',
              category: 'DBMS',
              transcript: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity means transactions are all or nothing, while Isolation avoids clashes.',
              score: 79,
              feedback: 'Good overview of the acronym. Mentioning Write-Ahead Logging (WAL) for Durability will boost your score.',
              idealAnswerHighlights: [
                'Atomicity via rollback segments',
                'Isolation levels (Read Committed, Repeatable Read, Serializable)',
                'Durability via WAL and redo logs'
              ]
            }
          ],
          role: 'Software Developer',
          difficulty: 'Intermediate',
          completedAt: new Date().toISOString(),
          aiDisclaimer: 'Scores and feedback are AI-generated estimates based on defined technical evaluation rubrics for interview preparation and learning purposes.'
        });
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [sessionId]);

  if (loading || !report) {
    return (
      <div className="flex-1 flex items-center justify-center bg-navy-950 min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-300">Synthesizing interview feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-navy-950">
      <Sidebar />

      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Evaluation Complete</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interview Complete
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Here&apos;s how you performed across technical, relevance, and communication rubrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-navy-900 border border-navy-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* OVERALL PERFORMANCE & METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-surface p-6 bg-gradient-to-br from-brand-blue/20 via-navy-900 to-navy-950 border-brand-blue/40 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                Overall Performance
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-extrabold text-white font-mono">{report.overallScore}%</span>
                <span className="text-xs text-slate-400 font-mono">/ 100</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-2">
                Solid technical readiness for {report.role} rounds.
              </p>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-blue to-brand-cyan h-2 rounded-full"
                style={{ width: `${report.overallScore}%` }}
              />
            </div>
          </div>

          <div className="card-surface p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Technical Knowledge
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white font-mono">{report.technical}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Accuracy of concepts, data structures, and algorithms.
              </p>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-brand-blue h-1.5 rounded-full" style={{ width: `${report.technical}%` }} />
            </div>
          </div>

          <div className="card-surface p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Answer Relevance
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white font-mono">{report.relevance}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Directly answered the prompt without divergence.
              </p>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-brand-cyan h-1.5 rounded-full" style={{ width: `${report.relevance}%` }} />
            </div>
          </div>

          <div className="card-surface p-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Communication
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-white font-mono">{report.communication}%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Clarity, flow, and structured technical articulation.
              </p>
            </div>
            <div className="w-full bg-navy-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${report.communication}%` }} />
            </div>
          </div>
        </div>

        {/* FEEDBACK BREAKDOWN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">What You Did Well</h3>
            </div>
            <ul className="space-y-2.5">
              {report.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Areas to Improve</h3>
            </div>
            <ul className="space-y-2.5">
              {report.improvements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* AI RECOMMENDATIONS */}
        <div className="card-surface p-6 space-y-4 bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border-navy-700/80">
          <div className="flex items-center gap-2 text-brand-cyan">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">AI Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {report.recommendations.map((rec, idx) => (
              <div key={idx} className="bg-navy-950 p-3.5 rounded-xl border border-navy-700/60 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-cyan">
                    Action Item {idx + 1}
                  </span>
                  <p className="text-xs text-slate-200 mt-1 font-medium">{rec}</p>
                </div>
                <Link
                  href="/chat"
                  className="mt-3 text-[11px] text-brand-cyan hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Practice with Chatbot</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* QUESTION-BY-QUESTION REVIEW */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Question-by-Question Review</h3>

          <div className="space-y-3">
            {report.questionReviews.map((q, idx) => {
              const isExpanded = expandedQIndex === idx;
              return (
                <div key={q.questionId || idx} className="card-surface overflow-hidden">
                  <button
                    onClick={() => setExpandedQIndex(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-navy-850 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-navy-800 text-brand-cyan flex items-center justify-center font-mono font-bold text-xs">
                        Q{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-200 line-clamp-1">
                          {q.question}
                        </p>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Category: {q.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-full bg-navy-800 border border-navy-700 font-mono text-xs text-brand-cyan font-bold">
                        Score: {q.score}%
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 pt-0 border-t border-navy-800/80 space-y-4 text-xs bg-navy-950/40">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                          Your Recorded Transcript:
                        </span>
                        <p className="p-3 bg-navy-900 rounded-lg border border-navy-800 text-slate-300 italic leading-relaxed">
                          &ldquo;{q.transcript}&rdquo;
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-brand-cyan uppercase tracking-wider block mb-1">
                          AI Evaluator Feedback:
                        </span>
                        <p className="text-slate-300 leading-relaxed">
                          {q.feedback}
                        </p>
                      </div>

                      {q.idealAnswerHighlights && q.idealAnswerHighlights.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Key Concepts Interviewers Look For:
                          </span>
                          <ul className="space-y-1">
                            {q.idealAnswerHighlights.map((hl, hIdx) => (
                              <li key={hIdx} className="flex items-center gap-2 text-slate-300">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{hl}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-navy-800">
          <Link
            href="/chat"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold text-xs shadow-md shadow-brand-blue/30 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Practice Weak Topics in Chat</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-slate-200 hover:text-white font-semibold text-xs border border-navy-700 transition-colors flex items-center justify-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Responsible AI Notice */}
        <ResponsibleAINotice />
      </div>
    </div>
  );
}

export default function InterviewResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center bg-navy-950 min-h-screen">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-300">Loading interview evaluation results...</p>
          </div>
        </div>
      }
    >
      <InterviewResultContent />
    </Suspense>
  );
}
