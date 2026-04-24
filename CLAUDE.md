# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Neon Wallet Desktop is a multi-blockchain cryptocurrency wallet built with Electron, React, and TypeScript. It supports Neo 3, Neo Legacy, Neo X, Bitcoin, Solana, Ethereum, and Stellar.

## Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Typecheck + build all processes
npm run lint             # ESLint with auto-fix
npm run typecheck        # Check types for both main and renderer
npm run typecheck:node   # Check main/preload only
npm run typecheck:web    # Check renderer only

# E2E Tests (Playwright only — no unit test framework)
npm run playwright           # Build + run all e2e tests
npm run playwright:ui        # Run with Playwright UI
npm run playwright:headless  # Run headless
npm run playwright:report    # Open HTML report

# Platform builds
npm run build:mac
npm run build:win
npm run build:linux
```

**To run a single Playwright test:**
```bash
npx playwright test tests/e2e/<test-file>.spec.ts
```

## Architecture

The app follows Electron's process model with strict separation:

- **`src/main/`** — Electron main process (Node.js). Handles window management, IPC, encryption, auto-update, Ledger hardware wallets, deep links, analytics, and Sentry.
- **`src/preload/`** — Preload scripts that bridge main ↔ renderer via a typed IPC API defined in `src/shared/api/`.
- **`src/renderer/src/`** — React 19 UI (Vite). All UI code lives here.
- **`src/shared/`** — Code shared across all processes: IPC API types, i18n helpers, Zod schemas, environment config.

### IPC Communication Pattern

Main and renderer never import each other directly. Communication flows through:
- `src/shared/api/main.ts` — API exposed by the main process
- `src/shared/api/renderer.ts` — API consumed by the renderer

### Renderer Structure

```
src/renderer/src/
├── components/   # Reusable UI components
├── contexts/     # React contexts (Modal, Transaction activity)
├── hooks/        # 44+ custom hooks (useBalances, useAccountActions, useHardwareWallet, etc.)
├── layouts/      # Page layouts
├── routes/       # React Router v7 pages
├── store/        # Redux Toolkit: reducers/, middlewares/, thunks/
└── types/        # Renderer-specific TypeScript types
```

### State Management

- **Redux Toolkit** — Persistent app state (auth, contacts, settings, utility) via `redux-persist`
- **TanStack React Query** — Server/async state (blockchain data, balances)
- **Zod** — Runtime validation of schemas (`src/shared/schemas/`)

### Path Aliases

- `@shared/*` → `src/shared/*`
- `@renderer/*` → `src/renderer/src/*`

## Internationalization

Locale files live in `src/shared/locales/` with 5 languages: `en`, `de`, `pt-br`, `zh`, `zh-Hant`.

- English is the source language — always edit `en/` first.
- Pre-commit hooks auto-translate changes to other languages via the `translate` Claude Code skill.
- Locale JSON keys must be sorted alphabetically (enforced by lint-staged).
- To manually trigger translation: `npm run translate`

## Code Style

- **Prettier**: single quotes, no semicolons, 120-char line width, 2-space indent
- **Imports**: sorted via `eslint-plugin-simple-import-sort` with custom groups
- **Pattern matching**: use `ts-pattern` instead of long if/else or switch chains
- Tailwind CSS classes are auto-sorted by prettier-plugin-tailwindcss

## Pre-commit Hooks

Husky runs `lint-staged` on every commit, which:
1. Runs TypeScript typecheck
2. Auto-translates any changed locale JSON
3. Runs ESLint with auto-fix
4. Sorts JSON keys alphabetically

If a commit fails due to typecheck or lint errors, fix the underlying issue — do not use `--no-verify`.

## E2E Tests

- Tests are in `tests/e2e/`
- Uses Playwright with Chromium only, single worker (sequential)
- Test selectors use `data-test-id` attributes
- 40-second timeout per test

## Environment Variables

Defined via Vite (`VITE_` prefix). Key ones:
- `VITE_SENTRY_DSN` — Error tracking
- `VITE_GA_MEASUREMENT_ID` / `VITE_GA_API_SECRET` — Analytics
- `VITE_UNLIMIT_MERCHANT_ID` / `VITE_UNLIMIT_BUY_TOKENS_IFRAME_URL` / `VITE_UNLIMIT_SELL_TOKENS_IFRAME_URL` — Fiat on/off-ramp

## Node Version

22.14.0 (see `.github/workflows/` for CI reference)
