# Unified Creation Studio — Common Creation Flow

Redesign the creation experience of **Virtual Studio** by replacing the existing modal-based creation flows for:

1. **Create Video**
2. **AI Presentation Generation**
3. **Presentation Design**

with one unified, modern, scalable **page-based Creation Studio flow**.

Do **not** redesign Image Generation or Canvas Editing yet. They should remain outside this scope.

The goal is to make all three creation experiences feel like different modes of the **same product**, rather than three unrelated workflows.

---

## 1. CORE DESIGN PRINCIPLE

Create a single reusable **Creation Studio Shell**.

All three creation types should use:

- Same page layout
- Same top navigation
- Same left step navigation / progress indicator
- Same Continue / Back controls
- Same template selection experience
- Same workspace and folder selection experience
- Same visual language
- Same spacing system
- Same typography
- Same cards
- Same buttons
- Same page transitions
- Same validation behavior
- Same loading states
- Same success state

Only the content inside each step should dynamically change according to the selected creation type.

The experience should feel similar to modern products such as:

- Canva
- Gamma
- Pitch
- Framer
- Notion
- Linear
- Figma

but **do not copy their UI**.

Create a unique Virtual Studio design language.

---

# 2. IMPORTANT CHANGE — MODAL → FULL PAGE

The current creation experience uses modals.

Replace this completely.

### Old

Dashboard → Click Create → Modal → Modal → Modal → Generate

### New

Dashboard → Create → Full-page Creation Studio → Step-by-step creation → Generate

The creation experience should occupy the complete application content area.

Do NOT use a centered modal for the main creation process.

Use a spacious application page with:

```text
┌──────────────────────────────────────────────────────────────┐
│ Virtual Studio                         Save Draft     Exit ✕ │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│  CREATION     │              CREATION CONTENT                │
│  PROGRESS     │                                              │
│               │                                              │
│  01 Setup     │                                              │
│  02 Template  │                                              │
│  03 Content   │                                              │
│  04 Style     │                                              │
│  05 Review    │                                              │
│               │                                              │
│               │                                              │
├───────────────┴──────────────────────────────────────────────┤
│                         Back          Continue →              │
└──────────────────────────────────────────────────────────────┘
```

The page should feel premium, calm, spacious and focused.

---

# 3. VISUAL LANGUAGE

Use the existing Virtual Studio dashboard as the primary visual reference.

The provided dashboard uses:

- Clean white / very light backgrounds
- Royal blue / indigo primary color
- Soft blue gradients
- Rounded cards
- Large friendly typography
- Subtle shadows
- Thin borders
- Spacious layouts
- Blue primary CTAs
- Soft grey secondary text
- Rounded pills
- Modern iconography
- Large visual cards
- Premium SaaS aesthetic

Preserve this visual identity.

### Suggested visual system

Primary:

- Royal Blue
- Indigo
- Soft blue gradients

Background:

- #F7F9FC style neutral background
- White content surfaces

Cards:

- White
- 12–20px radius
- Very subtle border
- Very subtle shadow

Buttons:

- Primary blue filled button
- Secondary white/outlined button
- Text buttons for low-priority actions

Typography:

- Modern sans-serif
- Strong hierarchy
- Large page headings
- Medium-weight labels
- Muted supporting text

Avoid:

- Excessive gradients
- Excessive glassmorphism
- Heavy shadows
- Overly colorful UI
- Cluttered forms
- Long vertical forms
- Modal-heavy interactions

---

# 4. CREATION STUDIO HEADER

Every creation flow should have the same header.

Example:

```text
← Back to Dashboard

Create
[ Video ] [ AI Presentation ] [ Presentation Design ]

                                      Save Draft    Exit
```

The selected creation type should be visually highlighted.

Alternative:

When entering from a specific dashboard card, show:

```text
← Back

Create Video
Turn your idea into a polished video.

Step 1 of 4
```

The creation type can also appear as a small icon + badge.

---

# 5. UNIVERSAL STEP STRUCTURE

Create a common step architecture:

### STEP 01 — PROJECT SETUP

### STEP 02 — STARTING POINT

### STEP 03 — CONTENT

### STEP 04 — STYLE & FORMAT

### STEP 05 — REVIEW & CREATE

Not every product needs every field.

The step system should dynamically render fields based on creation type.

Do NOT create completely different step structures.

---

# 6. STEP 01 — PROJECT SETUP

Move Workspace and Folder selection to the FIRST step for all three experiences.

This solves the current inconsistency.

## Project Setup UI

Create a clean two-column layout:

```text
Project Setup

Give your project a home.

┌───────────────────────────────────┐
│ Project Name                      │
│ My New Presentation               │
└───────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ Workspace        │ │ Folder           │
│ Marketing        │ │ Campaigns        │
│        ↓         │ │        ↓         │
└──────────────────┘ └──────────────────┘
```

### Video

Show:

- Name
- Workspace
- Folder

### AI Presentation

Show:

- Workspace
- Folder
- Project Name is AUTO-GENERATED

Display:

> Your presentation name will be generated automatically from your content. You can edit it later.

Allow an optional "Edit name" action.

### Presentation Design

Show:

- Name
- Workspace
- Folder

This fixes the current missing presentation name.

---

# 7. STEP 02 — STARTING POINT

This step must be COMMON across all three creation experiences.

Present two large cards:

```text
How would you like to start?

┌────────────────────────────┐
│                            │
│        ✨                  │
│                            │
│   Start with Blank         │
│                            │
│   Start from scratch       │
│   and build your design.   │
│                            │
│                Selected ○  │
└────────────────────────────┘


┌────────────────────────────┐
│                            │
│        ◈                   │
│                            │
│   Use a Template            │
│                            │
│   Start with a professionally│
│   designed template.        │
│                            │
│                ○           │
└────────────────────────────┘
```

Use large selectable cards rather than dropdowns.

The selected card should have:

- Blue border
- Soft blue background
- Check indicator
- Subtle elevation

---

# 8. TEMPLATE DRAWER — IMPORTANT

When the user selects:

> Use a Template

DO NOT open a modal.

Instead, open a **large right-side Template Explorer Drawer**.

The drawer should slide from the right.

Example:

```text
MAIN CREATION PAGE
───────────────────────────────────────────────┐
                                                │
                                                │
                                                │
                                                │
                                                │
                                                │
                                                │
                                                │
                                                │
                                                │
                                   ┌────────────┴───────────────┐
                                   │ Templates                 │
                                   │                           │
                                   │ Search templates...       │
                                   │                           │
                                   │ Categories                │
                                   │ All  Business  Education  │
                                   │ Marketing  Pitch          │
                                   │                           │
                                   │ ┌───────┐ ┌───────┐       │
                                   │ │       │ │       │       │
                                   │ │ Temp  │ │ Temp  │       │
                                   │ │       │ │       │       │
                                   │ └───────┘ └───────┘       │
                                   │                           │
                                   │ ┌───────┐ ┌───────┐       │
                                   │ │       │ │       │       │
                                   │ │ Temp  │ │ Temp  │       │
                                   │ └───────┘ └───────┘       │
                                   │                           │
                                   │              Select →     │
                                   └───────────────────────────┘
```

### Drawer behavior

Drawer width:

Approximately 420–520px.

Use:

- Search
- Categories
- Filters
- Aspect ratio filter
- Template cards
- Template preview
- Hover interactions
- Selected state
- Apply/Use Template button

The main page should remain visible behind the drawer.

The drawer should feel like a professional asset browser.

---

# 9. TEMPLATE + ASPECT RATIO LOGIC

Aspect ratio must be handled intelligently.

### Video

Only:

**16:9**

Do not show unnecessary aspect-ratio choices.

### AI Presentation

Options:

- 16:9
- 4:3

Templates should automatically filter according to the selected aspect ratio.

Example:

```text
Aspect Ratio

[ 16:9 Selected ]   [ 4:3 ]
```

Changing the aspect ratio updates the template results.

### Presentation Design

If presentation templates support multiple aspect ratios, use the same reusable aspect-ratio component.

If not applicable, hide the control.

Do not show irrelevant controls.

---

# 10. STEP 03 — CONTENT

This step should dynamically change depending on creation type.

---

## VIDEO

Video content should contain:

### Template

If user selected "Use Template":

Show selected template preview.

### Video Configuration

Include:

- Video content / script
- Optional prompt
- Voice
- Duration if supported

Keep the interface visual and simple.

---

## AI PRESENTATION

Show:

### Prompt

Large AI prompt editor.

Example:

```text
What do you want to create?

┌──────────────────────────────────────────┐
│ Create a presentation about...            │
│                                          │
│                                          │
│                                          │
└──────────────────────────────────────────┘
```

Below it:

### Voice & Tone

Selectable cards/pills.

Examples:

- Professional
- Friendly
- Inspirational
- Educational
- Persuasive

### Audience

Examples:

- Executives
- Students
- Customers
- Employees
- General Audience

### Purpose

Examples:

- Educate
- Pitch
- Sell
- Report
- Train

### Optional Outline

Expandable section:

```text
＋ Add presentation outline
```

If expanded:

```text
Slide 1 — Introduction
Slide 2 — Problem
Slide 3 — Solution
Slide 4 — Benefits
...
```

Use drag-and-drop ordering.

---

## PRESENTATION DESIGN

Presentation Design is primarily template-driven.

Show:

- Selected template
- Presentation title
- Optional description
- Basic content information

Keep it lighter than AI Presentation Generation.

---

# 11. STEP 04 — STYLE & FORMAT

Use one consistent style step across the products.

---

## AI PRESENTATION

Show:

### Theme

Two clear tabs:

```text
Theme

[ Your Brand Kits ]   [ Discover Themes ]
```

Brand Kit cards should show:

- Brand name
- Logo
- Primary color
- Secondary color
- Typography preview

Discover Themes should show visual theme cards.

---

### Aspect Ratio

```text
16:9
Widescreen

4:3
Standard
```

Use large visual cards.

---

### Template

If the template was not already selected:

Allow template selection here.

However, the primary template entry point should still be the common "Starting Point" step.

---

### Slide Count

Only show this when:

**Start with Blank**

Do not show it when a template already determines slide structure.

Example:

```text
Number of slides

  −    10    +
```

---

### Text Content Style

Cards:

- Minimal
- Balanced
- Detailed
- Editorial

---

### Image Source

Options:

- AI Generated
- Stock Images
- Upload Images
- Brand Library

---

### Image Style

Options:

- Photorealistic
- Illustration
- 3D
- Minimal
- Editorial
- Abstract

Use visual previews rather than plain dropdowns.

---

## VIDEO

Show only relevant options:

- Aspect ratio: 16:9
- Voice
- Visual style
- Other video-specific settings

Do not show presentation-specific controls.

---

## PRESENTATION DESIGN

Show:

- Theme / brand
- Aspect ratio if supported
- Template configuration
- Design preferences

---

# 12. STEP 05 — REVIEW & CREATE

Create a beautiful final review screen.

Example:

```text
Ready to create?

┌─────────────────────────────────────────┐
│                                         │
│       Project Preview                   │
│                                         │
│       [ Large preview ]                 │
│                                         │
└─────────────────────────────────────────┘

Project
My Marketing Presentation

Workspace
Marketing

Folder
Campaigns

Template
Modern Business

Format
16:9

──────────────────────────────────────────

                    ← Back

                    Create Presentation →
```

The CTA should dynamically change:

- Create Video
- Generate Presentation
- Create Presentation

Use a strong blue primary CTA.

---

# 13. LEFT STEP NAVIGATION

Use a vertical stepper.

Example:

```text
CREATE VIDEO

● 01
  Project Setup

│
● 02
  Starting Point

│
○ 03
  Content

│
○ 04
  Style & Format

│
○ 05
  Review
```

Completed steps:

- Blue filled circle
- Check icon

Current step:

- Blue ring
- Strong label

Upcoming steps:

- Grey

Allow clicking previous completed steps.

Do not allow skipping required steps.

---

# 14. COMMON COMPONENT ARCHITECTURE

Build reusable components.

Conceptually:

```text
CreationStudio
│
├── CreationHeader
│
├── CreationTypeSwitcher
│
├── CreationStepper
│
├── CreationStepContainer
│
├── ProjectSetupStep
│
├── StartingPointStep
│
├── TemplateExplorerDrawer
│
├── ContentStep
│   ├── VideoContent
│   ├── AIPresentationContent
│   └── PresentationDesignContent
│
├── StyleFormatStep
│   ├── VideoStyle
│   ├── PresentationStyle
│   └── PresentationDesignStyle
│
├── ReviewStep
│
└── CreationFooter
```

The architecture should make it easy to add:

- Image Generation
- Canvas
- Future AI creation tools

later without rebuilding the entire creation system.

---

# 15. MINDMAP

Use this as the conceptual product flow:

```text
                         VIRTUAL STUDIO
                               │
                       CREATE / CREATION
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Creation Type          Common Shell
                    │                     │
       ┌────────────┼────────────┐        │
       │            │            │        │
     VIDEO       AI PPT     PRESENTATION  │
                             DESIGN       │
       │            │            │        │
       └────────────┼────────────┘        │
                    │                     │
              01 PROJECT SETUP ◄─────────┘
                    │
          ┌─────────┼─────────┐
          │         │         │
        Name    Workspace    Folder
          │         │         │
          └─────────┼─────────┘
                    │
             02 STARTING POINT
                    │
             ┌──────┴──────┐
             │             │
        START BLANK    USE TEMPLATE
                           │
                           ▼
                  TEMPLATE DRAWER
                           │
                ┌──────────┼──────────┐
                │          │          │
              Search   Categories   Aspect Ratio
                │          │          │
                └──────────┼──────────┘
                           │
                    Select Template
                           │
                           ▼
                    03 CONTENT
                           │
             ┌─────────────┼─────────────┐
             │             │             │
           VIDEO         AI PPT       PRESENTATION
             │             │             │
          Script       Prompt etc.    Basic content
             │             │             │
             └─────────────┼─────────────┘
                           │
                   04 STYLE & FORMAT
                           │
             ┌─────────────┼─────────────┐
             │             │             │
          Video Style   Theme/Brand    Design Style
                           │
                      Aspect Ratio
                           │
                      Image Settings
                           │
                           ▼
                     05 REVIEW
                           │
                           ▼
                         CREATE
```

---

# 16. DIAGRAMMATIC FLOW

Create the actual UI flow according to this logic:

```text
DASHBOARD
    │
    ▼
CREATE
    │
    ├──────────────┬──────────────────────┐
    │              │                      │
    ▼              ▼                      ▼
CREATE VIDEO    AI PRESENTATION     PRESENTATION DESIGN
    │              │                      │
    └──────────────┼──────────────────────┘
                   ▼
             PROJECT SETUP
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
        NAME   WORKSPACE   FOLDER
                   │
                   ▼
          STARTING POINT
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
     START BLANK       USE TEMPLATE
                            │
                            ▼
                    RIGHT TEMPLATE DRAWER
                            │
                    ┌───────┼────────┐
                    ▼       ▼        ▼
                  SEARCH CATEGORY FILTER
                            │
                            ▼
                     SELECT TEMPLATE
                            │
                            ▼
                         CONTENT
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
           VIDEO          AI PPT      PRESENTATION
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     STYLE & FORMAT
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
          VIDEO STYLE    AI PPT STYLE   DESIGN STYLE
                            │
                       Theme / Brand
                            │
                       Aspect Ratio
                            │
                    Image / Text Style
                            │
                            ▼
                          REVIEW
                            │
                            ▼
                    CREATE / GENERATE
                            │
                            ▼
                       PROCESSING
                            │
                            ▼
                         EDITOR
```

---

# 17. IMPORTANT CONDITIONAL LOGIC

Implement the following behavior.

### Workspace / Folder

Always Step 01.

Never ask these in a later step.

---

### Project Name

Video:

```text
User enters name
```

Presentation Design:

```text
User enters name
```

AI Presentation:

```text
AI generates name automatically
```

But allow:

```text
Edit name
```

before creation.

---

### Template

All three:

```text
Start Blank
OR
Use Template
```

If:

```text
Use Template
```

open the reusable right-side Template Explorer Drawer.

---

### AI Presentation Slide Count

If:

```text
Blank
```

show Slide Count.

If:

```text
Template
```

hide Slide Count unless the selected template explicitly supports changing the number of slides.

---

### Aspect Ratio

Video:

```text
16:9 only
```

AI Presentation:

```text
16:9 / 4:3
```

Presentation Design:

```text
Only show supported ratios
```

Never display irrelevant options.

---

# 18. RESPONSIVE BEHAVIOR

Desktop should be the primary experience.

For smaller screens:

- Collapse left stepper into a horizontal progress bar
- Convert template drawer into a full-screen sheet
- Stack form fields
- Keep CTA sticky at bottom
- Preserve visual hierarchy

---

# 19. MICRO-INTERACTIONS

Make the experience feel premium.

Add:

- Smooth page transitions
- Step transition animations
- Card hover elevation
- Selected card animation
- Template drawer slide animation
- Template preview hover
- Checkmark animation
- Progress indicator animation
- Button loading state
- Skeleton loading for templates
- Smooth validation messages
- Autosave indicator

Use subtle animations.

Do not over-animate.

---

# 20. TEMPLATE EXPERIENCE

Template cards should feel visually rich.

Each card should contain:

```text
┌─────────────────────────────┐
│                             │
│        TEMPLATE PREVIEW     │
│                             │
│                             │
├─────────────────────────────┤
│ Modern Business             │
│ Business                    │
│ 16:9                        │
└─────────────────────────────┘
```

On hover:

```text
Preview
Use Template
```

On selection:

- Blue outline
- Checkmark
- Selected badge

Provide a larger template preview when needed.

---

# 21. DASHBOARD ENTRY

Update the existing Quick Create cards so they launch the new Creation Studio.

Existing cards:

```text
Avatar Video
AI Presentation Generation
Presentation Design
AI Image Generation
Canvas Editing
```

For this redesign, only:

```text
Avatar Video
AI Presentation Generation
Presentation Design
```

should use the new unified Creation Studio.

Do not change:

```text
AI Image Generation
Canvas Editing
```

yet.

---

# 22. IMPORTANT UX GOAL

The user should feel:

> "I am entering one Creation Studio and choosing what I want to create."

NOT:

> "I am opening three different tools with three different workflows."

The three products should therefore share the same mental model:

```text
SETUP
  ↓
START
  ↓
CONTENT
  ↓
STYLE
  ↓
REVIEW
  ↓
CREATE
```

---

# 23. FINAL UI QUALITY BAR

The final result should look like a polished production SaaS product, not a generic form generator.

Prioritize:

- Strong visual hierarchy
- Minimal cognitive load
- Spacious layouts
- Large visual cards
- Clear step progression
- Contextual controls
- Smart conditional fields
- Premium template browsing
- Consistent components
- Excellent empty states
- Excellent loading states
- Excellent hover states
- Keyboard accessibility
- Clear focus states
- Responsive behavior

The experience should visually belong to the existing **Virtual Studio dashboard** shown in the reference image.

Use the dashboard's blue/indigo visual identity, rounded cards, clean white surfaces, subtle borders, soft shadows and modern SaaS aesthetic as the foundation.

The final result should feel like a **next-generation unified AI Creation Studio** rather than a collection of forms.