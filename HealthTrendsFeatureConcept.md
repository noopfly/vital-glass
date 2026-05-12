# Feature Concept

## Problem we're solving

Clinicians need a quick way to understand which clinical indicators are normal, borderline, or critical without manually reviewing each laboratory value in isolation. Trends over time are especially important, but raw values alone make it harder to see whether a result is improving, worsening, or moving outside the expected range. The dashboard therefore needs a compact trend summary that surfaces the most relevant indicators first while still allowing detailed review of all results.

## Why we're solving this problem

Clinical decisions depend not just on a single measurement, but on direction of change, severity, and history over time. A compact view helps clinicians identify the most important indicators quickly and prepare for the visit with less chart searching. A fuller review mode is still necessary to inspect more indicators and open a detailed trend panel for each result, so the component needs to support both rapid triage and deeper interpretation.

## Solution

- Add a `Klīniskie rādītāji` component that presents prioritized laboratory and clinical trend results in a compact dashboard card with deeper drill-down states.
- In the unexpanded version, show:
  - a compact dashboard card with the `Klīniskie rādītāji` title and short description
  - a legend for normal, warning, and critical states
  - a short visible list of the highest-priority indicators
  - the most important visible details for each row:
    - indicator name
    - normal range
    - mini sparkline trend
    - current value
    - change
  - visual status coloring so out-of-range items stand out
  - the `Skatīt visus rādītājus` action to open the full list
- In the expanded version, show:
  - a modal overlay with the full ordered list of indicators
  - the same row pattern in a more complete review layout
  - the ability to open a detailed panel for an individual indicator
  - an indicator detail view with:
    - current value
    - change
    - status
    - normal range
    - full historical chart
    - monthly historical values
  - a fuller trend interpretation view for deeper clinical review
- Keep the visual style aligned with the rest of the dashboard so the component feels like part of the same clinical workspace.
