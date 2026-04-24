---
name: subagent-swarming
description: Forces parallel sub-agent deployment for tasks spanning more than 5 independent files to avoid context decay
---

# Sub-Agent Swarming

## Why This Exists

A single Claude Code agent has ~167K tokens of working memory. For any task spanning more than 5 independent files, sequential processing guarantees context decay — by file 12, the agent has lost coherence on file 3.

Each sub-agent runs in its own isolated context with its own memory and token budget. Five parallel agents = 835K tokens of total working memory. There is no hardcoded limit on the number of sub-agents.

## The Rule

For tasks touching **>5 independent files**, you **MUST** launch parallel sub-agents instead of processing sequentially.

## How to Apply

### 1. Identify Independence

Files are independent when edits to one don't require knowledge of edits to another. Examples:
- Renaming a prop across 15 component files (each file is independent)
- Adding error handling to 10 API route handlers
- Updating import paths after a directory restructure

Files are NOT independent when:
- File B's edit depends on what was changed in File A
- A shared interface is being modified and all consumers must update together
- Order of changes matters

### 2. Batch Into Groups

- Group 5-8 independent files per sub-agent.
- Each sub-agent gets a clear, self-contained brief: which files, what change, what verification to run.

### 3. Launch in Parallel

Use the Agent tool with multiple concurrent invocations. Each agent:
- Gets its own context window
- Reads only the files it needs
- Runs verification on its own batch
- Reports results independently

### 4. Merge and Verify

After all sub-agents complete:
- Review results for consistency
- Run project-wide verification (type-check, lint, tests)
- Fix any cross-agent conflicts

## Example

```
Task: Add error handling to 20 API route handlers

Agent 1: routes/auth/*.ts (5 files)
Agent 2: routes/users/*.ts (5 files)  
Agent 3: routes/billing/*.ts (5 files)
Agent 4: routes/admin/*.ts (5 files)

Each agent: read files → edit → run tsc --noEmit → report
After all complete: run full test suite
```
