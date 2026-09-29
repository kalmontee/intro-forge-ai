# Context

Domain terms used across this codebase, each pointing at the module that owns the concept.

## Intro brief

The user's draft: name, self-introduction, role, company, recipient, message type, tone, and additional context. Defined once as a field table, `BRIEF_FIELDS` in [`src/lib/intro-request-fields.ts`](src/lib/intro-request-fields.ts), which both the client and the server build their own validation from (see [ADR 0001](docs/adr/0001-zod-out-of-browser-bundle.md)).

Two shapes exist for it:

- `IntroBrief` (same file) — the draft shape: every field is a plain string, including fields not yet chosen. This is what the form and `localStorage` deal in.
- `IntroRequest` (`src/lib/intro-request.ts`) — the validated, submit-ready shape, produced by `introRequestSchema` (zod) from a parsed request body.

## Message generation

Turning a validated intro brief into an AI-written message. Owned end to end by `handleMessageGeneration` in [`src/lib/message-generation.ts`](src/lib/message-generation.ts): origin and content-type checks, body size and shape validation, invoking a `Generator`, and mapping any failure to a fixed, client-facing response. It takes a `Generator | null` rather than reaching for one itself, so the whole pipeline is testable with a fake.

## Generator

The function type `(data: IntroRequest) => Promise<string>`, defined in [`src/lib/gemini-adapter.ts`](src/lib/gemini-adapter.ts). Message generation depends only on this type, never on a specific provider's SDK. `createGeminiGenerator(apiKey)` builds the Gemini-backed implementation; `route.ts` passes `null` when `GEMINI_API_KEY` is unset, which message generation treats the same as any other unavailable-generation case.

## Domain error kinds

`GenerationErrorKind` (`src/lib/gemini-adapter.ts`): `'timeout' | 'rate_limited' | 'upstream_unavailable' | 'no_output'`. A generator built by `createGeminiGenerator` throws these wrapped in a `GenerationFailure`, translated from the Gemini SDK's own error classes. `toErrorResponse` in [`src/lib/api-errors.ts`](src/lib/api-errors.ts) maps each kind to a fixed status and message — upstream error detail (URLs, model names, stack traces) never reaches the client, which only ever sees the mapped message.
