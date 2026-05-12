# Feature Concept

## Problem we're solving

Clinicians need a fast way to understand a patient's current and historical medications in one place. Medication review becomes slower when dose, frequency, status, and prescribing context are split across different screens or records. Potential medication interactions can also be easy to miss during a short consultation. The dashboard therefore needs a compact medication summary while still allowing users to inspect the full list when needed.

## Why we're solving this problem

Medication safety is a core part of clinical decision-making. A quick overview reduces time spent searching through the chart and supports faster preparation before or during a visit. Highlighting possible interactions helps surface safety risks earlier. Showing both active and historical medications gives better treatment context and helps explain changes over time. A compact-to-expanded pattern also keeps the main dashboard readable without losing access to detail.

## Solution

- Add a `Medikamenti` component that presents the patient's medication list as a structured table.
- In the unexpanded version, show:
  - a compact dashboard card with the `Medikamenti` title and short description
  - a table preview designed for quick scanning
  - the most important visible fields in compact mode:
    - medication name
    - dose
    - frequency
    - status
  - visual status pills for `Aktīvs` and `Vēsturisks`
  - interaction indicators for medications that may conflict with another medication
  - a short note explaining the interaction marker
  - the `Skatīt visus medikamentus` action to open the detailed view
- In the expanded version, show:
  - a modal overlay with the full medication table
  - the same medication list in a more complete review layout
  - all key fields:
    - medication name
    - dose
    - frequency
    - status
    - start date
    - end date
    - prescribing doctor
  - the same interaction highlighting with hover detail for the interaction summary
  - a fuller medication reconciliation view for deeper review
- Keep the visual style aligned with the rest of the dashboard so the component feels like part of the same clinical workspace.
