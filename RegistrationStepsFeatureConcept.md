# Feature Concept

## Problem we're solving

New clinicians need a short onboarding flow before entering the patient workspace. Without a guided setup, the first experience is too generic, the dashboard may not match the clinician's specialty, and the user has no clear way to shape the workspace around their daily priorities.

## Why we're solving this problem

The registration flow should not only collect basic setup choices. It should help the user start with a dashboard that feels relevant from the first session. A two-step structure keeps the flow lightweight while still allowing the system to personalize the workspace and give the clinician control over what appears first.

## Solution

Create a two-step registration flow that helps the user define specialty context and organize the initial dashboard layout.

### Step 1. `Specialitāte`

This step helps the clinician choose the specialty that best matches their role. The purpose is to apply a relevant dashboard preset before the user enters the main workspace.

What this step includes:

- a progress indicator showing this as `01`
- the main heading for choosing a specialty
- a short explanation that the dashboard will be adapted to the clinician's priorities
- a search field for finding a specialty faster
- a grid of selectable specialty cards
- a clear selected state for the active specialty
- an `Izlaist` action for users who want to continue without selecting a specialty
- a `Turpināt` action for moving to the next step

How it works:

- The user opens the registration flow.
- The first visible step is `Specialitāte`.
- The user can browse or search for a specialty.
- When a specialty is selected, the system applies a predefined module preset for that role.
- The user can continue to the next step once a specialty is selected, or skip this step if the flow allows it.

Why it matters:

- It gives the system an initial context for personalization.
- It reduces setup friction by starting from a ready-made preset instead of a blank workspace.
- It helps different clinician roles begin with a dashboard that better matches their day-to-day work.

### Step 2. `Darba panelis`

This step lets the clinician organize the dashboard modules before starting work. The purpose is to turn the specialty-based starting point into a workspace that reflects the user's preferred priorities and reading order.

What this step includes:

- a progress indicator showing this as `02`
- the main heading for arranging the dashboard
- supporting text that explains the panel can be reordered
- a draggable list of dashboard modules
- move-up and move-down controls for quick manual reordering
- a live preview of the workspace layout
- informational guidance that the layout can also be changed later in settings
- an `Atpakaļ` action for returning to the previous step
- a `Sākt darbu` action for completing registration and entering the workspace

How it works:

- The user enters the second step after choosing or skipping specialty selection.
- The dashboard modules appear in a prioritized list.
- The user can drag modules into a new order or adjust them with directional controls.
- The preview updates to reflect the current arrangement.
- When the user is satisfied, they complete the flow and enter the main product workspace.

Why it matters:

- It gives the user ownership over the working environment before the first session starts.
- It makes the dashboard feel intentional rather than auto-generated.
- It reduces later friction by letting clinicians front-load the modules they use most often.

## Expected outcome

- A shorter and clearer registration flow.
- Better first-session relevance through specialty-based setup.
- A more personalized dashboard before the user starts working.
- Lower need for immediate post-registration settings changes.
