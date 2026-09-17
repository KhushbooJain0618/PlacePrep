import {
  ChatResponse,
  InterviewStartResponse,
  InterviewAnswerResponse,
  InterviewFinishResponse,
  RoadmapGenerateResponse
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Universal safe fetch wrapper with structured error handling
 */
async function safeFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || 'Something went wrong while connecting to the AI service. Please try again.');
    }

    return await res.json() as T;
  } catch (err: any) {
    console.error(`[API Error - ${endpoint}]:`, err);
    throw new Error(err.message || 'Something went wrong while connecting to the AI service. Please try again.');
  }
}

export const api = {
  // Chat API
  async sendChatMessage(message: string, history?: { role: 'user' | 'assistant'; content: string }[]): Promise<ChatResponse> {
    return safeFetch<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  // Mock Interview APIs
  async startInterview(params: {
    role: string;
    difficulty: string;
    type: string;
    questions: number;
  }): Promise<InterviewStartResponse> {
    return safeFetch<InterviewStartResponse>('/interview/start', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async submitInterviewAnswer(params: {
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
    return safeFetch<InterviewAnswerResponse>('/interview/answer', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async finishInterview(sessionId: string): Promise<InterviewFinishResponse> {
    return safeFetch<InterviewFinishResponse>('/interview/finish', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  },

  // Roadmap APIs
  async generateRoadmap(params: {
    role: string;
    level: string;
    dailyHours: number;
    duration: number;
    topics: string[];
  }): Promise<RoadmapGenerateResponse> {
    return safeFetch<RoadmapGenerateResponse>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Health API
  async checkHealth() {
    return safeFetch<{ status: string; mode: string; integrations: Record<string, boolean> }>('/health', {
      method: 'GET',
    });
  }
};
