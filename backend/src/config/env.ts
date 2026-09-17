import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory or backend directory
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config(); // fallback to local directory

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  useMockAI: process.env.USE_MOCK_AI === 'true' || !process.env.AZURE_OPENAI_API_KEY,

  azure: {
    openai: {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o',
    },
    foundry: {
      projectEndpoint: process.env.AZURE_PROJECT_ENDPOINT || '',
      apiKey: process.env.AZURE_API_KEY || '',
    },
    search: {
      endpoint: process.env.AZURE_SEARCH_ENDPOINT || '',
      apiKey: process.env.AZURE_SEARCH_API_KEY || '',
      indexName: process.env.AZURE_SEARCH_INDEX_NAME || 'placement-knowledge-index',
    },
    speech: {
      key: process.env.AZURE_SPEECH_KEY || '',
      region: process.env.AZURE_SPEECH_REGION || 'eastus',
    },
    vision: {
      endpoint: process.env.AZURE_VISION_ENDPOINT || '',
      key: process.env.AZURE_VISION_KEY || '',
    }
  }
};
