# 1. Keep zod out of the browser bundle

## Status

Accepted (2026-09-28).

## Context

`src/lib/intro-request.ts` validates `POST /api` bodies server-side with a zod schema. The intro brief form (`src/components/forms/IntroForgeForm.tsx`) needs the same field names, labels and limits — but not the validator itself. Zod is a real dependency to ship to every visitor just to render a form; the client only needs to check "is this filled in and short enough," which doesn't require a schema library at all.

This constraint predates this ADR: it lived as a comment at the top of `src/lib/intro-request-fields.ts` ("Kept free of zod so the client form can import it without pulling the validator into the browser bundle"). It's promoted to an ADR here because the intro brief refactor (`docs/architecture-improvements.md`, item 2) made the client/server split a load-bearing part of the design — `validateBrief` and the zod schema are now two independent consumers of the same field table, and future contributors need to know why that split exists before they reach for zod on the client "for consistency."

## Decision

`src/lib/intro-request-fields.ts` owns one field table (`BRIEF_FIELDS`) with no dependency on zod. Two things are built from it, independently:

- `validateBrief()`, in the same file — zod-free, hand-written validation for the client (and anywhere else that wants field errors without a schema library).
- `introRequestSchema`, in `src/lib/intro-request.ts` — a zod schema built by reading each field's label, min and max off `BRIEF_FIELDS`, for server-side parsing of the raw JSON body.

Both read their rules and message wording from the same table, so they can't drift the way the client and server validation messages had before this refactor. A parity test (`src/lib/__tests__/intro-request-fields.test.ts`) asserts they accept and reject the same inputs.

`src/lib/intro-request.ts` (which imports zod) is only ever imported from server code (`src/app/api/route.ts` and its dependents). Nothing under `src/components/` imports it.

## Consequences

- The client bundle carries no schema-validation library. Verified after each change to the field table by running `npm run build` and confirming zod-specific symbols (e.g. `ZodObject`) appear only in `.next/server/`, never in `.next/static/`.
- Any new field needs its rule expressed twice — once in `validateBrief`'s logic, once in the zod schema builder — but both read the same `label`/`min`/`max`/`options` values from `BRIEF_FIELDS`, so only the *values* are single-sourced, not the validation code paths themselves. The parity test is what actually guarantees the two paths agree, not the shared table alone.
- If a validation rule ever needs logic too complex to express twice, that's a signal to revisit this decision (e.g. generating the zod schema mechanically from the table, or moving to `zod/mini` on the client) rather than letting the two paths diverge.
