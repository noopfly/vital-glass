# Vital Glass — Agent Guide

## Purpose and product boundary

Vital Glass is a Latvian-language, browser-only prototype of a medical-practice assistant dashboard. It demonstrates patient lookup, a clinician dashboard, day-list management, document/source-report review, and doctor-reviewed DOCX draft generation.

It is **not** a production clinical system. The patient, clinical, source-document, and account data in this repository are demo fixtures. Do not present the app as medical advice, a certified workflow, or compliant with healthcare/privacy regulation. Do not add real patient data, credentials, API keys, or other sensitive information to the repository.

### Current product direction

- Deliver a polished visual and interaction demo, not a production clinical product.
- Support doctors across multiple specialties. Specialty-specific dashboard layout and terminology are expected; do not optimize the experience solely for family medicine.
- Stabilize and refine the UI before adding major new capabilities or integrations.
- Latvian is the only supported user-facing language. Do not introduce an i18n framework or English-facing UI copy without an explicit request.

If the scope ever changes to a production system, stop and obtain direction before implementing real integrations. Production work requires an approved backend, authentication and authorization model, secure data storage, audit/retention rules, legal/privacy review, and clinical-content ownership.

## Repository layout

The deploy configuration is one directory above this app (`../netlify.toml`). This directory is the Vite application and working package root.

- `src/pages/` — route-level screens. `App.tsx` defines routes.
- `src/components/` — dashboard feature components. Keep domain data out of presentational components where practical.
- `src/components/ui/` — shadcn/Radix primitives. Treat these as generated/shared primitives; prefer composition over editing them.
- `src/data/patients.ts` — in-memory patient demo fixtures.
- `src/lib/` — browser-side domain helpers and mock service implementations:
  - `document-template-api.ts` has in-memory drafts, generated file references, and audit logs.
  - `document-templates.ts` defines template metadata/fields.
  - `source-documents.ts` maps dashboard items to static files in `public/documents/`.
  - `day-list.ts`, `dashboard-layout.ts`, `last-viewed-patient.ts`, and `specialties.ts` persist demo preferences in `localStorage`.
- `src/types/` — shared TypeScript types for patients and document templates.
- `public/documents/` — static demo HTML/PDF source documents.
- `public/templates/` — DOCX template assets fetched by the browser for draft generation.
- `scripts/generate-docx-templates.cjs` — regenerates the DOCX template fixtures; preserve its placeholders when changing templates.
- `src/lib/*.test.ts` — Vitest unit tests for pure browser-side helpers.

## Technology and conventions

- React 18 + TypeScript + Vite, using React Router v6.
- Tailwind CSS with CSS variables in `src/index.css`; use the `@/` alias for `src/` imports.
- Use existing shadcn UI primitives and Lucide icons before adding dependencies or custom primitives.
- The UI is Latvian-only. Keep all new user-facing clinical/product copy in Latvian and preserve existing terminology, punctuation, and date formatting.
- Follow the surrounding component style: named data/types near their consumer, functional components, and Tailwind utility classes. Avoid broad style rewrites for a focused change.
- `vite.config.ts` uses a relative base path and switches to `HashRouter` for GitHub Pages. Preserve both Netlify and GitHub Pages compatibility when changing routing or asset URLs. Use `import.meta.env.BASE_URL` for public asset URLs where an absolute path would break subpath hosting.

## Design system

Vital Glass is a calm, clinical dashboard: airy light surfaces, high-information cards, and a clear hierarchy that lets a clinician identify critical information quickly. Prefer refinement of this system over one-off visual treatments.

### Reference layout principles

Use the clinical-profile reference as the default visual model for dashboard content: calm and structured enough to scan at a glance, with urgency conveyed by a small number of deliberate signals. It is a **data-first** interface, not a marketing surface.

- Build the page on a very light cool-grey canvas with white panels. Panels use a subtle 1px cool-grey border and a small, consistent radius (about `rounded-lg`); do not substitute shadows, gradients, tinted card fills, or decorative containers for hierarchy.
- Create hierarchy in this order: page/patient context → a concise clinical summary → grouped facts → the actionable findings. A single broad summary panel may span the content width; below it, use a wider primary work column and a narrower secondary/alert column. Avoid a grid of equally weighted cards when some content is clearly primary.
- Give each panel one job and one clear heading. Set the heading at `text-xl font-semibold` with an inline, tooltip-capable information icon only when explanatory help is genuinely useful. Use `p-5`/`p-6` panel padding and `gap-4` between sibling panels as the starting rhythm.
- In a summary panel, place the title and one-sentence interpretation first, then separate the fact groups with a quiet horizontal rule. On wide screens, render 3–4 evenly aligned fact groups; each group has a semibold label and short stacked entries. On narrow screens, stack the groups rather than squeezing or truncating their content.
- Keep a clinical concept, its code/name, date, unit, and qualifier visually adjacent. Use muted `text-xs` metadata for dates and reference ranges; never let metadata compete with the patient-relevant fact. Keep dates in the established Latvian format and use `tabular-nums` for dates and measurements.
- Use compact, text-bearing status chips only for short, scannable exception labels (for example, a raised measure). They need a pale semantic fill, a fine matching border, semibold text, and enough horizontal padding to read as a control/status—not a loose coloured word. Do not make every category a chip.
- Prefer grouped, full-width list rows for related clinical measurements. Each row has: a persistent severity rail or icon on the leading edge; a two-line label and context; an optional compact trend sparkline; a prominent current value with unit and direction/change; and a trailing chevron for drill-down. Keep these columns aligned across rows so the list can be scanned vertically.
- Use one clear severity colour per row: red for critical, amber for needs-attention, and the existing neutral/blue palette for non-urgent information. Pair every colour with explicit text such as “Kritisks”, a recognisable icon, or both. The severity rail should remain narrow—colour is an aid to scanning, not the entire message.
- Sparklines are evidence, not decoration: show a simple one-colour line with a very restrained fade only when a trend changes interpretation. Never use a sparkline without the current value, unit, and textual direction. Omit it when history is unavailable or would create visual noise.
- Make current measurements the strongest element within a data row, followed by the name and then the reference/context line. Align measurement values and percentage deltas to the end of the row; align dates to the end of alert rows. Use `tabular-nums` and stable column widths so values do not jump while scanning.
- Separate rows with quiet 1px dividers rather than individual cards. Give the entire row a predictable hover, focus, and pressed state when it opens details; the chevron reinforces discoverability but is not the sole interactive target. A final, lightly tinted list footer can disclose additional items with a text link and trailing chevron.
- Present alerts as a compact secondary list: leading severity icon, short bold title, optional one-line status beneath it, and a right-aligned date. Keep this panel intentionally quieter than the main measurement list; a “more alerts” footer should disclose the remaining count rather than flooding the first viewport.
- Preserve generous empty space around headings, dividers, and column groups. Density comes from alignment and repetition, not reduced type, cramped padding, or dense colour blocks. Prefer a calm 2–3 visual-level hierarchy over badges, borders, and icons on every line.

#### Responsive behavior for clinical data

- Start with a stable desktop grid: summary facts in 3–4 columns and dashboard panels in an approximately 2:1 primary/secondary split. At the first constrained width, stack the secondary alert panel beneath the primary work panel; do not make either card too narrow.
- Let data rows reflow deliberately. Retain the severity cue, label, current value, unit, and action affordance; move the sparkline and change indicator to a second line or hide them only when they are supplementary. Never truncate a measurement, unit, alert title, or date to preserve a desktop row shape.
- Make expansion controls explicit and count-based (for example, “Rādīt vēl 2” / “Vēl 4 rādītāji”). They must work with keyboard and expose their expanded state; do not rely on a chevron alone.
- Keep critical state readable without colour, hover, or tooltips. Support focus-visible treatment on full-row buttons/links, maintain at least 44px usable hit areas for row actions, and ensure secondary metadata remains legible at `text-xs`.

### Typography

- Use the global Inter sans-serif stack. Do not introduce a second UI typeface.
- Save all source and static text files as UTF-8. Preserve Latvian diacritics directly in source; never replace them with fallback characters or mojibake.
- Use Tailwind's shared text scale only. Do not add arbitrary `text-[...]` font sizes.

  | Class | Size | Intended use |
  | --- | --- | --- |
  | `text-xs` | 12px | Metadata, table headers, compact status labels, chart labels |
  | `text-sm` | 14px | Default body copy, form labels, dense card content, buttons |
  | `text-xl` | 20px | Section titles |
  | `text-2xl` | 24px | Page and dialog titles |
  | `text-3xl` | 30px | Key clinical values and display headings |

- Keep UI text at `text-xs` or larger. The previous 7-11px labels are not acceptable for a clinical workflow.
- Use only `font-normal` (400) and `font-semibold` (600). Supporting copy and controls use normal weight; labels, headings, and key values use semibold. Do not use medium, bold, or other weights.
- Use `tabular-nums` for aligned clinical values, dates, and table columns; keep the Inter typeface rather than switching to a monospace font.
- Use tight tracking only for headings and values. Never use all-caps or `uppercase` styling in the product UI, including labels, badges, table headers, section markers, and actions. Use sentence case with normal tracking instead; retain unavoidable clinical abbreviations, codes, units, and initials exactly as data.
- Multi-line `text-xs` content uses at least `leading-4`; multi-line `text-sm` content uses at least `leading-5`. Never combine wrapping text with a fixed height: use natural height or `min-h-*` so the containing card can grow.

### Layout and components

- Keep the light neutral page background, white or translucent-white surfaces, restrained navy text, and the existing blue/teal status palette. Status colour must always be paired with text or an icon; colour alone is never the signal.
- Use existing shadcn primitives and the project's card, button, input, and overlay patterns. Do not create a visually similar one-off control when a shared primitive covers the need.
- Cards should have one clear title, optional concise supporting text, and a single visual priority. In dense cards, use `text-sm` body content and `text-xs` metadata rather than compressing text below the scale.
- Preserve spacing rhythm with Tailwind spacing utilities. Prefer consistent gaps and padding over arbitrary one-off offsets; use arbitrary values only where a fixed visual asset or layout constraint genuinely requires one.
- Prefer short, direct Latvian labels. Keep clinical terminology, dates, and units visually adjacent to the values they qualify.

### Responsive and accessibility rules

- Adapt density by reflowing grids, wrapping controls, and simplifying secondary content; do not reduce text below `text-xs` on narrow screens.
- Maintain readable line lengths and avoid clipping/truncating clinical values, units, dates, statuses, or actionable labels. Where space is limited, wrap or use a detail view.
- Do not add trailing ellipses to static labels or placeholders. Ellipses are reserved for an active, visibly progressing operation such as loading or generating a document.
- Every interactive state needs a visible keyboard focus style. Icon-only controls require an accessible Latvian name.
- Check desktop and a narrow mobile viewport after changing a dense dashboard card, modal, sidebar, table, timeline, or document preview.

### Documents

- Browser source-document previews use the shared Inter stack via `public/documents/document-preview.css`.
- Keep the DOCX template font choice deliberate and Word-compatible; do not change it merely to mirror browser typography unless the template assets and their rendered output are also validated.

## Data, safety, and document rules

- Keep demo data clearly synthetic. Do not commit real health, identity, or account data.
- Treat source documents as display fixtures. New source documents must be placed in `public/documents/` and registered in `src/lib/source-documents.ts`; use `documentBaseUrl` rather than hard-coded deployment paths.
- Document output is a draft. Preserve confirmation/validation requirements for clinician-entered fields and do not bypass `validateDraftBeforeGeneration`.
- The document API is intentionally in-memory. Its data disappears on refresh and is not a backend contract. Do not call it persistent, secure, or audited outside the demo session.
- When changing DOCX templates, update the metadata in `src/lib/document-templates.ts` and validate preview/download behavior. Keep placeholder keys aligned with `document-template-api.ts`.
- Medical status labels, reference ranges, alerts, and recommendations are prototype content. Changes need product/clinical review rather than unsupported clinical assumptions.

## Development workflow

From this directory:

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
```

Use `npm` for the documented CI/deployment path (`package-lock.json` is present); do not mix package managers or modify lockfiles unless dependency changes require it. `bun.lock`/`bun.lockb` are legacy or alternate lockfiles and should not be changed casually.

Run focused tests while iterating and run `npm run build` before handoff. Add or update Vitest coverage for changed pure logic, especially layout normalization, day-list persistence, patient search, and document-draft validation.

At the time this guide was added, `npm run build` passes, but `npm run lint` and `npm test` have existing failures. Do not normalize them away:

- Lint: generated/shared `src/components/ui` code violates current ESLint rules; `Index.tsx`, `RegistrationPage.tsx`, and `tailwind.config.ts` also have errors.
- Tests: `src/lib/dashboard-layout.test.ts` expects a different family-medicine card ordering than `src/lib/dashboard-layout.ts` returns.

Resolve those intentionally in a dedicated change, with tests updated only when the desired behavior is agreed.

## Change discipline

- Check `git status` first. This workspace may contain user work in progress; preserve unrelated changes and do not reset, revert, or reformat them.
- Prioritize visual consistency, interaction quality, responsive behavior, and regression fixes over new product areas. Make the smallest coherent change. Do not edit generated `dist/` output.
- Keep routing flows intact: welcome/registration → search → loading → dashboard, plus day list and document drafts.
- Keep specialty-aware behavior centralized in `src/lib/specialties.ts`, `src/lib/dashboard-layout.ts`, and their consumers. Add or update a specialty preset deliberately, with coverage, rather than scattering specialty checks through dashboard cards.
- Verify desktop and narrow/mobile layouts for changes to dense dashboard cards, overlays, sidebars, timelines, tables, or document preview.
- Use accessible controls: semantic buttons/inputs, visible focus states, keyboard-operable overlays, and useful accessible names for icon-only controls.
- Call out any change that affects clinical claims, data lifetime, document content, privacy/security posture, or deployment behavior.

## Before handing off

1. Review the diff for accidental fixture, lockfile, and `dist/` changes.
2. Run relevant tests and `npm run build`; report any existing or newly introduced failures precisely.
3. For document changes, test select → prepare → doctor confirmation/edit → preview → generate/download.
4. State whether the implementation remains demo-only or introduces a real integration requirement.
