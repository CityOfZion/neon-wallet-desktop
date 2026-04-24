---
name: file-read-budget
description: Enforces chunked reading for large files to prevent silent truncation at the 2000-line cap
---

# File Read Budget

## Why This Exists

Each file read in Claude Code is hard-capped at **2,000 lines / 25,000 tokens**. Everything past that is **silently truncated**. The agent doesn't know what it didn't see — it doesn't warn you. It hallucinates the rest and makes edits against code it literally cannot see.

## The Rule

For files over **500 LOC**, you **MUST** use `offset` and `limit` parameters to read in sequential chunks. Never assume a single read captured the full file.

## How to Apply

### Before Reading Any File

1. Check the file length first (use `wc -l` or read the first chunk and note total lines).
2. If the file is >500 lines, plan your reads:

```
File: 3,000 lines

Read 1: offset=0,   limit=500   (lines 1-500)
Read 2: offset=500, limit=500   (lines 501-1000)
Read 3: offset=1000, limit=500  (lines 1001-1500)
... and so on
```

### When Editing Large Files

1. Read the specific section you need to edit (use offset/limit to target it).
2. Read enough surrounding context (50-100 lines before and after) to understand the structure.
3. After editing, re-read the edited section to confirm the change applied correctly.

### Red Flags

- You "read" a file and your understanding of it feels incomplete — you probably hit the cap.
- You reference code from "later in the file" but didn't explicitly read that section.
- The file has a class/function at the bottom that you can't describe — you haven't seen it.

## When to Apply

- Any file over 500 LOC: mandatory chunked reading.
- Any file over 200 LOC where you need to edit near the end: read the target section explicitly.
- When making edits that reference code structure (imports at top, exports at bottom): read both ends.
