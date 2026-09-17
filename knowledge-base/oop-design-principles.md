# Object-Oriented Programming (OOP) Guide

## 4 Core Pillars of OOP

### 1. Encapsulation
- Bundling data (state) and methods (behavior) within a class while restricting direct access to internal state using access modifiers (`private`, `protected`, `public`).
- Benefits: Modularity, maintainability, data validation inside setters.

### 2. Abstraction
- Hiding background complexity and showing only essential features to the outside world.
- Implementation: Abstract classes (can have partial implementations) and Interfaces (contract of capabilities).

### 3. Inheritance
- Mechanism where a child class acquires fields and methods of a parent class to foster code reuse.
- Types: Single, Multilevel, Hierarchical, Multiple (handled through interfaces in Java/C# to avoid Diamond Problem).
- IS-A relationship (Inheritance) vs HAS-A relationship (Composition). *Prefer composition over inheritance*.

### 4. Polymorphism
- The ability of an entity to take multiple forms.
- **Compile-time (Static) Polymorphism**: Method Overloading (same method name, different parameter signature).
- **Runtime (Dynamic) Polymorphism**: Method Overriding (subclass overrides parent method with exact same signature). Driven by Virtual Method Tables (VTABLE).

## SOLID Design Principles
- **S - Single Responsibility Principle**: A class should have one, and only one, reason to change.
- **O - Open/Closed Principle**: Software entities should be open for extension, but closed for modification.
- **L - Liskov Substitution Principle**: Subtypes must be substitutable for their base types without altering correctness.
- **I - Interface Segregation Principle**: Clients should not be forced to depend upon interfaces that they do not use.
- **D - Dependency Inversion Principle**: High-level modules should depend on abstractions, not concrete implementations.
