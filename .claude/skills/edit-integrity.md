---
name: edit-integrity
description: Prevents silent edit failures by enforcing read-before-edit and read-after-edit verification patterns
---

# Edit Integrity

## Why This Exists

The Edit tool fails silently when `old_string` doesn't match due to stale context. After auto-compaction or multiple edits, the agent's mental model of a file diverges from the actual file on disk. Edits are applied against code that no longer looks like what the agent thinks it does.

## The Rules

### Read Before Every Edit

Before making any edit to a file, **re-read the specific section** you intend to modify. Do not trust your memory of the file contents, especially:

- After 10+ messages in the conversation
- After editing other files that might affect this one
- After any tool that modifies files (write, bash commands)

### Read After Editing

After applying an edit, **read the modified section** to confirm:

1. The edit applied correctly (not silently skipped).
2. The surrounding code still makes sense with the change.
3. No unintended side effects on adjacent lines.

### Batch Limit

Never batch more than **3 edits** to the same file without a verification read in between. After 3 edits:

1. Re-read the file (or relevant section).
2. Confirm all 3 edits landed correctly.
3. Then continue with the next batch.

## How to Apply

```
# Pattern for every edit:
1. Read file (target section + context)
2. Make edit
3. Read file again (confirm change)

# For multiple edits to same file:
1. Read file
2. Edit 1
3. Edit 2  
4. Edit 3
5. Read file (verify all 3)
6. Edit 4
7. Edit 5
8. Edit 6
9. Read file (verify all 3)
```

## When to Apply

- Every file edit, without exception.
- Especially critical in long conversations (10+ messages).
- Especially critical after context compaction events.
- Especially critical when editing files that were read early in the conversation.
