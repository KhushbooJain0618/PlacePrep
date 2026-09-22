import {
  DifficultyLevel,
  InterviewType,
  InterviewStartResponse,
  InterviewAnswerResponse,
  InterviewFinishResponse,
  QuestionReview
} from '../models/types';
import { visionService } from './visionService';
import { aiService } from './aiService';
import { config } from '../config/env';

interface QuestionTemplate {
  id: string;
  role: string[];
  difficulty: DifficultyLevel;
  type: InterviewType;
  question: string;
  category: string;
  idealKeywords: string[];
  idealSummary: string[];
}

interface ActiveSession {
  sessionId: string;
  role: string;
  difficulty: DifficultyLevel;
  type: InterviewType;
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: QuestionTemplate[];
  answers: {
    questionId: string;
    questionIndex: number;
    transcript: string;
    score: number;
    technicalScore: number;
    relevanceScore: number;
    communicationScore: number;
    feedback: string;
    keyPointsCovered: string[];
    suggestedImprovement: string;
  }[];
  createdAt: number;
}

const QUESTION_BANK: QuestionTemplate[] = [
  // Software Developer - Technical
  {
    id: 'q-sw-1',
    role: ['Software Developer', 'Web Developer', 'Java Developer', 'Python Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'Explain the difference between an Array and a Linked List, along with their time complexities for insertion and access.',
    category: 'Data Structures',
    idealKeywords: ['contiguous', 'pointer', 'index', 'O(1)', 'O(n)', 'random access', 'traversal', 'memory'],
    idealSummary: [
      'Arrays use contiguous memory enabling O(1) indexed access but O(N) insertion/deletion.',
      'Linked Lists use node pointers enabling O(1) insertion if node pointer is known, but O(N) sequential search.',
      'Arrays have superior CPU cache locality.'
    ]
  },
  {
    id: 'q-sw-2',
    role: ['Software Developer', 'Java Developer', 'Python Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'What are the ACID properties in database management systems and why are they critical?',
    category: 'DBMS',
    idealKeywords: ['atomicity', 'consistency', 'isolation', 'durability', 'transaction', 'rollback', 'wal', 'commit'],
    idealSummary: [
      'Atomicity ensures all-or-nothing execution.',
      'Consistency guarantees database integrity constraints are preserved.',
      'Isolation prevents concurrent transaction anomalies.',
      'Durability ensures committed data survives system failures.'
    ]
  },
  {
    id: 'q-sw-3',
    role: ['Software Developer', 'Java Developer', 'Web Developer'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'Describe the core OOP principles and explain the difference between method overloading and method overriding.',
    category: 'Object-Oriented Programming',
    idealKeywords: ['encapsulation', 'abstraction', 'inheritance', 'polymorphism', 'compile-time', 'runtime', 'vtable', 'signature'],
    idealSummary: [
      'Encapsulation bundles state with behavior; Abstraction conceals complexity.',
      'Overloading is static/compile-time polymorphism with different parameter signatures in same class.',
      'Overriding is runtime polymorphism where subclass modifies parent method behavior.'
    ]
  },
  {
    id: 'q-sw-4',
    role: ['Software Developer', 'Python Developer', 'Data Analyst'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'How does Binary Search work, and what preconditions must be met before applying it?',
    category: 'Algorithms',
    idealKeywords: ['sorted', 'divide and conquer', 'O(log n)', 'mid', 'pointers', 'monotonic'],
    idealSummary: [
      'Collection must be monotonically sorted or possess binary searchable search space.',
      'Repeatedly halves search space by comparing target with midpoint.',
      'Guarantees O(log N) time complexity and O(1) auxiliary space iteratively.'
    ]
  },
  {
    id: 'q-sw-5',
    role: ['Software Developer', 'Java Developer', 'Python Developer', 'Web Developer'],
    difficulty: 'Advanced',
    type: 'Technical',
    question: 'What is the difference between a Process and a Thread, and how does context switching differ between them?',
    category: 'Operating Systems',
    idealKeywords: ['process', 'thread', 'address space', 'memory', 'pcb', 'tcb', 'context switch', 'overhead', 'ipc'],
    idealSummary: [
      'Processes have isolated virtual address spaces; threads share heap and code segments within same process.',
      'Process context switching flushes TLB and updates page tables, incurring heavy CPU overhead.',
      'Thread context switching preserves memory mapping, saving CPU cycles.'
    ]
  },

  // Web Developer
  {
    id: 'q-web-1',
    role: ['Web Developer', 'Software Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'Explain the difference between client-side rendering (CSR) and server-side rendering (SSR).',
    category: 'Web Architecture',
    idealKeywords: ['csr', 'ssr', 'seo', 'hydration', 'bundle', 'ttfb', 'first contentful paint', 'server'],
    idealSummary: [
      'SSR renders HTML on server giving fast initial paint and excellent SEO.',
      'CSR ships JavaScript bundle executed by browser, enabling rich SPAs after initial load.'
    ]
  },
  {
    id: 'q-web-2',
    role: ['Web Developer'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'How does the JavaScript Event Loop handle microtasks vs macrotasks?',
    category: 'JavaScript Core',
    idealKeywords: ['call stack', 'event loop', 'microtask', 'macrotask', 'promise', 'settimeout', 'callback queue'],
    idealSummary: [
      'Call stack executes synchronous code.',
      'Microtasks (Promise callbacks, queueMicrotask) take strict priority over macrotasks (setTimeout, setInterval).',
      'Microtask queue empties completely before next macrotask runs.'
    ]
  },

  // Data Analyst
  {
    id: 'q-da-1',
    role: ['Data Analyst', 'Software Developer'],
    difficulty: 'Beginner',
    type: 'Technical',
    question: 'Explain the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with practical examples.',
    category: 'SQL & Databases',
    idealKeywords: ['inner join', 'left join', 'outer join', 'null', 'matched', 'table', 'foreign key'],
    idealSummary: [
      'INNER JOIN produces only matching records.',
      'LEFT JOIN includes all left table rows, filling nulls for unmatched right rows.',
      'FULL OUTER JOIN unions both datasets including unmatched rows from either.'
    ]
  },
  {
    id: 'q-da-2',
    role: ['Data Analyst'],
    difficulty: 'Intermediate',
    type: 'Technical',
    question: 'What are SQL window functions and when would you use ROW_NUMBER() vs RANK() vs DENSE_RANK()?',
    category: 'SQL & Analytics',
    idealKeywords: ['window', 'partition by', 'order by', 'row_number', 'rank', 'dense_rank', 'ties', 'gap'],
    idealSummary: [
      'ROW_NUMBER assigns strictly sequential integers.',
      'RANK leaves gaps when values tie (e.g. 1, 2, 2, 4).',
      'DENSE_RANK handles ties without gaps (e.g. 1, 2, 2, 3).'
    ]
  },

  // HR & Mixed
  {
    id: 'q-hr-1',
    role: ['Software Developer', 'Java Developer', 'Python Developer', 'Data Analyst', 'Web Developer'],
    difficulty: 'Beginner',
    type: 'HR',
    question: 'Tell me about a challenging technical project you built, an obstacle you faced, and how you resolved it.',
    category: 'Behavioral / STAR Method',
    idealKeywords: ['situation', 'task', 'action', 'result', 'learning', 'team', 'debugging', 'impact'],
    idealSummary: [
      'Used STAR method (Situation, Task, Action, Result).',
      'Described specific architectural/technical bottleneck.',
      'Demonstrated ownership, problem-solving, and measurable outcome.'
    ]
  },
  {
    id: 'q-hr-2',
    role: ['Software Developer', 'Java Developer', 'Python Developer', 'Data Analyst', 'Web Developer'],
    difficulty: 'Intermediate',
    type: 'HR',
    question: 'How do you handle disagreements on technical architecture or design choices within a team?',
    category: 'Collaboration & Communication',
    idealKeywords: ['data-driven', 'listening', 'trade-offs', 'consensus', 'respect', 'documentation', 'prototype'],
    idealSummary: [
      'Focus on objective trade-offs (scalability, complexity, delivery speed).',
      'Active listening and respectful technical debate.',
      'Building small proofs of concept (PoC) to validate hypotheses.'
    ]
  }
];

const globalSessions: Map<string, ActiveSession> = (globalThis as any).__placeprep_interview_sessions || new Map<string, ActiveSession>();
(globalThis as any).__placeprep_interview_sessions = globalSessions;

export class InterviewService {
  private sessions: Map<string, ActiveSession> = globalSessions;

  startSession(params: {
    role: string;
    difficulty: DifficultyLevel;
    type: InterviewType;
    questions: number;
  }): InterviewStartResponse {
    const sessionId = 'session_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();

    // Filter relevant questions by role, type, and difficulty
    let pool = QUESTION_BANK.filter(q => {
      const roleMatch = q.role.some(r => r.toLowerCase().includes(params.role.toLowerCase()) || params.role.toLowerCase().includes(r.toLowerCase()));
      const typeMatch = params.type === 'Mixed' ? true : q.type === params.type;
      return roleMatch && typeMatch;
    });

    // Fallback pool if role filter is too restrictive
    if (pool.length === 0) {
      pool = QUESTION_BANK.filter(q => params.type === 'Mixed' ? true : q.type === params.type);
    }
    if (pool.length === 0) {
      pool = [...QUESTION_BANK];
    }

    // Select questions
    const selectedQuestions: QuestionTemplate[] = [];
    const count = Math.min(params.questions || 5, pool.length);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
      selectedQuestions.push(shuffled[i]);
    }

    const session: ActiveSession = {
      sessionId,
      role: params.role,
      difficulty: params.difficulty,
      type: params.type,
      totalQuestions: selectedQuestions.length,
      currentQuestionIndex: 0,
      questions: selectedQuestions,
      answers: [],
      createdAt: Date.now()
    };

    this.sessions.set(sessionId, session);

    const firstQ = selectedQuestions[0];

    return {
      sessionId,
      role: params.role,
      difficulty: params.difficulty,
      type: params.type,
      totalQuestions: selectedQuestions.length,
      questionIndex: 1,
      questionId: firstQ.id,
      question: firstQ.question,
      category: firstQ.category,
      hint: firstQ.idealKeywords.slice(0, 3).join(', ')
    };
  }

  async submitAnswer(params: {
    sessionId: string;
    questionId: string;
    transcript: string;
    durationSeconds?: number;
    visionSignals?: {
      faceCenteredScore?: number;
      lightingQuality?: 'good' | 'fair' | 'poor';
      interactionActive?: boolean;
    };
  }): Promise<InterviewAnswerResponse> {
    let session = this.sessions.get(params.sessionId);
    if (!session) {
      // Graceful auto-recovery for refreshed browsers or demo session IDs
      const matchedQ = QUESTION_BANK.find(q => q.id === params.questionId) || QUESTION_BANK[0];
      session = {
        sessionId: params.sessionId,
        role: matchedQ.role[0] || 'Software Developer',
        difficulty: matchedQ.difficulty,
        type: matchedQ.type,
        totalQuestions: 5,
        currentQuestionIndex: 0,
        questions: [matchedQ, ...QUESTION_BANK.filter(q => q.id !== matchedQ.id).slice(0, 4)],
        answers: [],
        createdAt: Date.now()
      };
      this.sessions.set(params.sessionId, session);
    }

    const currentQ = session.questions.find(q => q.id === params.questionId) || session.questions[session.currentQuestionIndex];
    const transcript = params.transcript || '';
    const lowerTranscript = transcript.toLowerCase();

    let technicalScore = 0;
    let relevanceScore = 0;
    let communicationScore = 0;
    let feedback = '';
    let keyPointsCovered: string[] = [];
    let suggestedImprovement = '';
    let evaluatedWithAzure = false;

    // 1. Live Azure AI Evaluation when live keys are configured
    if (!config.useMockAI) {
      try {
        const evalPrompt = `You are a Senior Technical Interviewer evaluating a candidate's spoken response.
Question: "${currentQ.question}"
Role: ${session.role} | Category: ${currentQ.category}
Candidate Answer: "${transcript || 'Candidate provided no audible response.'}"
Reference Keywords: ${currentQ.idealKeywords.join(', ')}

Provide objective, constructive grading. Respond ONLY with a valid JSON object matching this schema:
{
  "technicalScore": <integer 0-100>,
  "relevanceScore": <integer 0-100>,
  "communicationScore": <integer 0-100>,
  "feedback": "<2 sentences evaluating the technical depth and clarity>",
  "keyPointsCovered": ["<key concept candidate mentioned>", "<second key concept>"],
  "suggestedImprovement": "<actionable recommendation to improve the answer>"
}`;

        const rawJson = await Promise.race([
          aiService.completePrompt([
            { role: 'system', content: 'You are an interview grading engine. Return JSON only without code blocks or markdown.' },
            { role: 'user', content: evalPrompt }
          ], { temperature: 0.3, maxTokens: 400 }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('AI evaluation timed out')), 20000))
        ]);

        if (rawJson) {
          const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (parsed.technicalScore !== undefined && parsed.feedback) {
            let tech = Number(parsed.technicalScore);
            if (tech <= 10 && tech > 0) tech = Math.round(tech * 10);
            let rel = Number(parsed.relevanceScore ?? 75);
            if (rel <= 10 && rel > 0) rel = Math.round(rel * 10);
            let comm = Number(parsed.communicationScore ?? 75);
            if (comm <= 10 && comm > 0) comm = Math.round(comm * 10);

            technicalScore = Math.min(99, Math.max(10, tech));
            relevanceScore = Math.min(99, Math.max(10, rel));
            communicationScore = Math.min(99, Math.max(10, comm));
            feedback = parsed.feedback;
            keyPointsCovered = Array.isArray(parsed.keyPointsCovered) && parsed.keyPointsCovered.length > 0
              ? parsed.keyPointsCovered
              : currentQ.idealKeywords.filter(k => lowerTranscript.includes(k.toLowerCase())).map(k => `Addressed concept: "${k}"`);
            suggestedImprovement = parsed.suggestedImprovement || 'Elaborate on edge cases, trade-offs, and practical architecture.';
            evaluatedWithAzure = true;
          }
        }
      } catch (azureErr) {
        console.warn('[InterviewService] Azure evaluation error or timeout, using dynamic rubric evaluation:', azureErr);
      }
    }

    // 2. Dynamic Rubric Fallback (Calculated dynamically from candidate transcript)
    if (!evaluatedWithAzure) {
      const matchedKeywords = currentQ.idealKeywords.filter(k => lowerTranscript.includes(k.toLowerCase()));
      const missingKeywords = currentQ.idealKeywords.filter(k => !lowerTranscript.includes(k.toLowerCase()));
      const coverageRatio = currentQ.idealKeywords.length > 0 ? (matchedKeywords.length / currentQ.idealKeywords.length) : 0.5;

      technicalScore = Math.round(40 + (coverageRatio * 55));
      if (transcript.length < 25) technicalScore = Math.min(technicalScore, 35);

      relevanceScore = Math.round(50 + (coverageRatio * 45));
      if (lowerTranscript.includes(currentQ.category.toLowerCase())) relevanceScore += 5;

      communicationScore = 70;
      if (transcript.length > 120) communicationScore += 15;
      if (transcript.length > 250) communicationScore += 10;
      if (transcript.length < 30) communicationScore = 40;

      technicalScore = Math.min(98, Math.max(20, technicalScore));
      relevanceScore = Math.min(98, Math.max(25, relevanceScore));
      communicationScore = Math.min(96, Math.max(30, communicationScore));

      keyPointsCovered = matchedKeywords.map(k => `Covered key concept: "${k}"`);
      if (keyPointsCovered.length === 0) {
        keyPointsCovered.push('Basic conversational response provided.');
      }

      if (missingKeywords.length > 0) {
        suggestedImprovement = `Strengthen your answer by explaining: ${missingKeywords.slice(0, 3).join(', ')}.`;
      } else {
        suggestedImprovement = 'Deepen your answer by quantifying performance metrics and discussing real-world scale.';
      }

      const overallEst = Math.round((technicalScore * 0.45) + (relevanceScore * 0.35) + (communicationScore * 0.20));
      feedback = overallEst >= 75
        ? `Strong response! You addressed core aspects of ${currentQ.category}, correctly incorporating "${matchedKeywords.slice(0, 2).join('", "')}".`
        : `Partial explanation for ${currentQ.category}. You mentioned ${matchedKeywords.length > 0 ? `"${matchedKeywords.join(', ')}"` : 'minimal technical terms'}, but missed crucial concepts like ${missingKeywords.slice(0, 2).join(', ')}.`;
    }

    const overallQScore = Math.round((technicalScore * 0.45) + (relevanceScore * 0.35) + (communicationScore * 0.20));

    // Save answer record
    session.answers.push({
      questionId: currentQ.id,
      questionIndex: session.currentQuestionIndex + 1,
      transcript: transcript || 'No answer transcribed.',
      score: overallQScore,
      technicalScore,
      relevanceScore,
      communicationScore,
      feedback,
      keyPointsCovered,
      suggestedImprovement
    });

    session.currentQuestionIndex += 1;
    const isCompleted = session.currentQuestionIndex >= session.totalQuestions;

    let nextQuestion;
    if (!isCompleted) {
      const nq = session.questions[session.currentQuestionIndex];
      nextQuestion = {
        questionId: nq.id,
        questionIndex: session.currentQuestionIndex + 1,
        question: nq.question,
        category: nq.category,
        hint: nq.idealKeywords.slice(0, 3).join(', ')
      };
    }

    return {
      score: overallQScore,
      feedback,
      keyPointsCovered,
      suggestedImprovement,
      nextQuestion,
      isCompleted
    };
  }

  async finishSession(sessionId: string): Promise<InterviewFinishResponse> {
    const session = this.sessions.get(sessionId);

    // If session not found in memory or empty, return clean zero state rather than fake hardcoded data
    if (!session || session.answers.length === 0) {
      return {
        sessionId,
        overallScore: 0,
        technical: 0,
        relevance: 0,
        communication: 0,
        strengths: ['No answers were submitted during this interview session.'],
        improvements: ['Start a new interview round and provide spoken or written answers to receive AI evaluation.'],
        recommendations: ['Review foundational topics and practice answering placement questions aloud.'],
        questionReviews: [],
        role: session?.role || 'Software Developer',
        difficulty: session?.difficulty || 'Intermediate',
        completedAt: new Date().toISOString(),
        aiDisclaimer: 'Scores and feedback are AI-generated based on evaluated responses.'
      };
    }

    // Calculate aggregated scores from actual answers
    const technicalAvg = Math.round(session.answers.reduce((acc, a) => acc + a.technicalScore, 0) / session.answers.length);
    const relevanceAvg = Math.round(session.answers.reduce((acc, a) => acc + a.relevanceScore, 0) / session.answers.length);
    const communicationAvg = Math.round(session.answers.reduce((acc, a) => acc + a.communicationScore, 0) / session.answers.length);
    const overallScore = Math.round((technicalAvg * 0.45) + (relevanceAvg * 0.35) + (communicationAvg * 0.20));

    // Question reviews derived strictly from candidate's actual answers
    const questionReviews: QuestionReview[] = session.answers.map(ans => {
      const qTemplate = session.questions.find(q => q.id === ans.questionId) || session.questions[ans.questionIndex - 1];
      return {
        questionId: ans.questionId,
        questionIndex: ans.questionIndex,
        question: qTemplate ? qTemplate.question : 'Technical Interview Question',
        category: qTemplate ? qTemplate.category : 'General Technical',
        transcript: ans.transcript,
        score: ans.score,
        feedback: ans.feedback,
        idealAnswerHighlights: qTemplate ? qTemplate.idealSummary : ['Clear technical explanation', 'Sound problem-solving logic']
      };
    });

    let strengths: string[] = [];
    let improvements: string[] = [];
    let recommendations: string[] = [];

    // Synthesize evaluation with live Azure AI
    if (!config.useMockAI) {
      try {
        const summaryPrompt = `You are a Principal Technical Hiring Bar Raiser evaluating a candidate's completed interview round.
Target Role: ${session.role}
Difficulty Level: ${session.difficulty}

Here are the candidate's actual answered questions and transcripts:
${session.answers.map((a, i) => {
  const qObj = session.questions.find(q => q.id === a.questionId);
  return `Q${i + 1} (${qObj?.category || 'Technical'}): "${qObj?.question || a.questionId}"
Candidate Answer: "${a.transcript}"
Score: ${a.score}/100 | Feedback: "${a.feedback}"`;
}).join('\n\n')}

Analyze their actual answers dynamically. Provide specific, tailored strengths, improvements, and recommendations based on what the candidate actually discussed.
Respond ONLY with a valid JSON object matching this schema:
{
  "strengths": ["<specific positive technical capability demonstrated in their answers>", "<second specific strength>", "<third strength>"],
  "improvements": ["<concrete technical gap or missed concept in their answers>", "<second specific gap>", "<third gap>"],
  "recommendations": ["<targeted placement preparation recommendation for ${session.role}>", "<second recommendation>", "<third recommendation>"]
}`;

        const rawJson = await Promise.race([
          aiService.completePrompt([
            { role: 'system', content: 'You are an executive hiring bar evaluation engine. Return JSON only without markdown or code blocks.' },
            { role: 'user', content: summaryPrompt }
          ], { temperature: 0.3, maxTokens: 600 }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('AI synthesis timed out')), 20000))
        ]);

        if (rawJson) {
          const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed.strengths) && parsed.strengths.length > 0) {
            strengths = parsed.strengths.slice(0, 4);
          }
          if (Array.isArray(parsed.improvements) && parsed.improvements.length > 0) {
            improvements = parsed.improvements.slice(0, 4);
          }
          if (Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
            recommendations = parsed.recommendations.slice(0, 4);
          }
        }
      } catch (synthErr) {
        console.warn('[InterviewService] Live AI synthesis failed, dynamically generating from candidate answer data:', synthErr);
      }
    }

    // Dynamic fallback derived strictly from candidate's actual answer performance
    if (strengths.length === 0) {
      const topAnswers = [...session.answers].sort((a, b) => b.score - a.score);
      const lowAnswers = [...session.answers].sort((a, b) => a.score - b.score);

      const bestCategories = topAnswers.slice(0, 2).map(a => {
        const qObj = session.questions.find(q => q.id === a.questionId);
        return qObj ? qObj.category : 'General Technical';
      });

      const weakCategories = lowAnswers.slice(0, 2).map(a => {
        const qObj = session.questions.find(q => q.id === a.questionId);
        return qObj ? qObj.category : 'General Technical';
      });

      strengths = [
        `Demonstrated strong competency in ${bestCategories[0] || session.role} concepts.`,
        `Articulated problem-solving logic clearly with an average communication score of ${communicationAvg}%.`,
        `Structured verbal responses with appropriate technical vocabulary.`
      ];

      improvements = [
        `Deepen technical depth and edge-case handling in ${weakCategories[0] || 'core fundamentals'}.`,
        `Proactively discuss space and time complexity trade-offs for algorithms.`,
        `Provide concrete architectural or real-world examples to support definitions.`
      ];

      recommendations = [
        `Practice high-frequency interview questions in ${weakCategories[0] || 'DSA and System Design'}.`,
        `Conduct timed mock sessions focusing on speaking in structured STAR/PREP framework.`,
        `Review reference placement cheat sheets for ${session.role} interviews.`
      ];
    }

    return {
      sessionId: session.sessionId,
      overallScore,
      technical: technicalAvg,
      relevance: relevanceAvg,
      communication: communicationAvg,
      strengths,
      improvements,
      recommendations,
      questionReviews,
      role: session.role,
      difficulty: session.difficulty,
      completedAt: new Date().toISOString(),
      aiDisclaimer: 'Scores and feedback are AI-generated estimates based on defined technical evaluation rubrics for student preparation purposes.'
    };
  }
}

export const interviewService = new InterviewService();
