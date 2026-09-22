import fs from 'fs';
import path from 'path';

// Helper to normalize endpoints and remove trailing slashes
const cleanUrl = (url?: string): string => {
  if (!url) return '';
  return url.trim().replace(/[/?]+$/, '');
};

// Next.js loads .env and .env.local automatically into process.env.
// In addition, if backend/.env exists, read any missing values for seamless local dev transition.
if (typeof window === 'undefined') {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../backend/.env'),
    path.resolve(process.cwd(), 'backend/.env'),
    path.resolve(process.cwd(), '../.env'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const content = fs.readFileSync(p, 'utf-8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key] && val) {
              process.env[key] = val;
            }
          }
        }
      } catch {
        // Ignore read errors
      }
    }
  }
}

const hasAzureKey = !!(process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_API_KEY);
const explicitMock = process.env.USE_MOCK_AI;
const useMockAI = explicitMock !== undefined ? explicitMock === 'true' : !hasAzureKey;

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: cleanUrl(process.env.FRONTEND_URL) || 'http://localhost:3000',
  useMockAI,
  supabase: {
    url: cleanUrl(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  jwtSecret: process.env.JWT_SECRET || 'placeprep-dev-secret-key-2026',

  azure: {
    openai: {
      endpoint: cleanUrl(process.env.AZURE_OPENAI_ENDPOINT),
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
    },
    foundry: {
      projectEndpoint: cleanUrl(process.env.AZURE_PROJECT_ENDPOINT),
      agentEndpoint: cleanUrl(process.env.AZURE_AGENT_ENDPOINT),
      agentId: process.env.AZURE_AGENT_ID || '',
      apiKey: process.env.AZURE_API_KEY || '',
    },
    search: {
      endpoint: cleanUrl(process.env.AZURE_SEARCH_ENDPOINT),
      apiKey: process.env.AZURE_SEARCH_API_KEY || '',
      indexName: process.env.AZURE_SEARCH_INDEX_NAME || 'placement-knowledge-index',
    },
    speech: {
      key: process.env.AZURE_SPEECH_KEY || '',
      region: process.env.AZURE_SPEECH_REGION || 'uaenorth',
      endpoint: cleanUrl(process.env.AZURE_SPEECH_ENDPOINT),
      voiceName: process.env.AZURE_SPEECH_VOICE || 'en-US-JennyNeural',
    },
    vision: {
      endpoint: cleanUrl(process.env.AZURE_VISION_ENDPOINT),
      key: process.env.AZURE_VISION_KEY || '',
    }
  }
};
