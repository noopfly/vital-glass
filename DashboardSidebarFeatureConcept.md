# Feature Concept

## Problem we're solving

Clinicians need persistent navigation that stays available while they move between patient search, daily worklists, and the active patient dashboard. Without a structured sidebar, common actions become slower, recent patient context is easier to lose, and support or profile actions get pushed into secondary screens.

## Why we're solving this problem

The application is designed as a working environment rather than a single page. The sidebar therefore needs to do more than hold links. It should support quick switching, preserve orientation, reduce unnecessary clicks, and remain usable even when screen width is limited. A collapsible sidebar helps keep that balance by giving users access to the same key actions in both compact and expanded states.

## Solution

Create a `DashboardSidebar` that works as a collapsible left-side control panel for the application.

### Core behavior

- The sidebar supports two states:
  - expanded mode for full labels and richer patient context
  - collapsed mode for a narrower layout focused on icons and space efficiency
- The collapsed state is remembered so the sidebar reopens in the user's last-used mode.
- The expanded state is intended for active dashboard work where labels, patient names, and footer actions need to remain readable.
- The collapsed state is intended for cases where the user wants more screen space for the main content area but still needs fast access to navigation.
- A dedicated toggle in the header allows the user to switch between both modes at any time.

### Five main functionalities

#### 1. `Jauna meklēšana`

This is the primary entry point for starting a new patient lookup. It sits near the top of the sidebar because it represents one of the most common actions in the application. The goal of this section is to let the clinician leave the current patient flow and immediately begin a new search without needing to navigate through intermediate pages.

In expanded mode, this functionality includes:

- a plus icon that communicates a new action
- the full label `Jauna meklēšana`
- a full-width clickable navigation surface
- a clear active or inactive visual state depending on the current page

In collapsed mode, the same functionality remains available in a more compact icon-first format. This preserves access while reducing horizontal space usage.

How it works:

- The user clicks the button from the sidebar.
- The application routes the user to the patient search flow.
- In that search flow, the clinician enters the patient's personal code.
- After submitting the personal code, the application proceeds to a loading screen.
- The loading screen communicates that the patient data is being prepared and retrieved before the dashboard opens.
- When loading is complete, the application opens the patient's page or dashboard view.
- The current workspace context can still be carried through the navigation state where needed.

What it includes from a product perspective:

- fast access to patient search
- support for entering a personal code as the main search input
- a transition through a dedicated loading state
- automatic opening of the patient page after the patient context is ready
- a highly visible placement in the upper navigation area
- consistent styling with the other main sidebar actions
- support for both expanded and collapsed sidebar states

Why it matters:

- It shortens the path to one of the most frequent tasks.
- It reduces the need to return to a home screen first.
- It makes the patient-opening flow feel structured and predictable: search, load, then open.
- It makes the interface feel like a continuous clinical workspace rather than a set of disconnected pages.

#### 2. `Dienas saraksts`

This section provides direct access to the current daily worklist. It is grouped with `Jauna meklēšana` because both actions belong to the clinician's main operational workflow. The purpose of this functionality is not only to open the day list but also to communicate current workload at a glance.

In expanded mode, this functionality includes:

- a calendar icon
- the label `Dienas saraksts`
- a numeric badge that shows how many items are currently in the list
- active-state styling when the user is already in the day-list view

In collapsed mode, the section becomes more compact and focuses on retaining the action in a visually smaller format.

How it works:

- The user clicks the day-list button in the sidebar.
- The application navigates to the worklist view.
- The count badge remains part of the button so the workload is visible before navigation happens.
- Inside the day-list view, the clinician can open a patient from the list and continue into the patient workflow.
- As part of that flow, the patient is identified by personal code within the worklist context.
- After the patient is selected, the application can move through a loading state before opening the patient page.
- Once the patient data is ready, the dashboard view for that patient is opened.

What it includes from a product perspective:

- immediate access to the daily patient queue
- a visible count indicator
- active-state highlighting
- patient opening through the day-list workflow
- patient identification context through personal code
- transition from worklist to loading state and then to the patient page
- positioning close to the new-search action for fast decision-making

Why it matters:

- It helps the clinician understand current workload instantly.
- It reduces unnecessary clicks just to check queue size.
- It connects the worklist directly to the same patient-opening flow used elsewhere in the product.
- It keeps the worklist accessible from every major view in the product.

#### 3. `Nesen apskatītie`

This section gives the user fast access to recently opened patients. It is designed to support real clinical behavior, where a user may switch repeatedly between a small number of active or recently reviewed cases. Instead of forcing the clinician to re-run searches, the sidebar keeps short-term patient context available in one stable place.

This functionality is shown in expanded mode, where names and identifiers can be displayed clearly.

It includes:

- a section label `Nesen apskatītie`
- a short list of recently viewed patient entries
- the patient name
- the patient personal code or identifier
- a visual highlight for the currently active patient
- a `Visi pacienti` action that opens broader patient access

How it works:

- The sidebar renders a short recent-history list.
- Each patient entry acts as a direct link back into the dashboard for that patient.
- If the current patient is open in the dashboard, that patient can be visually emphasized to reduce orientation mistakes.
- If a patient is loading, the sidebar can show a special loading card state instead of a normal static patient item.
- The `Visi pacienti` action opens a wider patient list view in an overlay, allowing the user to move beyond only the recent-history subset.

What it includes from a product perspective:

- recent-patient recall
- quick patient switching
- active-patient highlighting
- handling for loading states
- expansion from recent history into the full patient list

Why it matters:

- It saves time during multi-patient workflows.
- It reduces duplicated searching.
- It improves continuity when the clinician alternates between several active cases.
- It keeps patient context visible without crowding the main dashboard.

#### 4. `Ziņot par problēmu`

This functionality gives users a direct way to report issues from inside the application. It is intentionally placed in the sidebar rather than buried inside settings, because support actions are most useful when they are available at the exact moment the user encounters a problem.

In the expanded sidebar, this appears as a lightweight text action with an icon and the label `Ziņot par problēmu`. It is visually quieter than the primary navigation items, which is appropriate because it is a support action rather than a task-starting action.

How it works:

- The user clicks `Ziņot par problēmu`.
- The application opens a dedicated reporting overlay.
- The user can describe what happened in a free-text input area.
- The user can classify the issue severity before submitting it.

What the reporting flow includes:

- a text field for the issue description
- severity selection options
- support for categories such as blockers, annoyances, and suggestions
- a submit action to complete the report

What it includes from a product perspective:

- immediate feedback capture
- structured issue reporting
- low-friction support access
- preservation of the current workflow context while reporting

Why it matters:

- Users can report problems while the details are still fresh.
- Support requests become more actionable because they include both description and severity.
- The user does not need to leave the interface or switch to an external support channel.
- In a clinical environment, this is important because small usability problems and larger workflow blockers can both affect speed and confidence.

#### 5. Profile and settings

The footer area of the sidebar represents the signed-in clinician and acts as the entry point for profile-related and secondary application actions. This section is intentionally anchored at the bottom of the sidebar so that it remains predictable and separate from the main patient workflow controls.

In expanded mode, this functionality includes:

- a circular avatar showing user initials
- the clinician's name
- the role or specialty label
- a menu trigger state that can open additional options

When opened, the footer menu can include actions such as:

- help or support-related access (`Saņemt palīdzību`)
- learning or resource links (`Uzzināt vairāk`)
- settings (`Iestatījumi`)

`Saņemt palīdzību`

- This action is intended for situations where the clinician needs direct assistance while using the application.
- It opens a dedicated support overlay instead of navigating away from the current screen.
- The overlay is designed to let the user describe a problem, ask a product question, or request help with a workflow they do not understand.
- The support flow includes:
  - a text area for writing the message
  - explanatory copy that tells the user the team will respond to the registered email address
  - cancel and send actions
- This action is useful for cases such as:
  - the user is unsure how a feature works
  - the workflow is unclear
  - the user needs non-technical guidance from the support team
- Product-wise, this makes the footer menu feel service-oriented rather than only administrative, because it provides a direct path to human help.

`Uzzināt vairāk`

- This action is intended for self-service learning and reference material.
- It opens a resources overlay where the user can browse supporting information without leaving the current application context.
- The resources area can include structured content such as:
  - training materials
  - step-by-step guides
  - privacy-related information
  - usage terms or other reference documents
- In the current sidebar concept, this menu item represents a place for educational and informational content rather than urgent support.
- It is useful for users who want to understand the product better on their own before contacting support.
- This functionality helps separate two different needs:
  - `Saņemt palīdzību` for direct assistance
  - `Uzzināt vairāk` for independent learning and product reference
- From a UX perspective, this distinction reduces confusion because users can choose whether they need human help or just more information.

`Iestatījumi`

- This action opens the settings area for configuring how the dashboard behaves for the current user.
- In the sidebar implementation, settings are not treated as a separate distant admin page. They are available directly from the footer menu because they affect the day-to-day working environment.
- The settings flow can include controls related to dashboard personalization, especially the arrangement of modules shown in the main workspace.
- In the current implementation concept, settings support actions such as:
  - opening a settings overlay
  - reviewing the available dashboard modules
  - changing their order
  - resetting the arrangement to the default layout
  - saving the customized layout
- This makes `Iestatījumi` more than a generic preferences link. It acts as a workspace configuration tool.
- The benefit of placing this action in the footer menu is that it stays available everywhere, while still remaining separate from the primary patient and navigation actions.
- This is important because settings are essential, but they should not visually compete with high-frequency clinical workflow actions like search, worklist access, or patient switching.

How it works:

- The clinician sees their identity summary in the footer.
- Clicking the footer in expanded mode opens the profile-related menu.
- The user can then choose a secondary action such as opening settings or support resources.
- When the sidebar is collapsed, the footer simplifies visually and centers the avatar to preserve the compact layout.

What it includes from a product perspective:

- visible user identity
- access to profile and account-related controls
- a stable place for secondary actions
- separation between workflow navigation and account-level tools

Why it matters:

- It gives users a reliable place to find settings and profile options.
- It keeps lower-frequency actions available without mixing them into the core patient workflow area.
- It completes the sidebar structure by establishing a clear top-middle-bottom hierarchy:
  - main actions at the top
  - patient context in the middle
  - identity and settings at the bottom

## Expected outcome

- Faster movement between the main application flows.
- Better continuity when switching between patients.
- A cleaner interface on smaller widths through collapse support.
- Lower friction for support, settings, and profile actions.
