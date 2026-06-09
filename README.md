# EcoSphere
Personal mobility carbon footprint tracker and sustainability guide.

┌─────────────────────────────────────────┐
│         Front-end Interface Layer       │
│  [Inputs] ──► [React State] ──► [HTML]  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│         Local Storage Engine            │
│  [Data] ──► [Serialization] ──► [Cache] │
└─────────────────────────────────────────┘

## Table of Contents
- [What it does](#what-it-does)
- [How the solution works](#how-the-solution-works)
- [Approach and logic](#approach-and-logic)
- [Architecture](#architecture)
- [Running locally](#running-locally)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Security](#security)
- [Assumptions](#assumptions)
- [Project structure](#project-structure)

## What it does
- Computes greenhouse gas emissions for daily commutes based on transit modes, distance, and passenger counts.
- Tracks a weekly carbon budget of 40kg, displaying remaining allowances and tree-absorption offsets.
- Records daily logging streaks and applies points multipliers to gamified achievements.
- Provides a simulated chatbot advisor that recommends travel routes based on weather conditions.
- Integrates a higher-or-lower guessing game comparing carbon values of everyday items.
- Features a daily checklist to track and reward low-carbon lifestyle habits.

## How the solution works
1. The user inputs commute details (mode, distance, passenger count) or completes checklist actions.
2. The core calculation engine parses inputs and calculates emissions based on standard GHG conversion factors.
3. The result updates the dashboard HUD metrics, updates active streaks, and increments the user's point totals.
4. Updated states are automatically serialized and cached in localStorage for offline persistence.

## Approach and logic
The solution utilizes deterministic calculations to guarantee computational accuracy. Carbon emissions calculations division by passenger count are strictly rule-based, preventing variable outcomes from non-deterministic models. The smart chatbot simulation leverages a pure context engine processing active weather conditions and travel distance to ensure route suggestions are logically sound (e.g. recommending against active outdoor travel during snow or rainy conditions).

## Architecture
| Layer | Technology | Why |
| ----- | ---------- | --- |
| Core Framework | React 19 | Declarative UI updates and simple component architecture. |
| Language | TypeScript | Static typing preventing runtime calculation mismatches. |
| Styling | Tailwind CSS | Fast prototyping with pre-defined utility classes. |
| Icons | Lucide React | Clean, scalable vector graphic components. |
| Build System | Vite | Fast hot module replacement and small bundle optimization. |
| Test Runner | Vitest | High performance tests execution integrated with Vite. |
| DOM Simulation | jsdom | Simulates a browser context for mounting react component tests. |
| E2E Testing | Playwright | Full cross-browser verification with automated screenshots. |
| Accessibility | axe-playwright | Scans pages for WCAG 2.1 A/AA compliance during test execution. |
| Hosting | Firebase | High performance, static content delivery network. |

## Running locally
Install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Useful scripts list:
| Script | Command | Purpose |
| ------ | ------- | ------- |
| dev | vite | Starts the local dev server. |
| build | tsc -b && vite build | Compiles typescript and builds production files. |
| lint | eslint . | Validates syntax compliance. |
| typecheck | tsc --noEmit | Checks for typescript compilation errors. |
| test | vitest run | Runs all unit and component tests. |
| test:watch | vitest | Runs unit tests in watch mode. |
| test:coverage | vitest run --coverage | Generates test coverage report. |
| test:e2e | playwright test | Executes Playwright E2E browser tests. |

## Testing
The application employs three distinct testing layers:
1. **Unit Testing**: Tests mathematical formulas for emissions, savings, points, and unique ID formats.
2. **Component Testing**: Verifies component render stability, keyboard accessibility, and state change transitions.
3. **E2E Testing**: automates browser interactions (login, navigation, input) and validates local storage persistence.

Run unit and component tests:
```bash
npm run test
```

Run end-to-end tests:
```bash
npm run test:e2e
```

## Accessibility
- Tab links use role="tablist" and role="tab" with aria-selected indicators.
- Form inputs have associated labels with matching id/htmlFor pairs.
- Interactive elements feature descriptive aria-labels.
- Evaluated via automated axe-core scans during Playwright runs, achieving zero WCAG 2 A/AA compliance failures.

## Security
- Centralized security headers config located in src/lib/security/headers.ts.
- Strict Content Security Policy (CSP) blocking external unauthorized scripts.
- Input sanitization functions in src/lib/security/sanitize.ts redacting credentials and escaping output variables.
- Security policies documented in SECURITY.md and contact info exposed in .well-known/security.txt.

## Assumptions
1. Carbon footprint computation constants represent standard values defined by Greenhouse Gas Protocol guidelines.
2. User profile sessions are cached locally in the user's browser, eliminating security risks of remote storage databases.
3. Node.js LTS (version 22) is used for the continuous integration and runner environments.

## Project structure
```text
carbon-footprint/
├── .github/                 # GitHub metadata folder
│   └── workflows/           # CI automation scripts
│       └── ci.yml           # Runs lint, typecheck, tests, and E2E in pipelines
├── e2e/                     # End-to-end testing suite
│   └── main-flow.spec.ts    # Playwright E2E integration test
├── public/                  # Static assets folder
│   └── .well-known/         # Security vulnerability contact details
│       └── security.txt     # Security contact file
├── src/                     # Source code directory
│   ├── assets/              # App images and design static resources
│   ├── lib/                 # Core utility and config classes
│   │   └── security/        # Security configurations
│   │       ├── headers.ts   # Centralized HTTP security headers definition
│   │       └── sanitize.ts  # Sanitize methods (HTML escape, secret redact)
│   ├── App.css              # Custom styling definitions
│   ├── App.tsx              # Core app dashboard view and features
│   ├── index.css            # Custom scrollbars and styling resets
│   ├── main.tsx             # Root react entrypoint file
│   └── utils.ts             # Math formula calculation engine
├── test/                    # Quality assurance test cases
│   ├── components/          # React component tests
│   │   └── App.test.tsx     # Validates DOM rendering and interactive inputs
│   └── utils.test.ts        # Unit tests verifying math calculations
├── .firebaserc              # Targets firebase project id
├── eslint.config.js         # Linter style checking rules
├── firebase.json            # Deployment hosting configurations
├── package.json             # Lists scripts and project dependencies
├── playwright.config.ts     # Configures Playwright browser target settings
├── SECURITY.md              # Software vulnerability policy details
├── tsconfig.json            # Configures TypeScript compiler settings
├── vite.config.ts           # Configures Vite build properties
├── vitest.config.ts         # Configures Vitest runner variables
└── vitest.setup.ts          # Integrates Testing Library globals
```
