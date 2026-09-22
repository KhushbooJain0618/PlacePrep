import { config } from '../config/env';
import { searchService, SearchResult } from './searchService';
import { chatbotClassifier } from './chatbotClassifier';
import { mockResponseGenerator } from './mockResponseGenerator';

export class AIService {
  /**
   * Helper to execute completions against Azure OpenAI or Microsoft Foundry.
   */
  async completePrompt(messages: { role: 'system' | 'user' | 'assistant'; content: string }[], options: { maxTokens?: number; temperature?: number } = {}): Promise<string | null> {
    if (config.useMockAI) return null;

    let url = '';
    let apiKey = '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (config.azure.foundry.agentEndpoint && config.azure.foundry.apiKey) {
      url = `${config.azure.foundry.agentEndpoint}?api-version=v1`;
      apiKey = config.azure.foundry.apiKey;
      headers['api-key'] = apiKey;

      const promptText = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({ input: promptText })
        });

        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          console.error(`[Azure AI Agent Error] HTTP ${res.status}: ${errorText}`);
          return null;
        }

        const data = await res.json() as any;
        return data.output?.[0]?.content?.[0]?.text || null;
      } catch (err) {
        console.error('[Azure AI Agent Call Failed]:', err);
        return null;
      }
    } else if (config.azure.openai.endpoint && config.azure.openai.apiKey && !config.azure.openai.endpoint.includes('services.ai.azure.com')) {
      url = `${config.azure.openai.endpoint}/openai/deployments/${config.azure.openai.deploymentName}/chat/completions?api-version=${config.azure.openai.apiVersion}`;
      apiKey = config.azure.openai.apiKey;
      headers['api-key'] = apiKey;
    } else if (config.azure.foundry.projectEndpoint && config.azure.foundry.apiKey) {
      url = `${config.azure.foundry.projectEndpoint}/models/chat/completions?api-version=2024-05-01-preview`;
      apiKey = config.azure.foundry.apiKey;
      headers['api-key'] = apiKey;
    } else {
      return null;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 800
        })
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        console.error(`[Azure AI API Error] HTTP ${res.status} (${res.statusText}): ${errorText}`);
        return null;
      }

      const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
      return data.choices?.[0]?.message?.content || null;
    } catch (err) {
      console.error('[Azure AI Call Failed]:', err);
      return null;
    }
  }

  /**
   * Generates a grounded response for placement preparation queries.
   */
  async generateChatResponse(message: string, history?: { role: 'user' | 'assistant'; content: string }[]): Promise<{ answer: string; sources: string[] }> {
    // 1. Retrieve grounded placement knowledge via RAG
    const sources = await searchService.searchKnowledgeBase(message);
    const sourceTitles = sources.map(s => s.title);

    // 2. Azure OpenAI / Microsoft Foundry integration
    if (!config.useMockAI) {
      const groundingContext = sources.map(s => `[Source: ${s.title}]\n${s.snippet}`).join('\n\n');
      const systemPrompt = `You are PlacePrep AI, an expert Campus Placement Preparation Assistant for college students.
Ground your answers in placement interview reality (DSA, System Design, DBMS, OOP, CS Fundamentals).
Use clear formatting, code snippets where appropriate, and cite relevant concepts.
Grounding references:\n${groundingContext}`;

      const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemPrompt },
        ...(history || []).slice(-4),
        { role: 'user', content: message }
      ];

      const reply = await this.completePrompt(messages, { temperature: 0.7, maxTokens: 800 });
      if (reply) {
        return {
          answer: reply,
          sources: sourceTitles.length > 0 ? sourceTitles : ['Placement Preparation Guide']
        };
      }
    }


    // 3. Mock AI Mode: Intent & Topic-aware Placement Assistant Engine
    const classifiedQuery = chatbotClassifier.classify(message);
    const answer = mockResponseGenerator.generateResponse(classifiedQuery, sources);

    // Provide authentic sources based on actual retrieved documents or detected topic
    let finalSources: string[] = [];
    if (classifiedQuery.topic === 'GREETING') {
      finalSources = [];
    } else if (sourceTitles.length > 0) {
      finalSources = Array.from(new Set(sourceTitles));
    } else {
      switch (classifiedQuery.topic) {
        case 'CNDC_NETWORKS':
          finalSources = ['Computer Networks & CNDC Guide'];
          break;
        case 'OPERATING_SYSTEMS':
          finalSources = ['Operating Systems Guide'];
          break;
        case 'DBMS_SQL':
          finalSources = ['DBMS & SQL Placement Guide'];
          break;
        case 'DSA':
          finalSources = ['DSA Curriculum & Problem Solving Guide'];
          break;
        case 'OOP':
          finalSources = ['OOP & Design Principles Guide'];
          break;
        case 'SYSTEM_DESIGN':
          finalSources = ['System Design & Scalability Guide'];
          break;
        default:
          finalSources = ['Placement Preparation Guide'];
          break;
      }
    }

    return {
      answer,
      sources: finalSources
    };
  }
}

export const aiService = new AIService();

