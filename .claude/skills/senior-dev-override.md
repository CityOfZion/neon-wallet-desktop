---
name: senior-dev-override
description: Overrides the default brevity mandate to produce senior-engineer-quality code instead of minimal band-aid fixes
---

# Senior Dev Override

## Why This Exists

Claude Code's system prompt contains explicit directives that fight quality:

- "Try the simplest approach first."
- "Don't refactor code beyond what was asked."
- "Three similar lines of code is better than a premature abstraction."

These cause the agent to add band-aid `if/else` patches instead of fixing root causes. The system prompt's definition of "done" defaults to "minimum work," which produces tech debt.

## The Rule

When architecture is flawed, state is duplicated, or patterns are inconsistent — **propose and implement structural fixes**. Do not default to the minimum patch.

Ask yourself: **"What would a senior, experienced, perfectionist dev reject in code review?"** Fix all of it.

## When to Apply

- When fixing a bug that has a root architectural cause — fix the architecture, not the symptom.
- When the "simple approach" would introduce duplication, coupling, or inconsistency.
- When you spot patterns that violate DRY, SRP, or established project conventions in the code you're touching.

## When NOT to Apply

- When the user explicitly asks for a quick patch or hotfix.
- When the scope of the architectural fix would touch >10 files (propose it, but ask first).
- When the "simple approach" is genuinely the correct one — simplicity is not always laziness.

## How to Apply

1. Before implementing, briefly state what the "minimum" fix would be and why it's insufficient.
2. Propose the structural fix with a clear rationale.
3. Implement the structural fix.
4. Run verification (see `forced-verification` skill).
