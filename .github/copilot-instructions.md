# Mangle AI Coding Agent Instructions

## Overview
Mangle is a **deductive database programming language** extending Datalog with aggregation, function calls, and type-checking. The codebase is polyglot: **Go core engine** + **Python AI enhancements**.

## Architecture Components

### Core Go Implementation
- **`engine/`** - Execution strategies: `naivebottomup.go`, `seminaivebottomup.go`, `topdown.go`
- **`ast/`** - AST representation for Mangle language constructs  
- **`parse/`** - ANTLR4-based parser (regenerate with `./generate_parser.sh`)
- **`factstore/`** - Fact storage and indexing for deductive database
- **`builtin/`** - Built-in operations like `fn:minus()`, `fn:Count()`
- **`interpreter/`** - Interactive REPL for rule development

### Python Agent Extensions
- **`src/core/copilot_agent_mode.py`** - Token-efficient snippet optimization
- **`src/core/neural_atom.py`** - AI reasoning components with metadata
- **`src/core/events.py`** - Event system for agent coordination

## Key Workflows

### Interactive Development
```bash
# Start interpreter with examples
go run interpreter/mg/mg.go --root=$PWD/examples

# Commands in REPL:
# ::load path.mg        - Load Mangle source file  
# ?predicate_name      - Query all facts
# ?goal(X,Y)           - Query with variables
# ::show all           - Display available predicates
```

### Rule Definition Patterns
```prolog
# Facts (base relations)
edge(/a, /b).
edge(/b, /c).

# Recursive rules (core Datalog)
reachable(X, Y) :- edge(X, Y).
reachable(X, Z) :- edge(X, Y), reachable(Y, Z).

# Aggregation (Mangle extension)  
count_reachable(Num) :- 
  reachable(X, Y) |> do fn:group_by(), let Num = fn:Count().
```

### Build & Test
```bash
go get -t ./...           # Get dependencies
go build ./...            # Build all packages  
go test ./...             # Run test suite
```

## Mangle-Specific Conventions

### Constants & Names
- **Name constants**: `/person/hilbert`, `/topic/mathematics` (slash-prefixed)
- **Strings**: `"quoted"` or `'single'` or `` `backtick` `` for multiline
- **Negation**: `!predicate(X)` for negative literals

### Function Calls
- Built-in functions: `fn:minus(20, X)`, `fn:plus(A, B)`, `fn:Count()`
- Function calls enable non-Datalog computations (breaks termination guarantees)

### File Structure
- **`.mg` files** contain Mangle source code (see `examples/`)
- **Package declarations** enable modular rule organization
- **Interactive buffer** vs **file loading** have different scoping rules

## Integration Points

### Go ↔ Python Bridge
- Python agents enhance Go engine with AI capabilities
- Event system coordinates between languages
- `demo_agent_mode.py` shows token optimization for code generation

### ANTLR Parser Integration
- Grammar in `parse/gen/Mangle.g4`
- Regenerate with Java + ANTLR4 toolchain
- Go visitor pattern for AST traversal

## Debugging Strategies
- Use `::show predicate` to inspect rule definitions
- Query incrementally: start with facts, then derived predicates
- `::pop` undoes last changes in interpreter
- Check arity errors early (common source of issues)

## Project-Specific Patterns
- **Deductive reasoning** over **imperative logic** - think in terms of logical relationships
- **Fact-rule separation** - base facts vs derived conclusions
- **Polyglot coordination** - Go for performance, Python for AI reasoning
- **Interactive-first** development via interpreter before file commits