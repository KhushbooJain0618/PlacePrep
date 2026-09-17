import { config } from '../config/env.js';
import { searchService, SearchResult } from './searchService.js';
import { chatbotClassifier } from './chatbotClassifier.js';
import { mockResponseGenerator } from './mockResponseGenerator.js';

export class AIService {
  /**
   * Generates a grounded response for placement preparation queries.
   */
  async generateChatResponse(message: string, history?: { role: 'user' | 'assistant'; content: string }[]): Promise<{ answer: string; sources: string[] }> {
    // 1. Retrieve grounded placement knowledge via RAG
    const sources = await searchService.searchKnowledgeBase(message);
    const sourceTitles = sources.map(s => s.title);

    // 2. Azure OpenAI / Microsoft Foundry integration
    if (!config.useMockAI && config.azure.openai.endpoint && config.azure.openai.apiKey) {
      try {
        const deployment = config.azure.openai.deploymentName;
        const apiVersion = '2024-02-01';
        const url = `${config.azure.openai.endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

        const groundingContext = sources.map(s => `[Source: ${s.title}]\n${s.snippet}`).join('\n\n');
        const systemPrompt = `You are PlacePrep AI, an expert Campus Placement Preparation Assistant for college students.
Ground your answers in placement interview reality (DSA, System Design, DBMS, OOP, CS Fundamentals).
Use clear formatting, code snippets where appropriate, and cite relevant concepts.
Grounding references:\n${groundingContext}`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...(history || []).slice(-4),
          { role: 'user', content: message }
        ];

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': config.azure.openai.apiKey
          },
          body: JSON.stringify({
            messages,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (res.ok) {
          const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return {
              answer: reply,
              sources: sourceTitles.length > 0 ? sourceTitles : ['Placement Preparation Guide']
            };
          }
        }
      } catch (err) {
        console.warn('Azure OpenAI call failed, falling back to mock response generator:', err);
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

