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
// Define fields with validation, grouping, sections, hints, and options
const fields: FormField[] = [
  { name: 'role', label: 'Role you want', type: 'text', required: true, section: 'To whom', groupWith: ['company'] },
  { name: 'tone', label: 'Tone', type: 'radio', section: 'The message', options: [...] }
];
// FormController handles rendering, sections, validation, and localStorage persistence
```

- Consecutive fields with the same `section` render under one heading.
- `onValuesChange` reports live values (used for the brief summary in the message pane).
- Labels are plain sentence-case text. No emoji.

### Styling Approach

- **Tailwind CSS v4** for utility classes
- **Design tokens** live in `src/app/globals.css` under `@theme` and are used as utilities: colors `canvas`, `surface`, `slate`, `muted`, `forge`, `line`, `field`, `error` (e.g. `bg-forge`, `text-muted`); type sizes `text-meta` / `text-ui` / `text-body` / `text-title`; radii `rounded-field` / `rounded-surface`. Don't hard-code hex values in components.
- `line` is for decorative dividers only; form control edges use `field`, which meets 3:1 contrast on white.
- **Shared utilities** in `src/styles/className-utils.ts` for consistent input/field styling
- Compose styles: `getInputStyles(error, additionalClasses)`, `getFieldStyles()`, `getDescriptionA11yProps(id, error, hint)`
- Motion: the only automatic animation is `.message-arrive` for a new message. It is disabled under `prefers-reduced-motion`.

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
| `Input` | `label`, `hint`, `error` | Auto-applies error styling |
| `Textarea` | `label`, `hint`, `error` | Same pattern as Input |
| `Select` | `label`, `hint`, `error`, `options` | Dropdown with styling |
| `RadioGroup` | `label`, `value`, `options`, `onChange`, `hint`, `error` | Segmented control on native radios (arrow keys work) |
| `Field` | `id`, `label`, `hint`, `error` | Shared label/hint/error wrapper used by the controls above |

Controls link their label with `htmlFor` and their hint/error with `aria-describedby`; errors also set `aria-invalid`.

## Fonts

Uses Schibsted Grotesk via `next/font/google` (configured in `layout.tsx`, exposed as `--font-schibsted` on `<html>`).
