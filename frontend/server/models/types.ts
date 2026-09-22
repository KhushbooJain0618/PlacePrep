// Shared TypeScript Models for PlacePrep Server

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type InterviewType = 'Technical' | 'HR' | 'Mixed';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface ChatRequest {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}

export interface InterviewStartRequest {
  role: string;
  difficulty: DifficultyLevel;
  type: InterviewType;
  questions: number;
}

export interface InterviewStartResponse {
  sessionId: string;
  role: string;
  difficulty: DifficultyLevel;
  type: InterviewType;
  totalQuestions: number;
  questionIndex: number;
  questionId: string;
  question: string;
  category: string;
  hint?: string;
}

export interface InterviewAnswerRequest {
  sessionId: string;
  questionId: string;
  transcript: string;
  durationSeconds?: number;
  visionSignalSummary?: {
    faceCenteredScore: number;
    lightingQuality: 'good' | 'fair' | 'poor';
    interactionActive: boolean;
  };
}

export interface InterviewAnswerResponse {
  score: number;
  feedback: string;
  keyPointsCovered: string[];
  suggestedImprovement: string;
  nextQuestion?: {
    questionId: string;
    questionIndex: number;
    question: string;
    category: string;
    hint?: string;
  };
  isCompleted: boolean;
}

export interface QuestionReview {
  questionId: string;
  questionIndex: number;
  question: string;
  category: string;
  transcript: string;
  score: number;
  feedback: string;
  idealAnswerHighlights: string[];
}

export interface InterviewFinishRequest {
  sessionId: string;
}

export interface InterviewFinishResponse {
  sessionId: string;
  overallScore: number;
  technical: number;
  relevance: number;
  communication: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  questionReviews: QuestionReview[];
  role: string;
  difficulty: DifficultyLevel;
  completedAt: string;
  aiDisclaimer: string;
}

export interface RoadmapGenerateRequest {
  role: string;
  level: DifficultyLevel;
  dailyHours: number;
  duration: number;
  topics: string[];
}

export interface RoadmapTask {
  id: string;
  title: string;
  topic: string;
  estimatedMinutes: number;
  status: 'pending' | 'in_progress' | 'completed';
  resources?: string[];
}

export interface RoadmapDay {
  dayNumber: number;
  title: string;
  focusArea: string;
  tasks: RoadmapTask[];
}

export interface RoadmapWeek {
  weekNumber: number;
  theme: string;
  summary: string;
  days: RoadmapDay[];
}

export interface RoadmapGenerateResponse {
  id: string;
  targetRole: string;
  level: DifficultyLevel;
  durationDays: number;
  dailyHours: number;
  totalWeeks: number;
  progressPercentage: number;
  weeks: RoadmapWeek[];
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  preparationProgress: number;
  daysRemaining: number;
  dailyStreak: number;
  interviewsCompleted: number;
  topicsCovered: number;
}
