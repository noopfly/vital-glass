# Feature Concept

## Problem we're solving

Clinicians need a chronological view of the patient’s major healthcare events, but those events are often distributed across separate systems, documents, and specialties. Without a clear timeline, it is harder to understand how consultations, hospitalizations, procedures, laboratory results, and imaging relate to one another over time. The dashboard therefore needs a single place where important clinical events can be scanned in sequence and opened for more context.

## Why we're solving this problem

A timeline helps the clinician build a narrative of the patient’s recent care instead of seeing isolated records without sequence. This supports better preparation, clearer clinical reasoning, and faster recognition of patterns such as repeated visits, recent procedures, or follow-up after hospitalization. It also makes it easier to connect other dashboard components back to concrete events in the patient journey.

## Solution

- Add a `Notikumu laika līnija` component that presents major clinical events in a horizontal timeline.
- In the unexpanded version, show:
  - a dashboard card with the `Notikumu laika līnija` title
  - filter chips for event categories such as:
    - laboratory
    - ambulatory visit
    - hospitalization
    - procedure
    - imaging
  - a horizontally scrollable sequence of events ordered by date
  - a compact event card state with:
    - date
    - event type
    - title
    - short summary
    - facility
  - left and right navigation controls when the timeline overflows horizontally
  - the ability to expand an event inline to reveal more detail
- In the expanded version, show:
  - an inline expanded event state inside the same timeline component
  - fuller event content for the selected item, including:
    - event type
    - title
    - summary
    - facility
    - detailed bullet points
    - original document link when available
  - stronger visual emphasis on the active event so it becomes the focus of review
- Keep the visual style aligned with the rest of the dashboard so the component feels like part of the same clinical workspace.
