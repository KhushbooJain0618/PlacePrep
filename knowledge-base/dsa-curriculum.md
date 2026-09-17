# Data Structures & Algorithms Placement Guide

## Core Syllabus for Campus Placements

### 1. Arrays & Two Pointers
- **Fundamentals**: Contiguous memory allocation, cache locality, $O(1)$ lookup by index.
- **Key Patterns**: Two Pointers (left & right), Sliding Window (dynamic & fixed size), Kadane's Algorithm for Maximum Subarray, Dutch National Flag algorithm (sort 0s, 1s, 2s).
- **Placement Hot Questions**:
  - Trapping Rain Water
  - Next Permutation
  - Best Time to Buy and Sell Stock
  - 3Sum and 4Sum

### 2. Strings & Hashing
- **Techniques**: Frequency array, rolling hash (Rabin-Karp), KMP algorithm for pattern matching.
- **Top Questions**: Longest Substring Without Repeating Characters, Group Anagrams, Minimum Window Substring.

### 3. Linked Lists
- **Techniques**: Fast & Slow Pointers (Floyd's Cycle Detection), Reversal (Iterative & Recursive), Dummy Head Node technique.
- **Top Questions**: Reverse Linked List, Merge Two Sorted Lists, Detect and Remove Cycle, LRU Cache implementation.

### 4. Binary Search & Monotonic Search Spaces
- **Fundamentals**: Search on sorted arrays or monotonic answer spaces by halving the search window at each step (`mid = low + (high - low) / 2`).
- **Complexity**: Time Complexity is $O(\log N)$ across worst and average cases, with $O(1)$ auxiliary space in iterative form. Best case is $O(1)$.
- **Top Placement Patterns**:
  - Classic Search in Rotated Sorted Array
  - Find First and Last Position of Element
  - Search in 2D Matrix
  - Binary Search on Answer Space (Aggressive Cows, Allocate Books, Capacity to Ship Packages)

### 5. Trees & Binary Search Trees
- **Techniques**: DFS (Preorder, Inorder, Postorder), BFS (Level Order), Tree height & diameter calculation.
- **Key Properties**: Inorder traversal of BST produces strictly sorted order.
- **Top Questions**: Lowest Common Ancestor, Maximum Path Sum, Serialize & Deserialize Binary Tree, Validate BST.

### 6. Dynamic Programming
- **Techniques**: Memoization (Top-down) vs Tabulation (Bottom-up).
- **Core Patterns**: 0/1 Knapsack, Unbounded Knapsack, Longest Common Subsequence (LCS), Longest Increasing Subsequence (LIS), Matrix Chain Multiplication.

