# Feature Concept

## Problem we're solving

Clinicians need important warnings to be visible immediately without manually searching through medications, lab values, follow-up tasks, and dose reminders. Risks such as dangerous combinations, missed visits, abnormal results, and therapy-related reminders can be spread across different sources and are easy to overlook during a busy consultation. The dashboard therefore needs a compact alert surface that highlights the most urgent items first while still giving access to the broader alert history.

## Why we're solving this problem

Warnings are valuable only if they are surfaced at the right moment and in a format that supports quick action. A compact alert card helps clinicians triage risk early and understand what needs attention before or during a visit. A larger review mode is also necessary so users can manage unread versus read alerts, work through multiple items, and reduce dashboard noise over time without losing important context.

## Solution

- Add a `Brīdinājumi` component that collects medication, lab, follow-up, risk, and reminder alerts in one place.
- In the unexpanded version, show:
  - a compact dashboard card with the `Brīdinājumi` title and short description
  - a visible unread count in the header
  - as many compact alert rows as fit in the available card height
  - the most important compact row details:
    - alert title
    - alert type icon
    - date
  - quick actions through the row menu, including marking an alert as read
  - the `Skatīt visus brīdinājumus` action to open the full alert view
- In the expanded version, show:
  - a modal overlay for full alert management
  - separate tabs for unread and read alerts
  - full alert rows with both title and description
  - the ability to mark unread alerts as read
  - a more complete view of the patient’s warning history across categories
- Keep the visual style aligned with the rest of the dashboard so the component feels like part of the same clinical workspace.
