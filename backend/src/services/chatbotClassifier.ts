export type ChatbotTopic =
  | 'CNDC_NETWORKS'
  | 'OPERATING_SYSTEMS'
  | 'DBMS_SQL'
  | 'DSA'
  | 'OOP'
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
  | 'PAGING_VIRTUAL_MEMORY';

export type ChatbotIntent =
  | 'GREETING'
  | 'STUDY_PLAN'
  | 'INTERVIEW_QUESTIONS'
  | 'COMPARISON'
  | 'CONCEPT_EXPLANATION'
  | 'TOPIC_PREPARATION'
  | 'GENERAL_PREPARATION'
  | 'FALLBACK';

export interface FormatConstraints {
  wantsTable: boolean;
  wantsExample: boolean;
  wantsSimple: boolean;
  wantsOrder: boolean;
  questionCount: number;
  planDays: number;
}

export interface ClassifiedQuery {
  rawQuery: string;
  normalizedQuery: string;
  topic: ChatbotTopic;
  subTopics: ChatbotSubTopic[];
  intent: ChatbotIntent;
  constraints: FormatConstraints;
}

export class ChatbotClassifier {
  classify(query: string): ClassifiedQuery {
    const rawQuery = query.trim();
    const q = rawQuery.toLowerCase();

    // 1. Detect Greeting
    const isPureGreeting = /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening))\b/i.test(q) && q.split(/\s+/).length <= 4;
    if (isPureGreeting) {
      return {
        rawQuery,
        normalizedQuery: q,
        topic: 'GREETING',
        subTopics: [],
        intent: 'GREETING',
        constraints: this.extractConstraints(q)
      };
    }

    // 2. Extract Constraints
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
      constraints
    };
  }

  private extractConstraints(q: string): FormatConstraints {
    // Detect table requirement
    const wantsTable = /\b(table|tabular|comparison\s+table|matrix)\b/i.test(q);

    // Detect example requirement
    const wantsExample = /\b(example|real[-\s]world\s+example|practical\s+example|analogy|use[-\s]case)\b/i.test(q);

    // Detect simple terms requirement
    const wantsSimple = /\b(simple\s+terms|simply|simple|easy\s+to\s+understand|layman|beginner\s+friendly)\b/i.test(q);

    // Detect ordered topics requirement
    const wantsOrder = /\b(order|in\s+order|topics\s+in\s+order|step\s+by\s+step|start|how\s+should\s+i\s+start|where\s+to\s+start)\b/i.test(q);

    // Detect question count (e.g. "ask me 3 questions", "5 campus placement interview questions", "20 questions")
    let questionCount = 0;
    const questionMatch = q.match(/(\d+)\s*(?:placement\s+)?(?:interview\s+)?questions/i);
    if (questionMatch && questionMatch[1]) {
      questionCount = parseInt(questionMatch[1], 10);
    } else if (/\b(?:ask\s+me|give\s+me)\b.*\bquestions?\b/i.test(q) || /\binterview\s+questions?\b/i.test(q)) {
      questionCount = 3; // sensible default when unspecified
    }

    // Detect plan days (e.g. "7-day study plan", "30 days", "45 day roadmap")
    let planDays = 7;
    const planMatch = q.match(/(\d+)[-\s]*(?:day|days|week|weeks)\s*(?:study\s+)?(?:plan|roadmap|schedule)/i);
    if (planMatch && planMatch[1]) {
      const num = parseInt(planMatch[1], 10);
      if (/week/i.test(planMatch[0])) {
        planDays = num * 7;
      } else {
        planDays = num;
      }
    }

    return {
      wantsTable,
      wantsExample,
      wantsSimple,
      wantsOrder,
      questionCount,
      planDays
    };
  }

  private detectTopicAndSubtopics(q: string): { topic: ChatbotTopic; subTopics: ChatbotSubTopic[] } {
    const subTopics: ChatbotSubTopic[] = [];

    // Subtopic signals
    const hasOSI = /\b(osi|osi\s+model|7\s+layers)\b/i.test(q);
    const hasTcpUdp = /\b(tcp\s+(?:vs|and|\/)\s*udp|udp\s+(?:vs|and|\/)\s*tcp|tcp|udp)\b/i.test(q);
    const hasBinarySearch = /\b(binary\s+search)\b/i.test(q);
    const hasArrayLinkedList = /\b(array\s+(?:vs|and|\/)\s*linked\s*list|linked\s*list\s+(?:vs|and|\/)\s*array)\b/i.test(q);
    const hasJoins = /\b(join|joins|inner\s+join|left\s+join|right\s+join|full\s+outer\s+join)\b/i.test(q);
    const hasAcid = /\b(acid|acid\s+properties|atomicity|consistency|isolation|durability)\b/i.test(q);
    const hasNormalization = /\b(normalization|1nf|2nf|3nf|bcnf|normal\s+forms)\b/i.test(q);
    const hasSolid = /\b(solid|solid\s+principles|single\s+responsibility|liskov)\b/i.test(q);
    const hasProcessThread = /\b(process\s+(?:vs|and|\/)\s*thread|thread\s+(?:vs|and|\/)\s*process|pcb|context\s+switch)\b/i.test(q);
    const hasDeadlock = /\b(deadlock|deadlocks|coffman|banker'?s\s+algorithm)\b/i.test(q);
    const hasPaging = /\b(paging|virtual\s+memory|page\s+fault|tlb|page\s+replacement)\b/i.test(q);

    if (hasOSI) subTopics.push('OSI_MODEL');
    if (hasTcpUdp) subTopics.push('TCP_VS_UDP');
    if (hasBinarySearch) subTopics.push('BINARY_SEARCH');
    if (hasArrayLinkedList) subTopics.push('ARRAY_VS_LINKED_LIST');
    if (hasJoins) subTopics.push('SQL_JOINS');
    if (hasAcid) subTopics.push('ACID_PROPERTIES');
    if (hasNormalization) subTopics.push('NORMALIZATION');
    if (hasSolid) subTopics.push('SOLID_PRINCIPLES');
    if (hasProcessThread) subTopics.push('PROCESS_VS_THREAD');
    if (hasDeadlock) subTopics.push('DEADLOCKS');
    if (hasPaging) subTopics.push('PAGING_VIRTUAL_MEMORY');

    // Topic keywords detection
    const isCNDC = /\b(cndc|computer\s+networks?|data\s+communication|networking|osi|tcp|udp|ip\s+address|subnetting|subnet|routing|dns|http|https|tls|ssl|mac\s+address|arp|socket)\b/i.test(q);
    const isOS = /\b(operating\s+systems?|\bos\b|process|thread|deadlock|paging|virtual\s+memory|semaphore|mutex|cpu\s+scheduling|round\s+robin|system\s+call)\b/i.test(q);
    const isDBMS = /\b(dbms|database|databases|sql|acid|normalization|indexing|b\+?\s*tree|transaction|transactions|joins?)\b/i.test(q);
    const isDSA = /\b(dsa|data\s+structures?|algorithms?|binary\s+search|arrays?|linked\s+lists?|trees?|bst|graphs?|dynamic\s+programming|\bdp\b|sliding\s+window|two\s+pointers?|stacks?|queues?|heaps?|time\s+complexity|space\s+complexity|big\s*o)\b/i.test(q);
    const isOOP = /\b(oop|object\s+oriented|encapsulation|polymorphism|inheritance|abstraction|solid|classes?|interfaces?|overloading|overriding)\b/i.test(q);

    // Resolve priority: specific domain topics take precedence over general terms
    if (isCNDC) {
      return { topic: 'CNDC_NETWORKS', subTopics };
    }
    if (isOS) {
      return { topic: 'OPERATING_SYSTEMS', subTopics };
    }
    if (isDBMS) {
      return { topic: 'DBMS_SQL', subTopics };
    }
    if (isDSA) {
      return { topic: 'DSA', subTopics };
    }
    if (isOOP) {
      return { topic: 'OOP', subTopics };
    }

    // General placement prep query
    if (/\b(placement|placements|campus\s+placement|interview\s+prep|campus\s+hiring|how\s+should\s+i\s+prepare\s+for\s+placements)\b/i.test(q)) {
      return { topic: 'GENERAL_PLACEMENT', subTopics };
    }

    return { topic: 'UNKNOWN', subTopics };
  }

  private detectIntent(q: string, topic: ChatbotTopic, constraints: FormatConstraints): ChatbotIntent {
    // 1. Study plan intent (explicit plan or asking where to start + order of topics)
    if (
      /\b(study\s+plan|plan|roadmap|schedule|timeline)\b/i.test(q) ||
      (constraints.wantsOrder && /\b(start|topics?|how\s+should\s+i\s+start)\b/i.test(q))
    ) {
      return 'STUDY_PLAN';
    }

    // 2. Interview questions intent
    if (constraints.questionCount > 0 || /\b(ask\s+me|give\s+me|practice).*\bquestions?\b/i.test(q) || /\binterview\s+questions?\b/i.test(q)) {
      return 'INTERVIEW_QUESTIONS';
    }

    // 3. Comparison intent
    if (
      /\b(difference\s+between|compare|comparison|versus|\bvs\b|diff\s+between)\b/i.test(q) ||
      constraints.wantsTable
    ) {
      return 'COMPARISON';
    }

    // 4. Topic preparation intent (e.g. "How should I prepare for DBMS for campus placements?")
    if (
      /\b(how\s+should\s+i\s+prepare|how\s+to\s+prepare|prepare\s+for)\b/i.test(q) &&
      topic !== 'GENERAL_PLACEMENT' &&
      topic !== 'UNKNOWN'
    ) {
      return 'TOPIC_PREPARATION';
    }

    // 5. Concept explanation intent
    if (
      /\b(explain|what\s+is|what\s+are|how\s+does|define|overview|describe)\b/i.test(q) ||
      topic === 'DSA' ||
      topic === 'CNDC_NETWORKS' ||
      topic === 'OPERATING_SYSTEMS' ||
      topic === 'DBMS_SQL' ||
      topic === 'OOP'
    ) {
      if (topic !== 'GENERAL_PLACEMENT' && topic !== 'UNKNOWN') {
        return 'CONCEPT_EXPLANATION';
      }
    }

    // 6. General placement preparation
    if (topic === 'GENERAL_PLACEMENT') {
      return 'GENERAL_PREPARATION';
    }

    return 'FALLBACK';
  }
}

export const chatbotClassifier = new ChatbotClassifier();
