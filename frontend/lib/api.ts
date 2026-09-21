import {
  ChatResponse,
  InterviewStartResponse,
  InterviewAnswerResponse,
  InterviewFinishResponse,
  RoadmapGenerateResponse,
  StudentUser,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'placeprep_token';
const USER_KEY = 'placeprep_user';

// Auth Helpers
export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser: (): StudentUser | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: StudentUser): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

/**
 * Universal safe fetch wrapper with structured error handling & auth header injection
 */
async function safeFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const token = authStorage.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
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
  // Authentication & Profile APIs
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await safeFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await safeFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.user);
    }
    return res;
  },

  async getMe(): Promise<{ user: StudentUser | null }> {
    const cached = authStorage.getUser();
    const token = authStorage.getToken();

    if (!token) {
      return { user: cached || null };
    }

    try {
      const res = await safeFetch<{ user: StudentUser }>('/auth/me', {
        method: 'GET',
      });
      if (res.user) {
        authStorage.setUser(res.user);
      }
      return res;
    } catch {
      return { user: cached || null };
    }
  },

  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string; user: StudentUser }> {
    const res = await safeFetch<{ message: string; user: StudentUser }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res.user) {
      authStorage.setUser(res.user);
    }
    return res;
  },

  logout(): void {
    authStorage.clearAuth();
  },

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
    return safeFetch<{ status: string; mode: string; database?: { supabase?: string; mongoDb?: string }; integrations: Record<string, boolean> }>('/health', {
      method: 'GET',
    });
  },

  // Azure AI Diagnostics API
  async getAzureDiagnostics() {
    return safeFetch<{
      timestamp: string;
      overallMode: string;
      services: {
        azureOpenAI: { configured: boolean; status: string; message: string; deployment?: string; endpoint?: string };
        azureSearch: { configured: boolean; status: string; message: string; indexName?: string };
        azureSpeech: { configured: boolean; status: string; message: string; region?: string };
        azureVision: { configured: boolean; status: string; message: string };
      };
    }>('/azure/diagnostics', {
      method: 'GET',
    });
  },

  // Audio Text-To-Speech from Azure Speech (with browser fallback)
  async playQuestionSpeech(text: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/azure/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const blob = await res.blob();
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        await audio.play();
        return true;
      }
    } catch (err) {
      console.warn('Azure TTS playback failed, falling back to browser speech synthesis:', err);
    }

    // Fallback to browser SpeechSynthesis if Azure TTS is not configured
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
      return true;
    }
    return false;
  }
};

