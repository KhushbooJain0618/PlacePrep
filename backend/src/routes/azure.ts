import { Router, Request, Response } from 'express';
import { config } from '../config/env.js';
import { speechService } from '../services/speechService.js';

export const azureRouter = Router();

/**
 * GET /api/azure/diagnostics
 * Actively checks the status and reachability of all configured Azure AI resources.
 */
azureRouter.get('/diagnostics', async (req: Request, res: Response) => {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    overallMode: config.useMockAI ? 'Development Mock Mode (USE_MOCK_AI=true)' : 'Azure Production Mode',
    services: {}
  };

  // 1. Check Azure OpenAI / Foundry
  const hasOpenAI = !!(config.azure.openai.endpoint && config.azure.openai.apiKey);
  const hasFoundry = !!(config.azure.foundry.projectEndpoint && config.azure.foundry.apiKey);

  if (hasOpenAI) {
    try {
      const pingUrl = `${config.azure.openai.endpoint}/openai/deployments/${config.azure.openai.deploymentName}/chat/completions?api-version=${config.azure.openai.apiVersion}`;
      const pingRes = await fetch(pingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': config.azure.openai.apiKey
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 2
        })
      });

      if (pingRes.ok) {
        results.services.azureOpenAI = {
          configured: true,
          status: 'connected',
          deployment: config.azure.openai.deploymentName,
          endpoint: config.azure.openai.endpoint,
          message: 'Azure OpenAI is active and responding to chat requests.'
        };
      } else {
        const err = await pingRes.text().catch(() => '');
        results.services.azureOpenAI = {
          configured: true,
          status: 'error',
          httpStatus: pingRes.status,
          message: `Endpoint returned error: ${err.substring(0, 150)}`
        };
      }
    } catch (e: any) {
      results.services.azureOpenAI = {
        configured: true,
        status: 'error',
        message: e.message || 'Failed to connect to Azure OpenAI endpoint.'
      };
    }
  } else if (hasFoundry) {
    results.services.azureOpenAI = {
      configured: true,
      status: 'configured',
      endpoint: config.azure.foundry.projectEndpoint,
      message: 'Microsoft AI Foundry project endpoint is configured.'
    };
  } else {
    results.services.azureOpenAI = {
      configured: false,
      status: 'not_configured',
      message: 'AZURE_OPENAI_API_KEY is not set in backend/.env. Using mock AI response engine.'
    };
  }

  // 2. Check Azure AI Search
  if (config.azure.search.endpoint && config.azure.search.apiKey) {
    try {
      const searchUrl = `${config.azure.search.endpoint}/indexes/${config.azure.search.indexName}?api-version=2023-11-01`;
      const searchRes = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'api-key': config.azure.search.apiKey
        }
      });

      if (searchRes.ok) {
        results.services.azureSearch = {
          configured: true,
          status: 'connected',
          indexName: config.azure.search.indexName,
          message: `Index '${config.azure.search.indexName}' found and reachable.`
        };
      } else if (searchRes.status === 404) {
        results.services.azureSearch = {
          configured: true,
          status: 'index_missing',
          indexName: config.azure.search.indexName,
          message: `Search service reachable, but index '${config.azure.search.indexName}' does not exist yet. Run 'npm run seed:azure-search' in backend.`
        };
      } else {
        const err = await searchRes.text().catch(() => '');
        results.services.azureSearch = {
          configured: true,
          status: 'error',
          httpStatus: searchRes.status,
          message: err.substring(0, 150)
        };
      }
    } catch (e: any) {
      results.services.azureSearch = {
        configured: true,
        status: 'error',
        message: e.message || 'Failed to connect to Azure Search endpoint.'
      };
    }
  } else {
    results.services.azureSearch = {
      configured: false,
      status: 'not_configured',
      message: 'AZURE_SEARCH_API_KEY is not set. Using local knowledge base grounding.'
    };
  }

  // 3. Check Azure AI Speech
  if (config.azure.speech.key && config.azure.speech.region) {
    const tokenResult = await speechService.issueToken();
    if (tokenResult) {
      results.services.azureSpeech = {
        configured: true,
        status: 'connected',
        region: config.azure.speech.region,
        message: 'Azure Speech token issued successfully.'
      };
    } else {
      results.services.azureSpeech = {
        configured: true,
        status: 'error',
        message: 'Failed to issue speech token. Please verify AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in backend/.env.'
      };
    }
  } else {
    results.services.azureSpeech = {
      configured: false,
      status: 'not_configured',
      message: 'AZURE_SPEECH_KEY not set. Using browser Web Speech API.'
    };
  }

  // 4. Check Azure AI Vision
  results.services.azureVision = {
    configured: !!(config.azure.vision.endpoint && config.azure.vision.key),
    status: config.azure.vision.key ? 'configured' : 'not_configured',
    message: config.azure.vision.key
      ? 'Vision credentials configured. Operational presence telemetry active.'
      : 'Using browser presence and framing telemetry.'
  };

  return res.json(results);
});

/**
 * GET /api/azure/speech-token
 * Issues an ephemeral speech authentication token for frontend streaming.
 */
azureRouter.get('/speech-token', async (req: Request, res: Response) => {
  const result = await speechService.issueToken();
  if (!result) {
    return res.status(503).json({
      error: true,
      message: 'Azure AI Speech is not configured or token generation failed.'
    });
  }
  return res.json(result);
});

/**
 * POST /api/azure/tts
 * Synthesizes text into high quality MP3 audio stream using Azure Neural TTS.
 */
azureRouter.post('/tts', async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: true, message: 'Text is required for speech synthesis.' });
  }

  const audioBuffer = await speechService.synthesizeSpeech(text);
  if (!audioBuffer) {
    return res.status(503).json({
      error: true,
      message: 'Azure Speech TTS is not configured or synthesis failed.'
    });
  }

  res.set({
    'Content-Type': 'audio/mpeg',
    'Content-Length': audioBuffer.length.toString(),
    'Cache-Control': 'public, max-age=3600'
  });

  return res.send(audioBuffer);
});
