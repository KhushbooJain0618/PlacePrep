import {
  DifficultyLevel,
  RoadmapGenerateRequest,
  RoadmapGenerateResponse,
  RoadmapWeek,
  RoadmapDay,
  RoadmapTask
} from '../models/types.js';

export class RoadmapService {
  generateRoadmap(req: RoadmapGenerateRequest): RoadmapGenerateResponse {
    const duration = req.duration || 60;
    const dailyMinutes = Math.round((req.dailyHours || 2) * 60);
    const topics = req.topics && req.topics.length > 0
      ? req.topics
      : ['DSA', 'OOP', 'DBMS', 'OS', 'SQL'];

    const totalWeeks = Math.max(4, Math.round(duration / 7));
    const weeks: RoadmapWeek[] = [];

    // Map topic curriculum plans
    const topicCurricula: Record<string, { theme: string; days: { title: string; tasks: string[] }[] }> = {
      DSA: {
        theme: 'Data Structures & Algorithmic Patterns',
        days: [
          { title: 'Time Complexity & Arrays Basics', tasks: ['Big-O Analysis & Space Tradeoffs', 'Two Pointers & Sliding Window', 'Practice: Maximum Subarray (Kadane)'] },
          { title: 'Strings & Hashing Techniques', tasks: ['Frequency Hash Maps', 'String Matching & Anagrams', 'Practice: Longest Substring Without Repeating Characters'] },
          { title: 'Linked Lists & Two Pointer Traversal', tasks: ['Floyd’s Cycle Detection Algorithm', 'In-place List Reversal', 'Practice: Merge Two Sorted Lists'] },
          { title: 'Stacks, Queues & Monotonic Patterns', tasks: ['Valid Parentheses & Min Stack', 'Next Greater Element with Monotonic Stack', 'Queue Implementation using Two Stacks'] },
          { title: 'Binary Trees & BFS/DFS Traversal', tasks: ['Preorder, Inorder, Postorder Recursive & Iterative', 'Level Order BFS Traversal', 'Practice: Maximum Depth & Diameter'] },
          { title: 'Binary Search & Monotonic Spaces', tasks: ['Classic Binary Search & Rotated Sorted Array', 'Binary Search on Answer Space', 'Practice: Search in Rotated Sorted Array'] }
        ]
      },
      OOP: {
        theme: 'Object-Oriented Design & Principles',
        days: [
          { title: 'OOP Pillars & Encapsulation', tasks: ['Encapsulation & Access Modifiers', 'Abstraction & Interfaces vs Abstract Classes', 'Practice: Design a Library Management Class Hierarchy'] },
          { title: 'Polymorphism & Inheritance', tasks: ['Method Overloading vs Overriding', 'Virtual Method Tables (VTABLE) & Dynamic Dispatch', 'Composition vs Inheritance Analysis'] },
          { title: 'SOLID Design Principles Deep Dive', tasks: ['Single Responsibility & Open/Closed Principles', 'Liskov Substitution & Interface Segregation', 'Dependency Inversion Principle with Code Examples'] }
        ]
      },
      DBMS: {
        theme: 'Database Systems & Architecture',
        days: [
          { title: 'Relational Model & Normalization', tasks: ['Entity-Relationship Modeling', '1NF, 2NF, 3NF, BCNF Normal Forms', 'Functional Dependencies & Candidate Keys'] },
          { title: 'ACID Properties & Transaction Isolation', tasks: ['Write-Ahead Logging & Atomicity', 'Dirty Reads, Non-Repeatable Reads, Phantom Reads', 'Concurreny Control & 2-Phase Locking'] },
          { title: 'Database Indexing & Query Optimization', tasks: ['B+ Tree Storage Architecture', 'Clustered vs Non-Clustered Indexes', 'Query Execution Plans & Index Scans vs Seeks'] }
        ]
      },
      SQL: {
        theme: 'SQL Mastery & Complex Queries',
        days: [
          { title: 'SQL Joins & Aggregations', tasks: ['INNER, LEFT, RIGHT, FULL OUTER Joins', 'GROUP BY, HAVING vs WHERE clauses', 'Practice: Employees without Departments query'] },
          { title: 'Advanced Window Functions & Ranking', tasks: ['ROW_NUMBER() vs RANK() vs DENSE_RANK()', 'LEAD, LAG, and Cumulative Running Sums', 'Practice: Nth Highest Salary per Department'] },
          { title: 'Subqueries & Common Table Expressions (CTEs)', tasks: ['Correlated vs Uncorrelated Subqueries', 'Recursive CTEs for Hierarchical Data', 'Practice: Manager-Employee Hierarchy Traversal'] }
        ]
      },
      OS: {
        theme: 'Operating Systems & Concurrency',
        days: [
          { title: 'Processes & Threads Architecture', tasks: ['Process Control Block (PCB) & State Transitions', 'Thread vs Process Memory Space', 'Context Switching Overhead & CPU Registers'] },
          { title: 'Synchronization & Deadlocks', tasks: ['Race Conditions & Critical Section Problem', 'Mutex, Semaphores & Spinlocks', 'Deadlock Necessary Conditions & Banker’s Algorithm'] },
          { title: 'Memory Management & Paging', tasks: ['Virtual Memory & Page Tables', 'Translation Lookaside Buffer (TLB)', 'Page Replacement Algorithms (LRU, FIFO)'] }
        ]
      },
      'Computer Networks': {
        theme: 'Computer Networks & Protocols',
        days: [
          { title: 'OSI Model & TCP/IP Stack', tasks: ['7 Layers of OSI vs 4 Layers of TCP/IP', 'Packet Encapsulation & Decapsulation', 'MAC Addressing vs IP Addressing'] },
          { title: 'Transport Layer Protocols', tasks: ['TCP 3-Way Handshake & 4-Way Teardown', 'TCP Congestion Control & Flow Control', 'UDP vs TCP Use Cases & Trade-offs'] },
          { title: 'Application Layer & HTTP/HTTPS', tasks: ['HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC)', 'DNS Resolution Flow & Caching', 'SSL/TLS Handshake & Symmetric/Asymmetric Encryption'] }
        ]
      },
      'Technical Interview': {
        theme: 'Mock Interviews & Placement Drills',
        days: [
          { title: 'System Design Fundamentals', tasks: ['Load Balancers & Horizontal Scaling', 'Caching Strategies (Cache-Aside, Write-Through)', 'Database Sharding & Replication'] },
          { title: 'Company Specific Problem Drills', tasks: ['Solve 3 High-Frequency LeetCode Mediums', 'Practice Big-O verbal explanation', 'Review Common Edge Cases'] }
        ]
      }
    };

    let dayCounter = 1;
    let totalTasksCount = 0;
    let completedTasksCount = 0;

    for (let w = 1; w <= totalWeeks; w++) {
      const topicKey = topics[(w - 1) % topics.length] || 'DSA';
      const topicData = topicCurricula[topicKey] || topicCurricula['DSA'];

      const days: RoadmapDay[] = [];
      const daysInWeek = 5; // 5 study days per week + 2 review/mock days

      for (let d = 0; d < daysInWeek; d++) {
        const curriculumDay = topicData.days[d % topicData.days.length];
        const dayTitle = `Day ${dayCounter}: ${curriculumDay.title}`;

        const taskItems: RoadmapTask[] = curriculumDay.tasks.map((taskName, idx) => {
          totalTasksCount++;

          return {
            id: `task-w${w}-d${d + 1}-t${idx + 1}`,
            title: taskName,
            topic: topicKey,
            estimatedMinutes: Math.round(dailyMinutes / curriculumDay.tasks.length),
            status: 'pending',
            resources: ['Placement Preparation Guide', `${topicKey} Fundamentals`]
          };
        });

        days.push({
          dayNumber: dayCounter,
          title: dayTitle,
          focusArea: curriculumDay.title,
          tasks: taskItems
        });

        dayCounter++;
      }

      weeks.push({
        weekNumber: w,
        theme: `Week ${w}: ${topicKey} — ${topicData.theme}`,
        summary: `Master essential principles of ${topicKey} required for ${req.role} technical placement rounds.`,
        days
      });
    }

    return {
      id: 'roadmap_' + Math.random().toString(36).substring(2, 9),
      targetRole: req.role,
      level: req.level,
      durationDays: duration,
      dailyHours: req.dailyHours,
      totalWeeks,
      progressPercentage: 0,
      weeks,
      createdAt: new Date().toISOString()
    };
  }
}

export const roadmapService = new RoadmapService();
