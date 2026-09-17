# Operating Systems Placement Interview Guide

## 1. Operating Systems Core Architecture & Fundamentals
The Operating System manages hardware resources and acts as an intermediary between user applications and physical hardware. Key placement interview subjects include process virtualization, concurrency, synchronization primitives, deadlocks, and virtual memory.

### Kernel vs User Mode & System Calls
- **Dual-Mode Operation**:
  - **User Mode**: Applications execute with restricted CPU privileges. Cannot directly access hardware or arbitrary memory pages.
  - **Kernel Mode**: Privileged execution with unrestricted hardware and memory access.
- **Mode Switching & System Calls**:
  - User programs transition to kernel mode via software interrupts / trap instructions (e.g., `fork()`, `exec()`, `read()`, `write()`, `wait()`).
  - CPU switches modes, executes the kernel interrupt service routine (ISR), and returns result to user space.

---

## 2. Processes vs Threads & Concurrency
- **Process**: An instance of a program in execution with its own dedicated memory address space (Text, Data, Heap, Stack). Managed via the **Process Control Block (PCB)**.
- **Thread**: The smallest unit of CPU execution within a process ("lightweight process"). Shares the parent process's Text, Data, and Heap segments, but maintains its own unique:
  - Thread ID
  - Program Counter (PC)
  - CPU Registers
  - Call Stack
- **Context Switching**:
  - Saving the state of the currently executing process/thread and loading the saved state of the next ready process/thread.
  - Involves flushing CPU registers, changing program counters, and invalidating CPU caches/TLB (more expensive for processes than threads).

---

## 3. CPU Scheduling Algorithms
- **Preemptive vs Non-Preemptive**:
  - Preemptive: CPU can be forcibly taken from a running process (e.g., Round Robin, SRTF, Preemptive Priority).
  - Non-Preemptive: Process holds CPU until it voluntarily terminates or requests I/O (e.g., FCFS, Non-preemptive SJF).
- **Key Algorithms**:
  - **FCFS (First-Come, First-Served)**: Simple, but suffers from Convoy Effect (short processes waiting behind a long CPU-bound process).
  - **SJF (Shortest Job First)**: Provably optimal average turnaround time, but requires predicting next CPU burst length; risks starvation for long jobs.
  - **Round Robin (RR)**: Designed for time-sharing systems using a fixed Time Quantum ($q$). High $q$ degrades to FCFS; very low $q$ causes heavy context-switching overhead.
  - **Multi-Level Feedback Queue (MLFQ)**: Adaptive priority based on CPU burst history; aging prevents starvation.

---

## 4. Process Synchronization & Critical Section
- **Critical Section Problem**: A code section where shared resources are accessed. Requirements for a valid solution:
  1. **Mutual Exclusion**: Only one process can execute in critical section at any given time.
  2. **Progress**: Selection of the next process cannot be postponed indefinitely if the critical section is free.
  3. **Bounded Waiting**: There must be a limit on the number of times other processes are allowed to enter their critical sections before a requesting process enters.
- **Synchronization Primitives**:
  - **Mutex (Mutual Exclusion Lock)**: Locking mechanism owned by a single thread at a time. Binary state (locked/unlocked).
  - **Counting Semaphore**: Integer counter indicating available units of a shared resource (`wait()` / `P()` decrements, `signal()` / `V()` increments).
  - **Spinlock**: Busy-waiting lock (`while(test_and_set(&lock))`). Useful for short waits in multi-core kernel code.
- **Classical Synchronization Problems**: Producer-Consumer (Bounded Buffer), Readers-Writers, Dining Philosophers.

---

## 5. Deadlocks & Concurrency Hazards
- **Deadlock**: A state where a set of processes are permanently blocked because each process holds a resource and waits for another resource held by another process in the set.
- **4 Necessary Coffman Conditions**:
  1. **Mutual Exclusion**: At least one non-shareable resource.
  2. **Hold and Wait**: A process currently holding at least one resource is waiting to acquire additional resources held by other processes.
  3. **No Preemption**: Resources cannot be forcibly confiscated from a process holding them.
  4. **Circular Wait**: A closed chain of processes exists such that each process waits for a resource held by the next.
- **Deadlock Handling Strategies**:
  - **Prevention**: Invalidate at least one of the 4 Coffman conditions (e.g., impose resource ordering to eliminate circular wait).
  - **Avoidance**: Banker's Algorithm (maintains safe state using Maximum, Allocation, Available matrices).
  - **Detection & Recovery**: Resource Allocation Graph (RAG) cycle detection; recovery via process termination or resource preemption.
  - **Ignorance**: Ostrich algorithm (used by modern general-purpose OS like Linux and Windows).

---

## 6. Memory Management, Virtual Memory & Paging
- **Virtual Memory**: Decouples programmer's logical address space from physical RAM, allowing programs larger than physical memory to execute.
- **Paging Architecture**:
  - Logical address divided into: `Page Number (p)` and `Page Offset (d)`.
  - Physical memory divided into fixed-size **Frames** equal to page size (typically 4 KB).
  - **Page Table**: Maps logical page numbers to physical frame numbers.
  - **TLB (Translation Lookaside Buffer)**: High-speed hardware associative cache for page table entries, minimizing memory access latency.
- **Page Replacement Algorithms**:
  - **FIFO (First-In, First-Out)**: Suffers from Belady's Anomaly (more page frames can cause more page faults).
  - **LRU (Least Recently Used)**: Replaces page not used for the longest period. Optimal practical algorithm, implemented via timestamps or doubly-linked list hash maps.
  - **Optimal Page Replacement (OPT / Belady's)**: Replaces page that will not be used for the longest future duration. Serves as a theoretical benchmark.
  - **Thrashing**: Occurs when a computer's virtual memory subsystem is in a constant state of paging, spending more time swapping pages in/out of disk than executing instructions. Solved via Working Set Model.
