export type ChatbotTopic =
  | 'CNDC_NETWORKS'
  | 'OPERATING_SYSTEMS'
  | 'DBMS_SQL'
  | 'DSA'
  | 'OOP'
  | 'SYSTEM_DESIGN'
  | 'GENERAL_PLACEMENT'
  | 'GREETING'
  | 'UNKNOWN';

export type ChatbotSubTopic =
  | 'OSI_MODEL'
  | 'TCP_VS_UDP'
  | 'BINARY_SEARCH'
  | 'ARRAY_VS_LINKED_LIST'
  | 'SQL_JOINS'
  | 'ACID_PROPERTIES'
  | 'NORMALIZATION'
  | 'SOLID_PRINCIPLES'
  | 'PROCESS_VS_THREAD'
  | 'DEADLOCKS'
  | 'PAGING_VIRTUAL_MEMORY'
  | 'TWO_POINTERS'
  | 'DYNAMIC_PROGRAMMING';

export type ChatbotIntent =
  | 'GREETING'
  | 'STUDY_PLAN'
  | 'INTERVIEW_QUESTIONS'
  | 'COMPARISON'
  | 'CONCEPT_EXPLANATION'
  | 'CODE_IMPLEMENTATION'
  | 'COMPLEXITY_ANALYSIS'
  | 'TOPIC_PREPARATION'
  | 'GENERAL_PREPARATION'
  | 'FALLBACK';

export interface FormatConstraints {
  wantsTable: boolean;
  wantsExample: boolean;
  wantsSimple: boolean;
  wantsOrder: boolean;
  wantsCode: boolean;
  wantsComplexity: boolean;
  questionCount: number;
  planDays: number;
  targetCompany?: string;
  programmingLanguage?: string;
}

export interface ClassifiedQuery {
  rawQuery: string;
  normalizedQuery: string;
  topic: ChatbotTopic;
  subTopics: ChatbotSubTopic[];
  intent: ChatbotIntent;
  constraints: FormatConstraints;
  isSecurityRisk: boolean;
}

/**
 * Compiled regular expressions for the PlacePrep AI Chatbot
 */
export const CHATBOT_REGEX = {
  // Input Sanitization & Security
  CONTROL_CHARS: /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g,
  WHITESPACE_COLLAPSE: /\s+/g,
  PROMPT_INJECTION: /\b(?:ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions|system\s+prompt|reveal\s+(?:your\s+)?instructions|override\s+system\s+rules?)\b/i,

  // Greetings & Conversational
  GREETING: /^(?:hi|hello|hey|greetings|good\s+(?:morning|afternoon|evening)|sup|howdy|namaste)\b/i,

  // Question Extraction (e.g. "ask me 5 questions", "3 placement interview questions", "top 10 questions")
  QUESTION_COUNT: /(?:(?:give|ask|show|list|top|provide)\s+(?:me\s+)?)?(\d+)\s*(?:campus\s+)?(?:placement\s+)?(?:interview\s+|technical\s+)?questions?/i,

  // Study Plan & Roadmap Extraction (e.g. "7-day plan", "30 days roadmap", "2 weeks schedule", "1 month plan")
  PLAN_DAYS: /(\d+)[-\s]*(day|days|week|weeks|month|months)\s*(?:study\s+)?(?:plan|roadmap|schedule|crash\s*course|prep)/i,

  // Campus Hiring Companies (MAANG, Tier-1, and Mass Recruiters)
  COMPANIES: /\b(google|amazon|microsoft|meta|apple|netflix|uber|adobe|atlassian|salesforce|goldman\s+sachs|morgan\s+stanley|jpmorgan|cisco|oracle|walmart|tcs|infosys|wipro|cognizant|accenture|capgemini|hcl|tech\s+mahindra)\b/i,

  // Programming Languages
  LANGUAGES: /\b(python3?|java(?:script)?|typescript|c\+\+|cpp|c#|golang|go|rust|sql|c)\b/i,

  // Format & Content Preferences
  FORMAT_TABLE: /\b(table|tabular|comparison\s+table|matrix|side\s+by\s+side|columns?)\b/i,
  FORMAT_EXAMPLE: /\b(example[s]?|real[-\s]world|practical\s+example|analogy|use[-\s]case[s]?)\b/i,
  FORMAT_SIMPLE: /\b(simple\s+terms?|simply|simple|easy\s+to\s+understand|layman|beginner\s+friendly|eli5|explain\s+like\s+i'm\s+5|in\s+plain\s+english)\b/i,
  FORMAT_ORDER: /\b(order|in\s+order|topics\s+in\s+order|step\s*by\s*step|road\s*map|where\s+to\s+start|how\s+should\s+i\s+start|how\s+to\s+start|prerequisites?)\b/i,
  FORMAT_CODE: /\b(code|implementation|implement|write\s+(?:a\s+)?(?:[a-z+#]+\s+)?(?:code|function|program|solution|class)|solve\s+in\s+[a-z+#]+|sample\s+code|syntax)\b/i,
  FORMAT_COMPLEXITY: /\b(time\s+complexity|space\s+complexity|big\s*o|complexity\s+analysis|runtime|asymptotic|o\([n1klog\s*]+\))\b/i,

  // Core Subject Topics
  TOPIC_CNDC: /\b(cndc|computer\s+networks?|data\s+communication|networking|osi(?:\s*model)?|tcp(?:\s*vs\s*udp)?|udp|ip\s+address(?:ing)?|subnet(?:ting)?|cidr|routing|dns|http|https|tls|ssl|mac\s+address|arp|sockets?|3-way\s+handshake|three-way\s+handshake)\b/i,
  TOPIC_OS: /\b(operating\s+systems?|\bos\b|process(?:es)?|threads?|deadlocks?|paging|virtual\s+memory|page\s+fault|semaphore[s]?|mutex|cpu\s+scheduling|round\s+robin|system\s+calls?|context\s+switch(?:ing)?|concurrency|ipc)\b/i,
  TOPIC_DBMS: /\b(dbms|database[s]?|sql|acid|normalization|1nf|2nf|3nf|bcnf|indexing|b\+?\s*tree[s]?|transactions?|joins?|foreign\s+key|stored\s+procedure|rdbms|nosql|mongodb|query\s+optimization)\b/i,
  TOPIC_DSA: /\b(dsa|data\s+structures?|algorithms?|binary\s+search|arrays?|linked\s+lists?|trees?|bst|graphs?|dynamic\s+programming|\bdp\b|sliding\s+window|two\s+pointers?|fast\s+and\s+slow\s+pointers?|stacks?|queues?|heaps?|trie|sorting|merge\s*sort|quick\s*sort|recursion|backtracking|greedy|bit\s+manipulation)\b/i,
  TOPIC_OOP: /\b(oop|object\s+oriented|encapsulation|polymorphism|inheritance|abstraction|solid(?:\s*principles)?|interfaces?|abstract\s+class(?:es)?|method\s+overload(?:ing)?|method\s+overrid(?:ing)?|design\s+patterns?)\b/i,
  TOPIC_SYSTEM_DESIGN: /\b(system\s+design|hld|lld|high\s+level\s+design|low\s+level\s+design|load\s+balancer[s]?|caching|redis|message\s+queues?|kafka|rabbitmq|microservices?|scalability|cdn|sharding)\b/i,
  TOPIC_GENERAL_PLACEMENT: /\b(placement[s]?|campus\s+placement|campus\s+hiring|campus\s+recruitment|interview\s+prep|fresher\s+prep|how\s+should\s+i\s+prepare\s+for\s+placements|placement\s+strategy)\b/i,

  // Technical Subtopics
  SUB_OSI: /\b(osi|osi\s+model|7\s+layers)\b/i,
  SUB_TCP_UDP: /\b(tcp\s+(?:vs|and|\/)\s*udp|udp\s+(?:vs|and|\/)\s*tcp|tcp|udp)\b/i,
  SUB_BINARY_SEARCH: /\b(binary\s+search|search\s+in\s+rotated\s+sorted\s+array)\b/i,
  SUB_ARRAY_LINKED_LIST: /\b(array\s+(?:vs|and|\/)\s*linked\s*list|linked\s*list\s+(?:vs|and|\/)\s*array)\b/i,
  SUB_SQL_JOINS: /\b(joins?|inner\s+join|left\s+join|right\s+join|full\s+outer\s+join|cross\s+join)\b/i,
  SUB_ACID: /\b(acid|acid\s+properties|atomicity|consistency|isolation|durability)\b/i,
  SUB_NORMALIZATION: /\b(normalization|1nf|2nf|3nf|bcnf|normal\s+forms)\b/i,
  SUB_SOLID: /\b(solid|solid\s+principles|single\s+responsibility|open\s+closed|liskov|interface\s+segregation|dependency\s+inversion)\b/i,
  SUB_PROCESS_THREAD: /\b(process\s+(?:vs|and|\/)\s*thread|thread\s+(?:vs|and|\/)\s*process|pcb|context\s+switch)\b/i,
  SUB_DEADLOCKS: /\b(deadlock|deadlocks|coffman|banker'?s\s+algorithm)\b/i,
  SUB_PAGING: /\b(paging|virtual\s+memory|page\s+fault|tlb|page\s+replacement)\b/i,
  SUB_TWO_POINTERS: /\b(two\s+pointers?|sliding\s+window|fast\s+and\s+slow\s+pointers?)\b/i,
  SUB_DYNAMIC_PROGRAMMING: /\b(dynamic\s+programming|\bdp\b|memoization|tabulation|knapsack|lcs|lis)\b/i,

  // Intents
  INTENT_STUDY_PLAN: /\b(study\s+plan|preparation\s+plan|roadmap|schedule|timeline|crash\s+course)\b/i,
  INTENT_QUESTIONS: /\b(interview\s+questions?|placement\s+questions?|ask\s+me\s+questions?|quiz\s+me|practice\s+questions?|frequently\s+asked\s+questions?)\b/i,
  INTENT_COMPARISON: /\b(difference\s+between|compare|comparison|versus|\bvs\b|diff\s+between|trade[-\s]offs?|pros\s+and\s+cons)\b/i,
  INTENT_PREPARATION: /\b(how\s+should\s+i\s+prepare|how\s+to\s+prepare|prepare\s+for|strategy\s+for)\b/i,
  INTENT_EXPLANATION: /\b(explain|what\s+is|what\s+are|how\s+does|define|overview|describe|demystify)\b/i,
};

export class ChatbotClassifier {
  /**
   * Sanitizes input string using regex by removing control characters and collapsing whitespace.
   */
  sanitize(query: string): string {
    if (!query) return '';
    return query
      .replace(CHATBOT_REGEX.CONTROL_CHARS, '')
      .replace(CHATBOT_REGEX.WHITESPACE_COLLAPSE, ' ')
      .trim();
  }

  /**
   * Detects prompt injection attempts via regex.
   */
  detectSecurityRisk(query: string): boolean {
    return CHATBOT_REGEX.PROMPT_INJECTION.test(query);
  }

  /**
   * Classifies a user's chat message using compiled regular expressions.
   */
  classify(query: string): ClassifiedQuery {
    const rawQuery = this.sanitize(query);
    const q = rawQuery.toLowerCase();
    const isSecurityRisk = this.detectSecurityRisk(q);

    // 1. Detect Greeting
    const isPureGreeting = CHATBOT_REGEX.GREETING.test(q) && q.split(/\s+/).length <= 4;
    if (isPureGreeting) {
      return {
        rawQuery,
        normalizedQuery: q,
        topic: 'GREETING',
        subTopics: [],
        intent: 'GREETING',
        constraints: this.extractConstraints(q),
        isSecurityRisk: false
      };
    }

    // 2. Extract Constraints & Metadata
    const constraints = this.extractConstraints(q);

    // 3. Detect Topic & Subtopics
    const { topic, subTopics } = this.detectTopicAndSubtopics(q);

    // 4. Detect Intent
    const intent = this.detectIntent(q, topic, constraints);

    return {
      rawQuery,
      normalizedQuery: q,
      topic,
      subTopics,
      intent,
      constraints,
      isSecurityRisk
    };
  }

  private extractConstraints(q: string): FormatConstraints {
    // Format preferences
    const wantsTable = CHATBOT_REGEX.FORMAT_TABLE.test(q);
    const wantsExample = CHATBOT_REGEX.FORMAT_EXAMPLE.test(q);
    const wantsSimple = CHATBOT_REGEX.FORMAT_SIMPLE.test(q);
    const wantsOrder = CHATBOT_REGEX.FORMAT_ORDER.test(q);
    const wantsCode = CHATBOT_REGEX.FORMAT_CODE.test(q);
    const wantsComplexity = CHATBOT_REGEX.FORMAT_COMPLEXITY.test(q);

    // Target company detection
    const companyMatch = q.match(CHATBOT_REGEX.COMPANIES);
    const targetCompany = companyMatch ? companyMatch[1] : undefined;

    // Programming language detection
    const langMatch = q.match(CHATBOT_REGEX.LANGUAGES);
    const programmingLanguage = langMatch ? langMatch[1] : undefined;

    // Question count detection (e.g. "ask me 3 questions", "5 placement questions")
    let questionCount = 0;
    const questionMatch = q.match(CHATBOT_REGEX.QUESTION_COUNT);
    if (questionMatch && questionMatch[1]) {
      questionCount = parseInt(questionMatch[1], 10);
    } else if (/\b(?:ask\s+me|give\s+me)\b.*\bquestions?\b/i.test(q) || /\binterview\s+questions?\b/i.test(q)) {
      questionCount = 3; // sensible default when user asks for questions without specifying count
    }

    // Plan duration detection (e.g. "7-day study plan", "30 days", "2 weeks")
    let planDays = 7;
    const planMatch = q.match(CHATBOT_REGEX.PLAN_DAYS);
    if (planMatch && planMatch[1]) {
      const num = parseInt(planMatch[1], 10);
      const unit = planMatch[2]?.toLowerCase();
      if (unit.startsWith('week')) {
        planDays = num * 7;
      } else if (unit.startsWith('month')) {
        planDays = num * 30;
      } else {
        planDays = num;
      }
    }

    return {
      wantsTable,
      wantsExample,
      wantsSimple,
      wantsOrder,
      wantsCode,
      wantsComplexity,
      questionCount,
      planDays,
      targetCompany,
      programmingLanguage
    };
  }

  private detectTopicAndSubtopics(q: string): { topic: ChatbotTopic; subTopics: ChatbotSubTopic[] } {
    const subTopics: ChatbotSubTopic[] = [];

    // Subtopic regex matching
    if (CHATBOT_REGEX.SUB_OSI.test(q)) subTopics.push('OSI_MODEL');
    if (CHATBOT_REGEX.SUB_TCP_UDP.test(q)) subTopics.push('TCP_VS_UDP');
    if (CHATBOT_REGEX.SUB_BINARY_SEARCH.test(q)) subTopics.push('BINARY_SEARCH');
    if (CHATBOT_REGEX.SUB_ARRAY_LINKED_LIST.test(q)) subTopics.push('ARRAY_VS_LINKED_LIST');
    if (CHATBOT_REGEX.SUB_SQL_JOINS.test(q)) subTopics.push('SQL_JOINS');
    if (CHATBOT_REGEX.SUB_ACID.test(q)) subTopics.push('ACID_PROPERTIES');
    if (CHATBOT_REGEX.SUB_NORMALIZATION.test(q)) subTopics.push('NORMALIZATION');
    if (CHATBOT_REGEX.SUB_SOLID.test(q)) subTopics.push('SOLID_PRINCIPLES');
    if (CHATBOT_REGEX.SUB_PROCESS_THREAD.test(q)) subTopics.push('PROCESS_VS_THREAD');
    if (CHATBOT_REGEX.SUB_DEADLOCKS.test(q)) subTopics.push('DEADLOCKS');
    if (CHATBOT_REGEX.SUB_PAGING.test(q)) subTopics.push('PAGING_VIRTUAL_MEMORY');
    if (CHATBOT_REGEX.SUB_TWO_POINTERS.test(q)) subTopics.push('TWO_POINTERS');
    if (CHATBOT_REGEX.SUB_DYNAMIC_PROGRAMMING.test(q)) subTopics.push('DYNAMIC_PROGRAMMING');

    // Topic keywords detection
    const isCNDC = CHATBOT_REGEX.TOPIC_CNDC.test(q);
    const isOS = CHATBOT_REGEX.TOPIC_OS.test(q);
    const isDBMS = CHATBOT_REGEX.TOPIC_DBMS.test(q);
    const isDSA = CHATBOT_REGEX.TOPIC_DSA.test(q);
    const isOOP = CHATBOT_REGEX.TOPIC_OOP.test(q);
    const isSystemDesign = CHATBOT_REGEX.TOPIC_SYSTEM_DESIGN.test(q);

    // Resolve priority: domain topics take precedence
    if (isCNDC) return { topic: 'CNDC_NETWORKS', subTopics };
    if (isOS) return { topic: 'OPERATING_SYSTEMS', subTopics };
    if (isDBMS) return { topic: 'DBMS_SQL', subTopics };
    if (isDSA) return { topic: 'DSA', subTopics };
    if (isOOP) return { topic: 'OOP', subTopics };
    if (isSystemDesign) return { topic: 'SYSTEM_DESIGN', subTopics };

    // General placement prep query
    if (CHATBOT_REGEX.TOPIC_GENERAL_PLACEMENT.test(q)) {
      return { topic: 'GENERAL_PLACEMENT', subTopics };
    }

    return { topic: 'UNKNOWN', subTopics };
  }

  private detectIntent(q: string, topic: ChatbotTopic, constraints: FormatConstraints): ChatbotIntent {
    // 1. Study plan intent
    if (
      CHATBOT_REGEX.INTENT_STUDY_PLAN.test(q) ||
      (constraints.wantsOrder && /\b(start|topics?|how\s+should\s+i\s+start)\b/i.test(q))
    ) {
      return 'STUDY_PLAN';
    }

    // 2. Interview questions intent
    if (constraints.questionCount > 0 || CHATBOT_REGEX.INTENT_QUESTIONS.test(q)) {
      return 'INTERVIEW_QUESTIONS';
    }

    // 3. Comparison intent
    if (CHATBOT_REGEX.INTENT_COMPARISON.test(q) || constraints.wantsTable) {
      return 'COMPARISON';
    }

    // 4. Code Implementation intent
    if (constraints.wantsCode && topic !== 'UNKNOWN' && topic !== 'GENERAL_PLACEMENT') {
      return 'CODE_IMPLEMENTATION';
    }

    // 5. Complexity Analysis intent
    if (constraints.wantsComplexity && topic !== 'UNKNOWN' && topic !== 'GENERAL_PLACEMENT') {
      return 'COMPLEXITY_ANALYSIS';
    }

    // 6. Topic preparation intent
    if (
      CHATBOT_REGEX.INTENT_PREPARATION.test(q) &&
      topic !== 'GENERAL_PLACEMENT' &&
      topic !== 'UNKNOWN'
    ) {
      return 'TOPIC_PREPARATION';
    }

    // 7. Concept explanation intent
    if (
      CHATBOT_REGEX.INTENT_EXPLANATION.test(q) ||
      (topic !== 'GENERAL_PLACEMENT' && topic !== 'UNKNOWN')
    ) {
      return 'CONCEPT_EXPLANATION';
    }

    // 8. General placement preparation
    if (topic === 'GENERAL_PLACEMENT') {
      return 'GENERAL_PREPARATION';
    }

    return 'FALLBACK';
  }
}

export const chatbotClassifier = new ChatbotClassifier();
