import { ClassifiedQuery } from './chatbotClassifier.js';
import { SearchResult } from './searchService.js';

export class MockResponseGenerator {
  generateResponse(query: ClassifiedQuery, sources: SearchResult[]): string {
    switch (query.topic) {
      case 'GREETING':
        return this.generateGreetingResponse();

      case 'CNDC_NETWORKS':
        return this.generateCNDCResponse(query);

      case 'OPERATING_SYSTEMS':
        return this.generateOperatingSystemsResponse(query);

      case 'DBMS_SQL':
        return this.generateDBMSResponse(query);

      case 'DSA':
        return this.generateDSAResponse(query);

      case 'OOP':
        return this.generateOOPResponse(query);

      case 'SYSTEM_DESIGN':
        return this.generateSystemDesignResponse(query);

      case 'GENERAL_PLACEMENT':
        return this.generateGeneralPlacementResponse(query);

      case 'UNKNOWN':
      default:
        return this.generateFallbackResponse();
    }
  }

  // -------------------------------------------------------------
  // GREETING
  // -------------------------------------------------------------
  private generateGreetingResponse(): string {
    return `Hello! I am **PlacePrep AI**, your campus placement preparation assistant.

I am here to help you crack technical rounds and coding assessments across core campus recruitment subjects:

- **Computer Networks & Data Communication (CNDC)**: OSI 7-layer model, TCP vs UDP, IP addressing & CIDR subnetting, HTTP/HTTPS, DNS.
- **Operating Systems (OS)**: Process vs Thread, CPU scheduling, synchronization (Mutex/Semaphore), Deadlocks, Paging & Virtual Memory.
- **DBMS & SQL**: Relational model, ACID properties, Normalization (1NF to BCNF), B+ Tree indexing, and complex SQL joins.
- **Data Structures & Algorithms (DSA)**: Algorithmic patterns (Two Pointers, Sliding Window), Binary Search, Trees, Graphs, Dynamic Programming, and Big-$O$ complexity.
- **Object-Oriented Programming (OOP)**: 4 Core Pillars, SOLID design principles, and design patterns.

You can ask me to:
1. **Explain any technical concept** in simple terms with real-world examples.
2. **Compare technologies** in clear tabular formats (e.g., TCP vs UDP, Array vs Linked List).
3. **Generate structured multi-day study plans** (e.g., 7-day CNDC or OS sprint).
4. **Quiz you with high-frequency campus placement interview questions**.

What subject or topic would you like to focus on today?`;
  }

  // -------------------------------------------------------------
  // CNDC / COMPUTER NETWORKS
  // -------------------------------------------------------------
  private generateCNDCResponse(q: ClassifiedQuery): string {
    const raw = q.rawQuery.toLowerCase();

    // Specific sub-feature: TCP vs UDP (Comparison + Questions + Table)
    if (q.subTopics.includes('TCP_VS_UDP') || (raw.includes('tcp') && raw.includes('udp'))) {
      let content = `Here is a comprehensive campus placement guide on **TCP vs UDP**:\n\n`;

      content += `### Conceptual Overview
- **TCP (Transmission Control Protocol)** is a **connection-oriented**, **reliable** transport protocol. It guarantees in-order byte stream delivery using a 3-way handshake (\`SYN\` → \`SYN-ACK\` → \`ACK\`), sequence numbers, acknowledgments, and congestion control.
- **UDP (User Datagram Protocol)** is a **connectionless**, **lightweight (best-effort)** transport protocol. It transmits discrete datagrams without handshake delays or retransmission overhead.\n\n`;

      if (q.constraints.wantsTable || q.intent === 'COMPARISON') {
        content += `### TCP vs UDP Comparison Table

| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection Type** | Connection-oriented (requires 3-way handshake) | Connectionless (sends data immediately) |
| **Reliability** | **Guaranteed delivery** via ACKs & automatic retransmission | **Best-effort**; packets may drop, duplicate, or arrive out of order |
| **Packet Ordering** | Strict sequential ordering via sequence numbers | No ordering guarantee (handled by application if needed) |
| **Header Size** | 20 to 60 bytes (includes options & flags) | Fixed **8 bytes** (Source, Destination, Length, Checksum) |
| **Speed & Latency** | Slower due to handshake, ACKs, and retransmissions | Ultra-fast with minimal transmission latency |
| **Flow & Congestion Control** | Supported (Sliding Window, Slow Start, Congestion Avoidance) | Not supported |
| **Data Boundary** | Continuous byte stream (no message boundaries) | Preserves packet/message boundaries (Datagrams) |
| **Common Use Cases** | Web browsing (HTTP/HTTPS), File transfers (FTP/SFTP), Email (SMTP) | Live video streaming (WebRTC), Gaming, DNS queries, VoIP, DHCP |\n\n`;
      }

      if (q.constraints.wantsExample) {
        content += `### Real-World Placement Analogy
- **TCP is like Registered Postal Mail**: The postal service requires a signature upon delivery. If the letter is lost in transit, it is automatically re-sent until successfully received.
- **UDP is like a Live Radio / Megaphone Broadcast**: The speaker broadcasts information in real time. If you miss a word due to momentary noise, the broadcast does not pause or re-read past sentences; it keeps moving forward to maintain live timeliness.\n\n`;
      }

      // Append interview questions if requested
      const qCount = q.constraints.questionCount > 0 ? q.constraints.questionCount : (raw.includes('question') ? 5 : 0);
      if (qCount > 0) {
        content += `### Top ${qCount} Campus Placement Interview Questions on TCP & UDP\n\n`;
        const questionsList = [
          `**Q1: Explain the TCP 3-Way Handshake mechanism in detail.**\n   - *Answer*: Client sends \`SYN (seq=x)\`. Server responds with \`SYN-ACK (seq=y, ack=x+1)\`. Client completes connection with \`ACK (ack=y+1)\`. This synchronizes sequence numbers on both ends before data exchange.`,
          `**Q2: Why does DNS primarily run over UDP (Port 53), but occasionally switch to TCP?**\n   - *Answer*: Standard DNS query-response packets are lightweight (< 512 bytes), making UDP faster and resource-efficient. DNS switches to TCP for DNS zone transfers between servers or when response payloads exceed 512 bytes (EDNS0 fallback).`,
          `**Q3: What is the key difference between TCP Flow Control and Congestion Control?**\n   - *Answer*: **Flow Control** prevents the sender from overwhelming the *receiver's buffer* (managed via the Receiver Window size \`rwnd\`). **Congestion Control** prevents all senders collectively from overwhelming the *underlying network routers* (managed via the Congestion Window \`cwnd\`).`,
          `**Q4: How does TCP handle packet loss and out-of-order delivery?**\n   - *Answer*: TCP assigns incremental sequence numbers to every byte. If an expected ACK is not received within the Retransmission Timeout (RTO) or if 3 duplicate ACKs are received (Fast Retransmit), TCP retransmits the missing segment and reassembles incoming packets in correct sequence buffer order.`,
          `**Q5: Why is UDP preferred over TCP for real-time multiplayer games and VoIP streaming?**\n   - *Answer*: In real-time audio/video or gaming, current state data (player position, live voice audio) is time-sensitive. Waiting for retransmission of an old dropped frame via TCP induces perceptible lag/jitter. Dropping an outdated frame is preferable to delaying current live playback.`
        ];

        for (let i = 0; i < Math.min(qCount, questionsList.length); i++) {
          content += `${questionsList[i]}\n\n`;
        }
      }

      return content.trim();
    }

    // Specific sub-feature: OSI Model
    if (q.subTopics.includes('OSI_MODEL') || raw.includes('osi')) {
      let content = `### Understanding the OSI (Open Systems Interconnection) Model\n\n`;

      if (q.constraints.wantsSimple) {
        content += `In simple terms, the **OSI Model** is a 7-layer architectural blueprint that describes how data travels from an application on your computer, across physical network cables or Wi-Fi, to an application on another computer.\n\n`;
        content += `> **Mnemonic to Remember the 7 Layers (Top to Bottom)**:\n`;
        content += `> **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing\n`;
        content += `> *(Application → Presentation → Session → Transport → Network → Data Link → Physical)*\n\n`;
      }

      content += `### The 7 Layers Explained Simply:
1. **Layer 7 - Application Layer**: Where user applications interact directly with the network (e.g., Web browser using HTTP/HTTPS, Email client using SMTP).
2. **Layer 6 - Presentation Layer**: Translates, compresses, and encrypts/decrypts data so the application can read it (e.g., SSL/TLS, ASCII, JPEG).
3. **Layer 5 - Session Layer**: Opens, manages, and closes communication sessions/dialogues between two devices (e.g., RPC, NetBIOS).
4. **Layer 4 - Transport Layer**: Manages end-to-end communication, port addressing, segmentation, and reliability (TCP for guaranteed delivery, UDP for low-latency streaming).
5. **Layer 3 - Network Layer**: Handles host-to-host logical IP addressing and packet routing across networks (Routers, IPv4, IPv6, ICMP).
6. **Layer 2 - Data Link Layer**: Node-to-node frame delivery across local hardware links; uses physical MAC addresses and error detection (Switches, Ethernet, ARP).
7. **Layer 1 - Physical Layer**: Converts bits (\`0\`s and \`1\`s) into physical electrical, optical, or radio signals traveling through cables or air (Hubs, Cables, Wi-Fi radio).\n\n`;

      if (q.constraints.wantsExample) {
        content += `### Real-World Example: The International Postal Letter Analogy
To understand how data flows through the 7 layers, imagine writing and mailing an international letter:
1. **Application Layer**: You write a letter to your friend (*the user message*).
2. **Presentation Layer**: You translate the letter into English and seal it inside an envelope (*formatting and encryption*).
3. **Session Layer**: You verify your friend's postal service is currently accepting incoming deliveries (*session establishment*).
4. **Transport Layer**: The post office places a tracking number on the parcel and numbers the pages 1, 2, 3 so none get lost (*segmentation and reliability*).
5. **Network Layer**: The postal sorter marks the destination country, city, and ZIP code on the box (*logical IP address & routing*).
6. **Data Link Layer**: A local postal delivery van transports the box from the sorting warehouse to the neighborhood office (*hop-to-hop MAC transfer*).
7. **Physical Layer**: The actual paved roads, highways, and fuel used by the delivery truck to move the physical paper (*the physical wire/medium*).\n\n`;
      }

      // Interview questions
      const qCount = q.constraints.questionCount > 0 ? q.constraints.questionCount : 3;
      content += `### Top ${qCount} Campus Placement Interview Questions on the OSI Model\n\n`;
      const questionsList = [
        `**Q1: What are the primary responsibilities of the Transport Layer vs the Network Layer?**\n   - *Answer*: The **Network Layer (L3)** is responsible for *host-to-host* packet routing across different networks using IP addresses. The **Transport Layer (L4)** is responsible for *process-to-process* delivery using port numbers, flow control, and end-to-end reliability.`,
        `**Q2: At which OSI layers do Switches and Routers operate, and why?**\n   - *Answer*: Standard **Network Switches** operate at **Layer 2 (Data Link)** because they filter and forward frames using hardware MAC addresses. **Routers** operate at **Layer 3 (Network)** because they inspect logical IP headers and determine routing paths between separate subnets.`,
        `**Q3: What is Encapsulation and Decapsulation in the OSI Model?**\n   - *Answer*: **Encapsulation** occurs when data travels down the stack (L7 → L1); each layer wraps the payload with its own protocol header (and trailer at L2). **Decapsulation** occurs at the receiving host (L1 → L7), where each layer inspects and strips its corresponding header before passing the payload upward.`
      ];

      for (let i = 0; i < Math.min(qCount, questionsList.length); i++) {
        content += `${questionsList[i]}\n\n`;
      }

      return content.trim();
    }

    // Study Plan or Preparation Strategy for CNDC / Computer Networks
    if (q.intent === 'STUDY_PLAN' || q.intent === 'TOPIC_PREPARATION' || q.constraints.wantsOrder || raw.includes('start')) {
      let content = `## Comprehensive Campus Placement Strategy for Computer Networks & Data Communication (CNDC)\n\n`;

      content += `### 1. How to Start Your CNDC Preparation
To excel in technical rounds for software engineering roles, focus on **protocol fundamentals**, **packet flows**, and **practical debugging**. Tier-1 campus recruiters (e.g., Microsoft, Cisco, Amazon, Qualcomm) test how data moves end-to-end rather than pure theoretical definitions.

### 2. High-Yield Topics in Recommended Study Order:
1. **Layered Architecture & Encapsulation**: 7-Layer OSI Model vs 4-Layer TCP/IP Model, encapsulation/decapsulation flow, MAC vs IP addressing.
2. **Transport Layer Protocols**: TCP 3-Way Handshake & 4-Way Teardown, Flow Control (Sliding Window), Congestion Control (AIMD, Slow Start), TCP vs UDP tradeoffs.
3. **Network Layer & IP Addressing**: IPv4/IPv6, CIDR Subnetting calculations, Private vs Public IPs, NAT, Routing Protocols (Distance Vector vs Link State).
4. **Application Layer & Web Architecture**: HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC), DNS recursive resolution flow, SSL/TLS handshake in HTTPS, WebSockets.
5. **Support Protocols & Edge Concepts**: ARP (Address Resolution Protocol), DHCP lease cycle, ICMP (Ping/Traceroute), Firewalls, and Load Balancers.\n\n`;

      content += `### 3. Structured 7-Day Day-by-Day CNDC Study Plan

| Day | Focus Area | Core Concepts to Master | Practical Placement Task |
| :--- | :--- | :--- | :--- |
| **Day 1** | **Network Models & OSI** | 7 Layers of OSI, Data Link vs Network, MAC vs IP, Encapsulation | Trace packet traversal from browser to NIC |
| **Day 2** | **TCP/IP & Transport Layer** | TCP 3-Way Handshake, TCP Flags (\`SYN\`, \`ACK\`, \`FIN\`, \`RST\`), Connection teardown | Draw TCP state transition diagram |
| **Day 3** | **TCP Reliability & UDP** | Flow control (Sliding Window), Congestion control (CWND), TCP vs UDP | Solve: "Why does DNS use UDP for queries?" |
| **Day 4** | **IP Addressing & Subnetting** | IPv4 classes, CIDR notation, Subnet mask calculation, Usable hosts | Practice: Divide \`192.168.1.0/24\` into 4 subnets |
| **Day 5** | **Routing & Support Protocols** | Distance Vector (RIP) vs Link State (OSPF), ARP lookup, NAT, DHCP | Explain: "How does your laptop get an IP on Wi-Fi?" |
| **Day 6** | **Application Layer & Web** | HTTP/1.1 vs HTTP/2 vs HTTP/3, DNS root-to-TLD resolution, HTTPS TLS handshake | Answer: "What happens when you type google.com and press Enter?" |
| **Day 7** | **Mock Interview & Rapid Review** | High-frequency questions, Port numbers (\`80\`, \`443\`, \`53\`, \`22\`, \`25\`), Common traps | Practice explaining TCP handshake verbally under 2 minutes |

> **Placement Tip**: In interview coding rounds or technical interviews, always be prepared to explain the exact network path of an API call or database query!`;

      return content;
    }

    // Default CNDC topic overview
    return `### Computer Networks & Data Communication (CNDC) Placement Overview
CNDC evaluates your understanding of distributed communication protocols:
- **Foundations**: OSI 7-Layer and TCP/IP 4-Layer models.
- **Transport**: TCP connection management, sliding window flow control, congestion window algorithms, and UDP streaming trade-offs.
- **Network**: IP addressing, CIDR subnet masks, and routing algorithms (Dijkstra/Bellman-Ford).
- **Application**: DNS hierarchy, HTTP evolutions (HTTP/1.1, HTTP/2, HTTP/3), and TLS security handshakes.

Would you like a detailed 7-day study plan, a comparison table (e.g. TCP vs UDP), or mock interview questions?`;
  }

  // -------------------------------------------------------------
  // OPERATING SYSTEMS
  // -------------------------------------------------------------
  private generateOperatingSystemsResponse(q: ClassifiedQuery): string {
    const raw = q.rawQuery.toLowerCase();

    // 7-day plan or study plan
    if (q.intent === 'STUDY_PLAN' || raw.includes('plan') || raw.includes('schedule') || raw.includes('roadmap')) {
      return `## Structured 7-Day Operating Systems (OS) Interview Preparation Plan

To master Operating Systems for technical rounds, follow this day-by-day curriculum targeting high-frequency campus placement concepts:

### Day-by-Day Roadmap:

- **Day 1: Processes, Threads & CPU Fundamentals**
  - Process Control Block (PCB), Process states (New, Ready, Running, Waiting, Terminated).
  - Process vs Thread memory architectures (shared heap/data vs private stack/registers).
  - Context switching mechanism and CPU cache invalidation overhead.

- **Day 2: CPU Scheduling Algorithms**
  - Preemptive vs Non-Preemptive scheduling.
  - Algorithms: First-Come First-Served (FCFS & Convoy Effect), Shortest Job First (SJF / SRTF), Round Robin (Time Quantum tradeoffs), Priority Scheduling.
  - Calculation practice: Turnaround Time, Waiting Time, Response Time Gantt charts.

- **Day 3: Process Synchronization & Concurrency**
  - Race conditions, Critical Section requirements (Mutual Exclusion, Progress, Bounded Waiting).
  - Mutex locks vs Counting Semaphores (\`wait()\` / \`signal()\`).
  - Classical Synchronization Problems: Producer-Consumer (Bounded Buffer), Readers-Writers, Dining Philosophers.

- **Day 4: Deadlocks**
  - 4 Necessary Coffman Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
  - Deadlock Prevention (invalidating conditions) vs Deadlock Avoidance (Banker's Algorithm & Safe State).
  - Deadlock Detection via Resource Allocation Graphs (RAG) and Recovery strategies.

- **Day 5: Memory Management & Virtual Memory**
  - Logical vs Physical addresses, Paging architecture (Pages and Frames).
  - Page Tables, Translation Lookaside Buffer (TLB) hit ratios.
  - Virtual memory, Page Faults, and Page Replacement Algorithms: FIFO (Belady's Anomaly), LRU, Optimal.
  - Concept of Thrashing and the Working Set Model.

- **Day 6: Storage, File Systems & System Calls**
  - Inodes, Hard Links vs Soft (Symbolic) Links.
  - Disk Scheduling algorithms: FCFS, SSTF, SCAN (Elevator), C-SCAN.
  - Essential UNIX System Calls: \`fork()\`, \`exec()\`, \`wait()\`, \`pipe()\`, \`pthread_create()\`.

- **Day 7: Mock Interview Drills & High-Frequency Revision**
  - Rapid-fire placement questions (Top 20 OS questions).
  - Practice explaining *Virtual Memory* and *Deadlocks* verbally in under 3 minutes without hesitation.

> **Placement Tip**: When asked about Threads vs Processes, always draw the memory layout diagram showing shared Code, Data, and Heap, alongside private Stacks!`;
    }

    // Specific OS questions or concepts
    return `### Operating Systems Placement Focus Areas

Operating Systems rounds test how software interacts with system hardware:

1. **Processes vs Threads**:
   - A **Process** is an independent execution unit with its own virtual address space.
   - A **Thread** is a lightweight path of execution within a process, sharing the parent heap and global variables but having its own stack and registers.

2. **Synchronization Primitives**:
   - **Mutex**: An ownership-based locking mechanism (only the thread that locked the mutex can unlock it).
   - **Semaphore**: A signaling mechanism using integer counters. A counting semaphore controls access to a finite pool of identical resources.

3. **Deadlocks**:
   - Requires all 4 Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait.
   - Prevent deadlocks by imposing a strict global ordering on resource acquisition to eliminate circular waiting.

4. **Virtual Memory & Paging**:
   - Paging eliminates external fragmentation by allocating fixed-size physical frames.
   - TLB caches recent virtual-to-physical address translations to maintain near-native memory speeds.

Would you like a 7-day OS study plan or 5 mock interview questions on Operating Systems?`;
  }

  // -------------------------------------------------------------
  // DBMS & SQL
  // -------------------------------------------------------------
  private generateDBMSResponse(q: ClassifiedQuery): string {
    const raw = q.rawQuery.toLowerCase();

    // Preparation guidance (e.g. TEST D)
    return `## Comprehensive Campus Placement Preparation Guide for DBMS & SQL

Database Management Systems (DBMS) and SQL are tested in virtually every technical interview round. Follow this structured roadmap to master DBMS conceptually and practically:

### 1. Core Focus Areas in Recommended Study Order:
1. **Relational Model & Key Constraints**:
   - Primary Key, Candidate Key, Super Key, Foreign Key (Referential Integrity).
   - Difference between \`UNIQUE\` constraint and \`PRIMARY KEY\` (NULL allowances).

2. **Database Normalization**:
   - Understand why normalization is required: Eliminating Insertion, Update, and Deletion Anomalies.
   - **1NF**: Atomic column values, no multi-valued attributes.
   - **2NF**: In 1NF + No Partial Dependencies (all non-key attributes fully functional on PK).
   - **3NF**: In 2NF + No Transitive Dependencies ($A \\to B \\to C$).
   - **BCNF**: For every functional dependency $X \\to Y$, $X$ must be a Super Key.

3. **ACID Properties & Transaction Management**:
   - **Atomicity**: All operations succeed or all roll back (managed via Write-Ahead Logging / Undo logs).
   - **Consistency**: The database moves from one valid state to another, satisfying all integrity rules.
   - **Isolation**: Concurrently running transactions cannot see partial uncommitted states of each other.
   - **Durability**: Once committed, changes survive system power failures (Redo logs).
   - **Transaction Isolation Levels**: Read Uncommitted (Dirty Reads), Read Committed (Non-repeatable reads prevented), Repeatable Read (Phantom reads prevented), Serializable.

4. **Storage Architecture & Indexing**:
   - **B-Trees vs B+ Trees**: B+ Trees store all actual records in leaf nodes linked as a doubly-linked list, enabling fast range scans ($O(\\log N)$).
   - **Clustered vs Non-Clustered Index**: Clustered index physically sorts rows on disk (only 1 per table); Non-clustered index creates a separate B+ tree storing key and row pointers.

5. **Essential SQL Mastery**:
   - Joins: \`INNER JOIN\`, \`LEFT OUTER JOIN\`, \`RIGHT JOIN\`, \`FULL OUTER JOIN\`.
   - Aggregations: \`GROUP BY\` and \`HAVING\` (filtering grouped rows) vs \`WHERE\` (filtering raw rows).
   - Window Functions: \`ROW_NUMBER()\`, \`RANK()\`, and \`DENSE_RANK()\` for top-N ranking.

\`\`\`sql
-- High-frequency placement query: 2nd highest salary using DENSE_RANK()
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank_num
  FROM employees
) ranked_salaries
WHERE rank_num = 2;
\`\`\`

> **Interview Tip**: Whenever an interviewer asks you to optimize a slow query, discuss adding an index on columns used in \`WHERE\` and \`JOIN\` clauses, avoiding \`SELECT *\`, and examining the database query execution plan!`;
  }

  // -------------------------------------------------------------
  // DSA (DATA STRUCTURES & ALGORITHMS)
  // -------------------------------------------------------------
  private generateDSAResponse(q: ClassifiedQuery): string {
    const raw = q.rawQuery.toLowerCase();

    // Specific sub-feature: Binary Search (e.g. TEST E)
    if (q.subTopics.includes('BINARY_SEARCH') || raw.includes('binary search')) {
      return `### What is Binary Search?
**Binary Search** is an efficient divide-and-conquer searching algorithm designed to locate a target value within a **sorted array** or across any **monotonic search space** (where a condition transitions monotonically from \`true\` to \`false\`).

### How It Works:
1. Maintain two boundary pointers: \`low\` (start of search space) and \`high\` (end of search space).
2. Calculate the middle index: \`mid = low + Math.floor((high - low) / 2)\` *(using this formula prevents integer overflow that occurs with \`(low + high) / 2\` in languages like Java/C++)*.
3. Compare the middle element \`arr[mid]\` with target:
   - If \`arr[mid] === target\`, return the index \`mid\`.
   - If \`arr[mid] < target\`, the target must reside in the right half: set \`low = mid + 1\`.
   - If \`arr[mid] > target\`, the target must reside in the left half: set \`high = mid - 1\`.
4. If \`low > high\`, the element does not exist in the array.

### Time and Space Complexity Analysis:

| Case | Time Complexity | Explanation |
| :--- | :--- | :--- |
| **Best Case** | **$O(1)$** | Target is located at the exact middle element on the very first probe. |
| **Average Case** | **$O(\\log N)$** | Halves the remaining search window by a factor of 2 on each iteration ($N \\to N/2 \\to N/4 \\dots \\to 1$). |
| **Worst Case** | **$O(\\log N)$** | Target is at the outer bounds or absent, requiring $\\approx \\log_2(N)$ comparisons. |
| **Space Complexity** | **$O(1)$** (Iterative) | Requires only constant auxiliary variables (\`low\`, \`high\`, \`mid\`). |

### Standard Implementation:
\`\`\`typescript
function binarySearch(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    // Prevent integer overflow
    const mid = low + Math.floor((high - low) / 2);

    if (nums[mid] === target) {
      return mid; // Target found
    } else if (nums[mid] < target) {
      low = mid + 1; // Discard left half
    } else {
      high = mid - 1; // Discard right half
    }
  }

  return -1; // Target not found
}
\`\`\`

> **Campus Placement Variations**:
> 1. **Search in Rotated Sorted Array** (Determine which half is strictly sorted before binary search).
> 2. **Binary Search on Answer Space** (E.g., *Allocate Minimum Pages*, *Aggressive Cows*, *Capacity To Ship Packages Within D Days*).`;
    }

    // Specific sub-feature: Array vs Linked List
    if (q.subTopics.includes('ARRAY_VS_LINKED_LIST') || (raw.includes('array') && raw.includes('linked list'))) {
      return `### Array vs Linked List: Technical Comparison

| Feature | Array | Linked List |
| :--- | :--- | :--- |
| **Memory Allocation** | Contiguous block of memory | Non-contiguous, scattered heap nodes |
| **Access Time** | **$O(1)$ random access** via index (\`arr[i]\`) | **$O(N)$ sequential traversal** to reach index |
| **Insertion / Deletion** | **$O(N)$** due to element shifting (except at end $O(1)$ amortized) | **$O(1)$** pointer update if node pointer is already known |
| **Cache Locality** | **Excellent** (prefetched into CPU cache lines) | **Poor** (pointer chasing across memory pages) |
| **Memory Overhead** | Minimal (stores only data elements) | Additional pointer overhead per node (\`8 bytes\` per pointer) |
| **Size Resizing** | Static or dynamic with $O(N)$ reallocation | Dynamically grows and shrinks per element |

### When to Choose Which?
- **Use Array**: When random access is frequent, size is known, and CPU cache performance matters.
- **Use Linked List**: When frequent insertions and deletions at arbitrary positions occur without indexing.`;
    }

    // General DSA curriculum
    return `### Data Structures & Algorithms (DSA) Roadmap

DSA is the primary scoring subject in campus placement coding assessments:

1. **Phase 1: Linear Structures (Weeks 1-3)**
   - Arrays & Strings: Two Pointers, Sliding Window, Prefix Sums, Kadane's Algorithm.
   - Linked Lists: Fast & Slow Pointers (Floyd's Cycle), In-place Reversal.
   - Stacks & Queues: Monotonic Stack (Next Greater Element), Queue using Stacks.

2. **Phase 2: Non-Linear Structures & Searching (Weeks 4-6)**
   - Binary Search: Classic, Rotated array, Binary search on answer space.
   - Binary Trees & BST: Traversals (Inorder, Preorder, Postorder, Level Order), Lowest Common Ancestor.
   - Heaps: Top $K$ elements, Merge $K$ sorted lists.

3. **Phase 3: Graphs & Dynamic Programming (Weeks 7-9)**
   - Graphs: BFS, DFS, Topological Sort (Kahn's), Dijkstra's shortest path.
   - Dynamic Programming: 0/1 Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS).

Would you like to practice a specific DSA problem or understand a specific algorithm?`;
  }

  // -------------------------------------------------------------
  // OOP (OBJECT-ORIENTED PROGRAMMING)
  // -------------------------------------------------------------
  private generateOOPResponse(q: ClassifiedQuery): string {
    return `### Object-Oriented Programming (OOP) Core Pillars & Principles

Object-Oriented Programming models real-world entities through structured classes and objects. Recruiters test both the 4 Core Pillars and SOLID design principles:

### The 4 Core Pillars of OOP:
1. **Encapsulation**: Bundling internal data (attributes) and methods that operate on that data into a single unit, hiding direct access using access modifiers (\`private\`, \`protected\`, \`public\`).
2. **Abstraction**: Exposing clean, essential interfaces while hiding internal implementation details (e.g. interfaces and abstract classes).
3. **Inheritance**: Mechanism where a child subclass inherits properties and behaviors of a parent class to foster code reuse. *Prefer composition over inheritance to prevent tight coupling.*
4. **Polymorphism**: The ability of an entity to take multiple forms:
   - **Compile-time (Static) Polymorphism**: Method Overloading (same name, distinct signatures).
   - **Runtime (Dynamic) Polymorphism**: Method Overriding (subclass provides specific implementation, resolved via Virtual Method Table / VTABLE).

### SOLID Design Principles:
- **S - Single Responsibility Principle**: A class should have one, and only one, reason to change.
- **O - Open/Closed Principle**: Software components should be open for extension, but closed for modification.
- **L - Liskov Substitution Principle**: Derived classes must be substitutable for their base classes without breaking application behavior.
- **I - Interface Segregation Principle**: Clients should not be forced to depend on interface methods they do not consume.
- **D - Dependency Inversion Principle**: High-level modules should depend upon abstractions, not concrete implementations.`;
  }

  // -------------------------------------------------------------
  // GENERAL PLACEMENT PREPARATION
  // -------------------------------------------------------------
  private generateGeneralPlacementResponse(q: ClassifiedQuery): string {
    return `## End-to-End Campus Placement Preparation Strategy

Campus recruitment drives for software engineering and technical roles typically consist of 4 sequential hiring stages. Here is your end-to-end preparation roadmap:

### Stage 1: Online Assessment (OA) & Coding Rounds
- **Data Structures & Algorithms (DSA)**:
  - High-yield patterns: Two Pointers, Sliding Window, Fast & Slow Pointers, Monotonic Stack, Binary Search.
  - Core structures: Binary Trees, BST, Graphs (BFS/DFS), and Dynamic Programming (Knapsack, LCS).
  - Target: Solve 150-200 curated LeetCode Easy/Medium problems with focus on time & space complexity ($O(N)$ vs $O(N^2)$).

### Stage 2: Core Computer Science Fundamentals (The 4 Pillars)
1. **Computer Networks & CNDC**:
   - 7-Layer OSI Model vs TCP/IP Stack, TCP vs UDP, IP Addressing & Subnetting, HTTP/HTTPS, DNS resolution flow.
2. **Operating Systems (OS)**:
   - Processes vs Threads, CPU Scheduling, Concurrency & Synchronization (Mutex/Semaphores), Deadlocks (Coffman conditions), Virtual Memory & Paging.
3. **DBMS & SQL**:
   - ACID properties, Transactions, Normalization (1NF to BCNF), Indexing (B+ Trees), High-frequency SQL Joins & Window functions.
4. **Object-Oriented Programming (OOP)**:
   - 4 Pillars (Encapsulation, Abstraction, Inheritance, Polymorphism) and SOLID design principles.

### Stage 3: Technical Interview Rounds & Projects
- **Resume Projects**:
  - Be ready to explain the architecture, tech stack choice, database schema, trade-offs, and scaling bottlenecks of your projects.
- **System Design Fundamentals**:
  - Basics of Client-Server architecture, Caching (Redis), Load Balancing, and Database Sharding.

### Stage 4: Behavioral & HR Round
- Prepare behavioral responses using the **STAR Method** (**S**ituation, **T**ask, **A**ction, **R**esult).
- Prepare standard questions: "Tell me about yourself", "Explain a technical challenge you solved", and company-specific culture values.

> **Next Step**: Choose a specific subject to start practicing today, or ask me for a dedicated 7-day study plan in **DSA**, **CNDC**, **OS**, or **DBMS**!`;
  }

  // -------------------------------------------------------------
  // SYSTEM DESIGN
  // -------------------------------------------------------------
  private generateSystemDesignResponse(q: ClassifiedQuery): string {
    const raw = q.rawQuery.toLowerCase();
    const company = q.constraints.targetCompany ? ` (${q.constraints.targetCompany.toUpperCase()} Interviews)` : '';

    return `## System Design Preparation Guide${company}

System Design interviews evaluate your ability to design scalable, reliable, and fault-tolerant software architectures:

### 1. Core Architectural Concepts:
- **Load Balancing**: Distributing incoming traffic across compute nodes (Round Robin, Least Connections, IP Hash; L4 vs L7).
- **Caching Strategies**: In-memory caching (Redis / Memcached), Cache-Aside, Write-Through, Write-Back, and eviction policies (LRU, LFU).
- **Database Scaling**: Horizontal vs Vertical scaling, Read Replicas, Database Sharding (consistent hashing), and SQL vs NoSQL trade-offs.
- **Asynchronous Processing**: Decoupling services with Message Queues (Apache Kafka, RabbitMQ) and event-driven architecture.
- **Data Consistency & CAP Theorem**: Consistency vs Availability vs Partition Tolerance in distributed storage systems.

### 2. Standard 4-Step Interview Framework:
1. **Requirements Clarification**: Establish functional & non-functional requirements (throughput, latency, availability, storage capacity).
2. **High-Level Design**: Draw major components (Client → CDN / API Gateway → Load Balancer → Application Services → Cache → Database).
3. **Deep Dive**: Address single points of failure (SPOF), partition keys, caching TTL, and scale bottlenecks.
4. **Wrap-up**: Summarize bottlenecks, disaster recovery, and monitoring metrics.

Would you like to practice designing a specific system (e.g., URL Shortener, Rate Limiter, Notification System, or E-Commerce Cart)?`;
  }

  // -------------------------------------------------------------
  // FALLBACK (Ambiguous / Unknown queries)
  // -------------------------------------------------------------
  private generateFallbackResponse(): string {
    return `I am specialized as a **Campus Placement Preparation Assistant** for engineering students.

While I focus on technical placement subjects, I can help you prepare for technical interviews, coding assessments, and system design rounds across:
- **Computer Networks (CNDC)**: OSI Model, TCP vs UDP, IP Subnetting, HTTP/DNS
- **Operating Systems**: Processes, Threads, CPU Scheduling, Deadlocks, Paging
- **DBMS & SQL**: ACID Properties, Normalization, Indexing, SQL Queries
- **DSA**: Algorithmic patterns, Binary Search, Trees, Graphs, DP
- **OOP**: 4 Pillars, SOLID Principles, Design Patterns

Would you like to explore one of these technical topics, generate a structured study plan, or practice placement interview questions?`;
  }
}

export const mockResponseGenerator = new MockResponseGenerator();
