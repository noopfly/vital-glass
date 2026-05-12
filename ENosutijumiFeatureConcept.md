# Feature Concept

## Problem we're solving

Clinicians need a quick way to review a patient's referrals without digging through separate systems or long document histories. During a visit, it should be easy to see whether a referral is active, used, or cancelled, what specialty it belongs to, and why it was created. The dashboard also needs to show a lightweight summary first, while still allowing access to the full referral list and referral-level detail when needed.

## Why we're solving this problem

Referral context affects follow-up planning, continuity of care, and visit preparation. A compact summary reduces time spent searching for referral status and helps clinicians notice whether the patient still has open next steps. A more detailed view is still necessary for reviewing the full list and opening a specific referral in more depth, so the component needs to support both quick scanning and focused inspection.

## Solution

- Add an `E-nosūtījumi` component that presents referral history in a compact dashboard card with access to deeper views.
- In the unexpanded version, show:
  - a compact dashboard card with the `E-nosūtījumi` title and short description
  - a short visible list of referrals for quick scanning
  - the most important referral details in compact mode:
    - referral title
    - specialty
    - facility
    - reason
    - status
  - visual status treatment for active, used, and cancelled referrals
  - the `Skatīt visus e-nosūtījumus` action to open the full list
- In the expanded version, show:
  - a modal overlay with the full referral list
  - the same referrals in a more complete review layout
  - the ability to open a specific referral from the list
  - a referral detail view for a selected item, including:
    - referral title
    - specialty
    - facility
    - reason
    - doctor
    - status
  - a fuller referral review experience for checking history and next actions
- Keep the visual style aligned with the rest of the dashboard so the component feels like part of the same clinical workspace.
