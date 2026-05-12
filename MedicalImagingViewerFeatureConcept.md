# Feature Concept

## Problem we're solving

Clinicians need a quick way to review recent imaging studies and their conclusions without leaving the dashboard. Imaging information often lives in external systems, and the most relevant context is usually split between the study title, date, conclusion, institution, reporting doctor, and the image itself. The dashboard therefore needs a compact imaging summary that gives immediate context while still allowing a more immersive image review experience.

## Why we're solving this problem

Imaging results are a frequent part of clinical reasoning and follow-up decisions. A compact summary helps the clinician quickly understand what study is being shown and what the conclusion was, while preserving space on the main dashboard. At the same time, some cases require a larger image view or a link out to the external imaging system, so the component needs to support both summary review and deeper inspection.

## Solution

- Add an `Attēldiagnostika` component that presents recent imaging studies in a compact dashboard card with an expanded image review state.
- In the unexpanded version, show:
  - a compact dashboard card with the `Attēldiagnostika` title and short description
  - the currently active study title and date
  - a conclusion panel with:
    - study status
    - short conclusion text
  - a preview image area with previous and next controls for switching studies
  - fallback empty-state messaging when an image is not available
  - a DATAMED link when users need to open the external imaging source
  - supporting study metadata:
    - date
    - institution
    - doctor
- In the expanded version, show:
  - a large overlay for focused image review
  - the active study type, title, and date
  - a large image presentation area
  - previous and next controls for navigating through studies
  - fallback empty-state messaging if the image is unavailable
  - the DATAMED action for opening the external source
- Keep the visual style aligned with the rest of the dashboard so the component feels like part of the same clinical workspace.
