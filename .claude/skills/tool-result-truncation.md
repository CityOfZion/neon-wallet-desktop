---
name: tool-result-truncation
description: Detects and works around silent truncation of tool results exceeding 50K characters
---

# Tool Result Truncation Awareness

## Why This Exists

Tool results exceeding **50,000 characters** are silently persisted to disk and replaced with a **2,000-byte preview**. The agent works from the preview without knowing results were truncated. A grep that actually returned 47 matches may show only 3 in the preview window.

## The Rule

If any search or command returns **suspiciously few results**, assume truncation happened and re-run with narrower scope.

## How to Apply

### Suspicion Triggers

- A codebase-wide grep returns fewer than 5 results for a commonly-used function.
- A search across a large directory returns results from only 1-2 files.
- The result count doesn't match your expectation based on the codebase size.
- You searched for something that should appear in tests, source, and config — but only source shows up.

### Mitigation Strategies

1. **Scope narrowly from the start:**
   - Search one directory at a time instead of the whole project.
   - Use stricter glob patterns (`src/components/*.tsx` not `**/*.tsx`).
   - Filter by file type when possible.

2. **When truncation is suspected:**
   - Re-run the search directory by directory.
   - Use `output_mode: "files_with_matches"` first to get file list, then search each file individually.
   - State explicitly: "Results may be truncated. Re-running with narrower scope."

3. **For critical operations (renames, deletions):**
   - Always search in multiple passes with different scopes.
   - Cross-reference results: if you found N callers in src/, also check test/, scripts/, config/.
   - Never trust a single search as exhaustive.

## When to Apply

- Every codebase-wide search (grep, glob).
- Any rename or deletion operation that depends on finding all references.
- When results "feel" incomplete relative to the size of the codebase.
