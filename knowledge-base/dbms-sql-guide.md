# DBMS & SQL Placement Interview Guide

## Database Management System Core Concepts

### 1. ACID Properties
- **Atomicity**: All or nothing execution (guaranteed via Undo Logs / Write-Ahead Logging).
- **Consistency**: The database moves from one valid state to another, preserving integrity constraints.
- **Isolation**: Concurrent transactions execute as if they were running serially. Supported isolation levels:
  - Read Uncommitted (Dirty Read anomaly)
  - Read Committed (Non-repeatable read anomaly avoided)
  - Repeatable Read (Phantom read anomaly avoided)
  - Serializable (Strict serial execution)
- **Durability**: Once committed, changes persist even in power failure (via Redo Logs / WAL).

### 2. Indexing & B-Trees
- **Clustered Index**: Determines physical storage order of data on disk. Only one per table (typically the Primary Key).
- **Non-Clustered Index**: Stores index keys alongside a pointer (Row ID or PK) to the actual data page.
- **B+ Tree vs B Tree**: B+ trees store all records in leaf nodes connected as a doubly linked list, making range queries vastly faster ($O(\log N) + \text{sequential scan}$).

### 3. Normalization
- **1NF**: Atomic values, no repeating groups.
- **2NF**: In 1NF and no partial dependencies (every non-key attribute is fully dependent on PK).
- **3NF**: In 2NF and no transitive dependencies ($X \to Y \to Z$).
- **BCNF**: For every functional dependency $X \to Y$, $X$ must be a super key.

### 4. Essential SQL Queries for Placements
```sql
-- Second highest salary using dense_rank
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank_num
  FROM employees
) WHERE rank_num = 2;

-- Finding duplicate records
SELECT email, COUNT(*) FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- INNER vs LEFT JOIN
SELECT e.name, d.dept_name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;
```
