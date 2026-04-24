---
name: semantic-search-safety
description: Compensates for the lack of AST-based code understanding by enforcing multi-pass search patterns for renames and refactors
---

# Semantic Search Safety

## Why This Exists

Claude Code has **no semantic code understanding**. `grep` is raw text pattern matching. It cannot distinguish a function call from a comment, differentiate identically named imports from different modules, or follow dynamic references. A rename that greps for callers will miss dynamic imports, re-exports, string references, and test mocks.

## The Rule

When renaming or changing any function, type, variable, or module, you **MUST** search separately for all reference categories. Do not assume a single grep caught everything.

## Required Search Passes

For every rename or signature change, run **all** of these searches:

### 1. Direct Calls and References
```
grep: functionName
```

### 2. Type-Level References
```
grep: functionName  (in .d.ts, interface files, generic type parameters)
```

### 3. String Literals Containing the Name
```
grep: "functionName" or 'functionName' or `functionName`
```
Catches: API route strings, error messages, logging, serialization, dynamic dispatch.

### 4. Dynamic Imports and require() Calls
```
grep: import.*functionName
grep: require.*functionName
```

### 5. Re-exports and Barrel Files
```
grep: export.*functionName
Search: index.ts, index.js barrel files specifically
```

### 6. Test Files and Mocks
```
grep: functionName  (scoped to test/, __tests__/, *.test.*, *.spec.*)
grep: mock.*functionName
grep: jest.fn.*functionName (or vi.fn for Vitest)
```

### 7. Configuration and Scripts
```
grep: functionName  (scoped to *.json, *.yaml, *.yml, *.toml, scripts/)
```

## How to Apply

- Run each search pass separately — don't try to combine them into one clever regex.
- After completing all passes, compile the full list of files that need updating.
- Update all files, then run project-wide verification (type-check + lint + tests).
- If any search returns 0 results in a category where you'd expect matches, investigate — don't celebrate.

## When to Apply

- Any rename of a function, class, type, variable, or module.
- Any signature change (adding/removing/reordering parameters).
- Any file move or path change.
- Deleting an export that other files may depend on.
