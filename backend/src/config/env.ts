import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Helper to normalize endpoints and remove trailing slashes
const cleanUrl = (url?: string): string => {
  if (!url) return '';
  return url.trim().replace(/[/?]+$/, '');
};

// Prioritize loading .env from backend folder, then root
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '../.env'),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config(); // fallback

const hasAzureKey = !!(process.env.AZURE_OPENAI_API_KEY || process.env.AZURE_API_KEY);
const explicitMock = process.env.USE_MOCK_AI;
const useMockAI = explicitMock !== undefined ? explicitMock === 'true' : !hasAzureKey;

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: cleanUrl(process.env.FRONTEND_URL) || 'http://localhost:3000',
  useMockAI,
  supabase: {
    url: cleanUrl(process.env.SUPABASE_URL),
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
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

