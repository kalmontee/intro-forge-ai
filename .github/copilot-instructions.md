# Copilot Instructions for IntroForge AI

## Project Overview

IntroForge AI is a Next.js 15 application that generates personalized professional messages (LinkedIn outreach, cover letters, job inquiries) using Google Gemini AI. The app uses a form-driven flow where users input their details and receive AI-generated messages.

> 📐 **For detailed system design with diagrams, see [ARCHITECTURE.md](./ARCHITECTURE.md)**

## Architecture

```
src/
├── app/           # Next.js App Router (pages, API routes, layout)
├── components/    # React components
│   ├── forms/     # Form system (FormController pattern)
│   └── ui/        # Reusable UI primitives (Button, Input, Select, Textarea)
├── styles/        # Shared className utilities
└── types/         # TypeScript interfaces
```

### Key Data Flow

1. `Main.tsx` manages state (aiResponse, loading, error) and localStorage persistence
2. `IntroForgeForm.tsx` defines field configuration → `FormController.tsx` renders generically
3. Form submission POSTs to `/api/route.ts` → Google Gemini → response displayed in `MessageDisplay.tsx`

## Developer Workflow

```bash
npm run dev      # Start dev server with Turbopack (port 3000)
npm run build    # Production build with Turbopack
npm run lint     # ESLint
```

**Environment:** Requires `GEMINI_API_KEY` in `.env.local` for AI generation.

## Code Conventions

### Component Patterns

- **Client components:** Add `'use client'` directive at top of file
- **UI components:** Use `React.forwardRef` pattern with `displayName` (see `src/components/ui/button.tsx`)
- **Barrel exports:** Use `index.ts` files for clean imports (`import { Button } from './ui'`)

### Form System

Forms use a declarative configuration pattern via `FormController`:

```typescript
// Define fields with validation, grouping, and options
const fields: FormField[] = [
  { name: 'role', label: '🎯 Role', type: 'text', required: true, groupWith: ['company'] },
  { name: 'messageType', type: 'select', options: [...] }
];
// FormController handles rendering, validation, and localStorage persistence
```

### Styling Approach

- **Tailwind CSS v4** for utility classes
- **CSS variables** for theming: `var(--card-title)`, `var(--btn-primary)`, `var(--label)`
- **Shared utilities** in `src/styles/className-utils.ts` for consistent input/field styling
- Compose styles: `getInputStyles(error, additionalClasses)`, `getFieldStyles()`

### TypeScript

- Path alias: `@/*` maps to `./src/*`
- Define interfaces in `src/types/` (e.g., `FormField`, `IntroForgeFormData`)
- Use explicit return types: `FC`, `JSX.Element`

## API Integration

The single API endpoint (`src/app/api/route.ts`) uses Google Gemini:

- Model: `gemini-2.5-flash`
- Handles specific error cases: API key invalid (403), quota exceeded (429)
- Returns `{ output: string }` on success

## UI Component Library

Located in `src/components/ui/`:
| Component | Props | Notes |
|-----------|-------|-------|
| `Button` | `variant`, `size`, `loading` | Has loading spinner built-in |
| `Input` | `label`, `error` | Auto-applies error styling |
| `Textarea` | `label`, `error` | Same pattern as Input |
| `Select` | `label`, `error`, `options` | Dropdown with styling |

All use `getInputStyles()` and `getFieldStyles()` from className-utils for consistency.

## Fonts

Uses Geist Sans and Geist Mono via `next/font/google` (configured in `layout.tsx`).
