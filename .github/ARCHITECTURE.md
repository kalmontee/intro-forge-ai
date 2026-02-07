# IntroForge AI - System Architecture

IntroForge AI follows a **client-heavy architecture** where the Next.js frontend handles user interactions, form state, and localStorage persistence, while a single API route acts as a proxy to the Google Gemini AI service.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   User/Browser  │────▶│   Next.js App   │────▶│  Google Gemini  │
│                 │     │   (Frontend +   │     │      API        │
│                 │◀────│    API Route)   │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│   localStorage  │     │   Environment   │
│  (Form State)   │     │   Variables     │
└─────────────────┘     └─────────────────┘
```

## Component Flow

```
page.tsx
    └── Main.tsx (state: aiResponse, loading, error)
            ├── IntroForgeForm.tsx (field config)
            │       └── FormController.tsx (generic engine)
            │               └── UI Components (Input, Textarea, Select, Button)
            │               └── localStorage (auto-persist on change)
            │
            └── MessageDisplay.tsx (renders AI output)
                    └── Copy to clipboard
```

## Request Flow

```
User fills form
       │
       ▼
FormController validates
       │
       ▼
Main.tsx calls POST /api
       │
       ▼
api/route.ts builds prompt → Google Gemini
       │
       ▼
{ output: string } → MessageDisplay
```

---

_Last updated: February 2026_
