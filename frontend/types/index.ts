// Frontend TypeScript definitions for PlacePrep

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type InterviewType = 'Technical' | 'HR' | 'Mixed';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface ChatResponse {
  answer: string;
  sources: string[];
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
  };
  isCompleted: boolean;
  transcript?: string;
  visionNotice?: string;
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
