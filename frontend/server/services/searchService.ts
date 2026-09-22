import fs from 'fs';
import path from 'path';
import { config } from '../config/env';

export interface SearchResult {
  title: string;
  source: string;
  snippet: string;
  score: number;
}

export class SearchService {
  private knowledgeBasePath: string;

  constructor() {
    const candidates = [
      path.resolve(process.cwd(), '../knowledge-base'),
      path.resolve(process.cwd(), 'knowledge-base'),
      path.resolve(process.cwd(), '../../knowledge-base'),
    ];
    this.knowledgeBasePath = candidates.find(c => fs.existsSync(c)) || candidates[0];
  }

  /**
   * Performs hybrid search grounded against curated placement materials.
   * In production with Azure, calls Azure AI Search REST API or SDK.
   * In Mock Mode, scans local curated knowledge documents.
   */
  async searchKnowledgeBase(query: string): Promise<SearchResult[]> {
    if (!config.useMockAI && config.azure.search.endpoint && config.azure.search.apiKey) {
      try {
        // Integration for Azure AI Search
        const searchUrl = `${config.azure.search.endpoint}/indexes/${config.azure.search.indexName}/docs/search?api-version=2023-11-01`;
        const response = await fetch(searchUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': config.azure.search.apiKey
          },
          body: JSON.stringify({
            search: query,
            top: 3
          })
        });

        if (response.ok) {
          const data = await response.json() as { value?: Array<{ title?: string; source?: string; content?: string; chunk?: string; '@search.score'?: number }> };
          if (data.value && data.value.length > 0) {
            return data.value.map(item => ({
              title: item.title || 'Placement Guide',
              source: item.source || item.title || 'Azure AI Search Index',
              snippet: (item.chunk || item.content || '').substring(0, 300),
              score: item['@search.score'] || 0.9
            }));
          }
        }

      } catch (err) {
        console.warn('Azure AI Search query failed, falling back to local knowledge base:', err);
      }
    }

    // Mock Mode / Local Grounded Search
    return this.searchLocalKnowledge(query);
  }

  private getFormattedGuideTitle(fileName: string): string {
    const titleMap: Record<string, string> = {
      'computer-networks-guide.md': 'Computer Networks & CNDC Guide',
      'operating-systems-guide.md': 'Operating Systems Guide',
      'dbms-sql-guide.md': 'DBMS & SQL Placement Guide',
      'dsa-curriculum.md': 'DSA Curriculum & Problem Solving Guide',
      'oop-design-principles.md': 'OOP & Design Principles Guide'
    };
    return titleMap[fileName] || fileName.replace('.md', '').replace(/-/g, ' ').toUpperCase();
  }

  private searchLocalKnowledge(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Stop words to avoid false positive keyword matches across all placement guides
    const stopWords = new Set([
      'want', 'prepare', 'preparation', 'campus', 'placement', 'placements',
      'tell', 'exactly', 'should', 'start', 'what', 'topics', 'topic',
      'study', 'order', 'give', 'plan', 'about', 'with', 'then', 'some',
      'into', 'need', 'please', 'explain', 'simple', 'terms', 'terms.',
      'terms,', 'real', 'world', 'interview', 'questions', 'question',
      'difference', 'between', 'based', 'from', 'this', 'that', 'have',
      'been', 'will', 'would', 'could', 'does', 'more', 'most', 'very',
      'help', 'know', 'also', 'hello', 'good', 'morning'
    ]);

    // Handle pure greetings
    if (/^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(lowerQuery.trim())) {
      return [];
    }

    const queryTokens = lowerQuery
      .replace(/[^a-z0-9+#\-\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && !stopWords.has(w));

    // Define topic file affinity
    const fileAffinities: { file: string; keywords: string[] }[] = [
      {
        file: 'computer-networks-guide.md',
        keywords: ['cndc', 'network', 'networks', 'networking', 'osi', 'tcp', 'udp', 'ip', 'ipv4', 'ipv6', 'subnet', 'subnetting', 'routing', 'dns', 'http', 'https', 'tls', 'ssl', 'mac', 'arp', 'port', 'packet', 'socket']
      },
      {
        file: 'operating-systems-guide.md',
        keywords: ['os', 'operating', 'process', 'processes', 'thread', 'threads', 'deadlock', 'deadlocks', 'paging', 'virtual', 'memory', 'semaphore', 'semaphores', 'mutex', 'scheduling', 'cpu', 'tlb', 'pcb', 'fork', 'syscall']
      },
      {
        file: 'dbms-sql-guide.md',
        keywords: ['dbms', 'sql', 'database', 'databases', 'acid', 'normalization', 'join', 'joins', 'b-tree', 'b+ tree', 'indexing', 'transaction', 'transactions', '1nf', '2nf', '3nf', 'bcnf', 'query', 'queries']
      },
      {
        file: 'dsa-curriculum.md',
        keywords: ['dsa', 'algorithm', 'algorithms', 'binary search', 'search', 'array', 'arrays', 'linked list', 'tree', 'trees', 'bst', 'graph', 'graphs', 'dp', 'dynamic programming', 'complexity', 'sliding window', 'two pointers', 'stack', 'queue', 'heap']
      },
      {
        file: 'oop-design-principles.md',
        keywords: ['oop', 'object', 'encapsulation', 'abstraction', 'inheritance', 'polymorphism', 'solid', 'class', 'classes', 'interface', 'overloading', 'overriding']
      }
    ];

    try {
      if (fs.existsSync(this.knowledgeBasePath)) {
        const availableFiles = fs.readdirSync(this.knowledgeBasePath).filter(f => f.endsWith('.md') && f !== 'README.md');

        const scoredDocs: { file: string; score: number; bestSnippet: string }[] = [];

        for (const file of availableFiles) {
          const fullPath = path.join(this.knowledgeBasePath, file);
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lowerContent = content.toLowerCase();

          let fileScore = 0;

          // Affinity boost
          const affinity = fileAffinities.find(a => a.file === file);
          if (affinity) {
            for (const kw of affinity.keywords) {
              if (lowerQuery.includes(kw)) {
                fileScore += 4;
              }
            }
          }

          // Token matches in content
          for (const token of queryTokens) {
            if (lowerContent.includes(token)) {
              fileScore += 1;
            }
          }

          if (fileScore > 0) {
            // Find most relevant paragraph
            const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 30);
            let bestPara = paragraphs[0] || '';
            let maxParaScore = -1;

            for (const para of paragraphs) {
              const lowerPara = para.toLowerCase();
              let pScore = 0;
              for (const token of queryTokens) {
                if (lowerPara.includes(token)) pScore += 1;
              }
              if (affinity) {
                for (const kw of affinity.keywords) {
                  if (lowerPara.includes(kw)) pScore += 2;
                }
              }
              if (pScore > maxParaScore) {
                maxParaScore = pScore;
                bestPara = para;
              }
            }

            scoredDocs.push({
              file,
              score: fileScore,
              bestSnippet: bestPara.replace(/^[#*-\s]+/, '').substring(0, 200) + '...'
            });
          }
        }

        // Sort descending by score
        scoredDocs.sort((a, b) => b.score - a.score);

        for (const doc of scoredDocs.slice(0, 2)) {
          results.push({
            title: this.getFormattedGuideTitle(doc.file),
            source: doc.file,
            snippet: doc.bestSnippet,
            score: Math.min(0.98, 0.7 + doc.score * 0.05)
          });
        }
      }
    } catch (err) {
      console.warn('Error accessing local knowledge base:', err);
    }

    // Default fallback only if genuinely asking general placement questions
    if (results.length === 0) {
      if (lowerQuery.includes('placement') || lowerQuery.includes('interview') || lowerQuery.includes('prepare')) {
        results.push({
          title: 'Placement Preparation Guide',
          source: 'curated-placement-guide',
          snippet: 'Comprehensive campus placement strategy across Coding Rounds (OA), Core CS Fundamentals, Technical Interviews, and HR rounds.',
          score: 0.85
        });
      }
    }

    return results;
  }

}

export const searchService = new SearchService();
