---
name: context-decay-prevention
description: Prevents context window exhaustion and compaction-induced amnesia during long conversations and large refactors
---

# Context Decay Prevention

## Why This Exists

Claude Code runs an auto-compaction routine when context pressure crosses ~167K tokens. When it fires, it keeps only 5 files (capped at 5K tokens each), compresses everything else into a single 50K-token summary, and **destroys** every file read, reasoning chain, and intermediate decision. Dirty codebases with dead code accelerate this.

## The Rules

### Step 0: Clean Before You Build

Before ANY structural refactor on a file >300 LOC:

1. Remove all dead props, unused exports, unused imports, and debug logs.
2. **Commit this cleanup separately** before starting the real work.
3. This reclaims token budget and delays compaction.

### Phased Execution

- Never attempt multi-file refactors in a single response.
- Break work into explicit phases of **no more than 5 files per phase**.
- Complete Phase N, run verification, and wait for explicit approval before Phase N+1.

### Context Staleness After 10+ Messages

After 10+ messages in a conversation:

- **Re-read any file before editing it.** Do not trust your memory of file contents.
- Auto-compaction may have silently destroyed that context.
- You will edit against stale state if you skip this.

## How to Apply

- At the start of any large task, estimate how many files will be touched. If >5, plan phases.
- Treat "Step 0 cleanup" as a non-negotiable prerequisite, not an optional nicety.
- When context feels degraded (referencing wrong variable names, forgetting earlier decisions), stop and re-read all relevant files before continuing.
