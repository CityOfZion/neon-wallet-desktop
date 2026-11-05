---
name: clickup-task
description: Create, rename or edit ClickUp tasks for the Neon Wallet Desktop project following the team pattern (NWD name prefix, QA description, Product and Issue Type fields). Use whenever the user asks to create, open, log, or update a ClickUp task, ticket, or bug report.
---

# ClickUp Tasks — Neon Wallet Desktop

Rules for creating ClickUp tasks for this project. Default list: `Backlog` (id `240226234`).

## Name

Always use the format:

```
NWD - <task title>
```

- Prefix is exactly `NWD`, followed by ` - ` (space, hyphen, space).
- Example: `NWD - Fix MacOS build error`

## Description

Always write a description aimed at the QA team, so they can verify the task without asking the developer. Use this structure:

```markdown
## Context
Why this task exists / what problem it solves.

## What changed
Summary of the expected behavior or the change being made.

## How to test
1. Step-by-step instructions to reproduce or verify (screens, networks, account types, etc.).
2. ...

## Expected result
What QA should see when the task is working correctly.

## Affected areas
Screens, features or blockchains that may be impacted and should be regression-tested.
```

For bugs, the "How to test" section must include the steps to reproduce the original issue.

## Custom fields (both required)

- **Product** (`3d98a7fb-4c0d-472f-94a3-bc9b50e99255`): always `Neon Wallet Desktop` (option id `0dfbfa8f-0791-4e45-870f-694f047a5330`).
- **Issue Type** (`d1c8bd2d-34f3-485a-8512-209f27e9f80d`): infer from the request:
  - `Bug` (`45b66f02-f91c-4b78-9195-e6031c3ba70c`) — something broken or behaving incorrectly
  - `Enhancement` (`f4e40c1b-666a-4a2b-b789-323c4c320791`) — new feature, improvement, refactor
  - `Documentation` (`23978968-6712-465a-aa29-7d3390478839`) — docs-only work
  - `Design` (`cd3a0657-7757-471f-940d-217e031ef31e`) — UI/UX design work
  - `Investigation` (`17cee8ea-a114-4937-96d1-aa5432ada276`) — research, spike, root-cause analysis

## Status and assignees

If the prompt does not specify the **status** or the **assignees**, ask the user before creating the task. Do not assume defaults.
