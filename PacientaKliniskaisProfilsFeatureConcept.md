# Feature Concept

## Problem we're solving

Clinicians need a concise clinical overview of the patient at the top of the dashboard so they can orient themselves immediately before reviewing deeper data. Key information such as the patient summary, major deviations, diagnoses, chronic conditions, and risk factors is often scattered across the chart, which slows down preparation and makes it harder to build a quick mental model of the patient.

## Why we're solving this problem

An at-a-glance clinical profile reduces time spent searching for foundational context and helps every other dashboard component make sense faster. It gives the clinician a shared starting point before moving into trends, medications, referrals, imaging, or alerts. This kind of summary is especially useful in short consultations, where rapid understanding of the patient's overall clinical picture matters.

## Solution

- Add a `Pacienta klīniskais profils` component that presents the patient’s clinical overview as a structured summary card.
- In the unexpanded version, show:
  - a dashboard card with the `Pacienta klīniskais profils` title
  - a short patient summary paragraph
  - an updated timestamp
  - grouped overview sections for:
    - deviations from normal
    - existing diagnoses
    - chronic diseases
    - risk factors
  - compact visual treatment for each group so the clinician can scan categories quickly
  - a limited number of visible items per group to keep the card readable
- In the expanded version, show:
  - no separate expanded state in the current implementation
  - the component currently works as an always-visible summary surface on the main dashboard
  - if expanded behavior is added later, it should preserve the same grouped structure while allowing more complete detail per section
- Keep the visual style aligned with the rest of the dashboard so the component feels like part of the same clinical workspace.
