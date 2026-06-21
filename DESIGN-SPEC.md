# Design Specification
## ResearchOS — Agentic Synthetic User Research Platform

---

**Version:** 0.1 (Phase 2 — Design)
**Date:** 2026-06-16
**Author:** Deep Purohit
**Status:** Draft
**Linked PRD:** `PRD-ResearchOS.md`
**Linked Tech Spec:** `TECH-SPEC.md`

---

## Table of Contents

1. [Brand Direction](#1-brand-direction)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Logo Direction](#4-logo-direction)
5. [Visual Language](#5-visual-language)
6. [UI Component Aesthetics](#6-ui-component-aesthetics)
7. [UI Flow — Screen Map](#7-ui-flow--screen-map)
8. [Screen Specifications & Copy](#8-screen-specifications--copy)
   - Screen 1 — Landing Page
   - Screen 2 — Intake Form
   - Screen 3 — Loading: Persona Generation
   - Screen 4 — Gate 1: Persona Review & Edit
   - Screen 5 — Loading: Interview Guide Generation
   - Screen 6 — Gate 2: Interview Guide Review & Edit
   - Screen 7 — Loading: Interview Simulation
   - Screen 8 — Gate 3: Transcript Review
   - Screen 9 — Loading: Synthesis
   - Screen 10 — Report View & Export
9. [Resolved Design Decisions](#9-resolved-design-decisions)

---

## 1. Brand Direction

**The positioning:** Not a SaaS tool. A research studio that happens to run on AI. Think less "productivity app," more "creative agency meets intelligence platform."

**The feeling:** Walking into a high-end studio at night. Dark, focused, premium. But alive — there's color, there's personality, it doesn't take itself too seriously.

**Brand voice:**
- Confident but not arrogant
- Smart but not academic
- Direct, no fluff
- Personality-driven, not robotic
- Treats the user as intelligent
- Never over-explains

**Design references:**
- **Linear** — dark, sharp, premium SaaS done right
- **Framer** — Gen Z energy, gradient, bold type
- **Arc Browser** — personality-driven, not corporate
- **Raycast** — dark mode done expensively
- **Loewe brand site** — how luxury uses space and type

---

## 2. Color System

### 2.1 Base Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Background | Void | `#07070F` | Page background — near black with blue undertone |
| Surface | Obsidian | `#0F0F1A` | Cards, panels, modals |
| Surface raised | Slate | `#16162A` | Hover states, elevated cards |
| Border | Dim | `#2A2A45` | Dividers, card outlines |
| Text primary | Cream | `#F0EEE8` | Headings, body copy |
| Text secondary | Mist | `#8B8BA7` | Subtitles, labels, metadata |

### 2.2 Accent Palette

| Role | Name | Hex | Usage |
|---|---|---|---|
| Primary accent | Iris | `#7C5CFC` | CTAs, active states, links, highlights |
| Secondary accent | Volt | `#C8F135` | Callouts, badges, success states — use sparingly |
| Tertiary accent | Blush | `#FF6B8A` | Warnings, delete actions, emotional tone |
| Glow | Iris glow | `#7C5CFC` at 15% opacity | Soft glow behind accent elements |

### 2.3 Rationale

Void + Iris = intelligent, premium, slightly mysterious. Volt as the surprise accent — a single bright lime/yellow on a dark field is the Gen Z signature move (seen in Perplexity, Linear, Raycast). Blush keeps it from feeling cold. Never use pure white (`#FFFFFF`) — always use Cream (`#F0EEE8`).

---

## 3. Typography

### 3.1 Font Stack

| Role | Font | Source | Usage |
|---|---|---|---|
| Display | **Clash Display** | fontshare.com (free) | Hero headlines, large section titles |
| Body | **Inter** | Google Fonts (free) | All body copy, labels, UI text |
| Mono | **Geist Mono** | vercel.com/font (free) | Data output, agent labels, persona IDs, status tags |

### 3.2 Type Scale

| Name | Size | Weight | Font | Usage |
|---|---|---|---|---|
| Hero | 72–96px | 600 | Clash Display | Landing page headline |
| H1 | 48px | 600 | Clash Display | Page titles |
| H2 | 32px | 500 | Clash Display | Section headings |
| H3 | 20px | 600 | Inter | Card titles, gate headings |
| Body | 16px | 400 | Inter | All readable content |
| Small | 14px | 400 | Inter | Labels, metadata, helper text |
| Micro | 12px | 500 | Inter | Badges, tags, status pills |
| Code | 13px | 400 | Geist Mono | Agent labels, IDs, data elements |

### 3.3 Type Rules

- Headlines: letter-spacing `-0.02em`
- Display text: gradient fill on key words (Iris → lighter violet)
- Never pure white — always Cream
- Everything system-generated (agent labels, IDs, step numbers) uses Geist Mono in Mist

**Gradient headline CSS:**
```css
background: linear-gradient(135deg, #7C5CFC 0%, #A78BFA 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## 4. Logo Direction

### 4.1 Concept — The Lens Mark

A minimal abstract mark — a partial circle (like a research viewfinder or lens aperture) with a sharp diagonal cut. Represents observation, focus, insight.

```
   ◐  ResearchOS
```

### 4.2 Wordmark Styling

- "Research" in Clash Display, Cream, weight 500
- "OS" in Clash Display, Iris (`#7C5CFC`), weight 600
- Slight letter-spacing on "OS": `0.05em`
- Contrast communicates: research (human, thoughtful) + OS (system, intelligent)

**Alternative — studio wordmark:**
```
researchos
```
All lowercase in Clash Display feels more studio, less enterprise. Use for the product UI; use capitalized version for formal brand materials.

### 4.3 Logo Variations

| Variant | Use case |
|---|---|
| Full: mark + wordmark (horizontal) | Nav bar, marketing |
| Compact: mark only | Favicon, loading state, small contexts |
| Dark bg: Cream wordmark + Iris "OS" | All product screens |
| Light context (rare): Void + Iris | Print, external materials |

---

## 5. Visual Language

Five motifs that define the aesthetic:

### 5.1 Grain Overlay
A subtle noise/grain texture on all dark surfaces at 3–5% opacity. Makes dark backgrounds feel rich instead of flat.
```css
/* Apply a PNG grain overlay as a pseudo-element */
opacity: 0.04;
mix-blend-mode: overlay;
```

### 5.2 Iris Glow Orbs
Soft blurred gradient orbs in the background. 1–2 on the landing hero. Gives depth without distraction.
```css
background: radial-gradient(
  ellipse at 30% 40%,
  rgba(124, 92, 252, 0.12) 0%,
  transparent 70%
);
```

### 5.3 Bento Grid Layout
Feature sections use asymmetric card grids with varying sizes. Cards: `border: 1px solid #2A2A45` with subtle Iris inner glow on hover.

### 5.4 Gradient Text on Key Words
Selected words in headlines use gradient fill. Used on 1–2 words per headline maximum — not every headline.

### 5.5 Monospace Data Elements
Everything system-generated uses Geist Mono in Mist. Creates contrast between human content (Clash Display, Cream) and machine output (Geist Mono, Mist). This is the detail that makes it feel like a studio, not a chatbot wrapper.

---

## 6. UI Component Aesthetics

### Cards
```
Background:    #0F0F1A
Border:        1px solid #2A2A45
Border-radius: 12px
Padding:       24px
Hover:         border-color → rgba(124, 92, 252, 0.4)
Box-shadow:    0 4px 24px rgba(0, 0, 0, 0.4)
```

### Primary Button (CTA)
```
Background:    #7C5CFC
Text:          #F0EEE8, Inter 14px 600
Border-radius: 8px
Padding:       12px 24px
Hover:         brightness(1.1) + subtle glow
Active:        brightness(0.95)
```

### Secondary Button
```
Background:    transparent
Border:        1px solid #2A2A45
Text:          #8B8BA7, Inter 14px 500
Hover:         border-color → #7C5CFC at 40%, text → Cream
```

### Pills / Badges
```
Background:    rgba(124, 92, 252, 0.12)
Border:        1px solid rgba(124, 92, 252, 0.3)
Text:          #A78BFA, Geist Mono 12px 500
Border-radius: 100px
Padding:       4px 10px
```

### Status Pills
```
Complete:   Volt bg (rgba(200, 241, 53, 0.12)) · Volt border · Volt text
In progress: Iris bg · Iris border · Iris text + pulse animation
Failed:     Blush bg · Blush border · Blush text
Excluded:   Dim bg · Dim border · Mist text
```

### Loading / Progress States
Pulsing Iris glow — not a spinning circle. Ambient animation, not mechanical spinners.
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(124, 92, 252, 0.3); }
  50%       { box-shadow: 0 0 20px rgba(124, 92, 252, 0.6); }
}
```

### Form Fields
```
Background:    #0F0F1A
Border:        1px solid #2A2A45
Border-radius: 8px
Padding:       14px 16px
Text:          Cream, Inter 16px 400
Placeholder:   Mist
Focus:         border-color → #7C5CFC
Error:         border-color → #FF6B8A
Label:         Mist, Inter 13px 500, uppercase, letter-spacing 0.05em
```

---

## 7. UI Flow — Screen Map

```
[Screen 1]  Landing Page
                ↓  CTA click
[Screen 2]  Intake Form
                ↓  Submit
[Screen 3]  Loading — Persona Generation
                ↓  Agent 1 complete
[Screen 4]  Gate 1: Persona Review & Edit        ← USER GATE
                ↓  Confirm
[Screen 5]  Loading — Interview Guide Generation
                ↓  Agent 2 complete
[Screen 6]  Gate 2: Interview Guide Review & Edit ← USER GATE
                ↓  Confirm
[Screen 7]  Loading — Interview Simulation
                ↓  Agent 3 complete
[Screen 8]  Gate 3: Transcript Review            ← USER GATE
                ↓  Confirm
[Screen 9]  Loading — Synthesis
                ↓  Agent 4 complete
[Screen 10] Report View & Export                 ← USER GATE
```

**What users can do at each gate:**

| Gate | Permitted actions |
|---|---|
| Gate 1 — Personas | Edit any field · Delete · Regenerate one · Add manually |
| Gate 2 — Guide | Edit question / intent / probes · Delete · Regenerate one · Add |
| Gate 3 — Transcripts | Regenerate a persona's interview · Exclude from synthesis · No direct editing |
| Gate 4 — Report | Edit hypothesis / recommendation text · Delete · Reorder recommendations |

---

## 8. Screen Specifications & Copy

---

### Screen 1 — Landing Page

**Purpose:** Introduce the product, establish trust, drive the user to start a run.

**Layout:** Full-width single-scroll page. Fixed top nav. Three content sections. Sticky bottom CTA on scroll.

---

**Nav bar**
```
researchos                    How it works    Start Research →
```

**Hero section**
```
[pill badge — Geist Mono, Iris]
AI Research Studio

[H1 — Clash Display 80px, Cream, gradient on last word]
Research that thinks.
Insights that ship.

[body — Inter 18px, Mist]
Your next product decision needs research.
Not next month — now. ResearchOS runs the full study:
personas, interviews, synthesis — and hands you hypotheses
ready to act on. No participants. No scheduling.
No synthesis debt.

[CTA button — Iris]
Start a Research Run →

[micro — Inter 12px, Mist]
~3 minutes · Synthetic personas · No participants needed
```

**How it works section**
```
[label — Geist Mono, Mist]
THE PIPELINE

[H2 — Clash Display]
Four agents. One output.
Zero scheduling.

01 / Describe your problem
Tell us what you're building and what you need to learn.
That's the whole setup.

02 / We build your personas
AI generates a MECE set of distinct user archetypes
across your target population — no two alike.

03 / We run the interviews
Each persona answers your research questions in character.
Parallel. In minutes.

04 / You get hypotheses
Not themes. Not a wall of quotes. Specific, testable
hypotheses and ranked recommendations. Ready to act on.
```

**Honest positioning section**
```
[H2 — Clash Display]
Built for discovery.
Honest about its limits.

[Left — label Geist Mono, Mist]     [Right — label Geist Mono, Mist]
WHAT IT'S FOR                        NOT A SUBSTITUTE FOR
· Problem discovery                  · Usability testing
· Segment mapping                    · Statistical research
· Assumption surfacing               · Behavioral observation
· Hypothesis generation              · Longitudinal studies
· Prioritisation signal              · High-stakes decisions

[note — Inter 14px, Mist]
We'll remind you of this every time you get a report.
Synthetic research is a starting point, not a finish line.
```

**Footer CTA**
```
[H2 — Clash Display]
Ready to run your first study?

[body — Mist]
Three minutes to set up.
Less than that to read the output.

[CTA]
Start Research →

[disclaimer — Geist Mono 11px, Mist]
ResearchOS uses synthetic AI personas.
Output is directional, not statistically validated.
```

**Interactions:**
- Any CTA → Screen 2
- "How it works" anchor → smooth scroll
- Sticky CTA appears after scrolling past hero

---

### Screen 2 — Intake Form

**Purpose:** Capture minimum context to condition all four agents. Quality gate — vague input compounds downstream.

**Layout:** Centered single-column, max 720px. Progress indicator top. Back arrow to Screen 1.

---

**Page header**
```
[progress — Geist Mono, Mist]
01 / RESEARCH SETUP

[H1 — Clash Display]
Set up your study.

[sub — Inter, Mist]
The more specific you are, the sharper your output.
```

**Field 1 — Product description**
```
Label:        Describe your product and the problem it solves.
Placeholder:  e.g., We're building a tool that helps solo founders
              track MRR without a finance background. It connects
              to Stripe and shows revenue in plain English —
              no spreadsheets needed.
Helper:       Minimum 50 characters — this shapes your entire run.
Error:        Add more detail. This is how we build your personas.
```

**Field 2 — Target user**
```
Label:        Who is your target user?
Placeholder:  e.g., Non-technical solo founders running B2B SaaS
              products under $10K MRR who manage their own finances.
Helper:       Be specific. "Anyone" produces generic personas.
Error:        Be more specific about who you're designing for.
```

**Field 3 — Research goal**
```
Label:        What's the one question this research should answer?
Placeholder:  e.g., What are the biggest friction points founders
              face when trying to understand their revenue trends?
Helper:       Frame this as a discovery question — "what" or "how"
              works better than "does this work?" or "will users like X?"
Error:        Give us a research question to anchor the study.
```

**Field 4 — Product stage**
```
Label:   Where is your product right now?
Options: Just an idea  ·  Pre-MVP  ·  Live MVP  ·  Post-launch
```

**Field 5 — Persona count**
```
Label:      How many user personas?
Helper:     5 is the sweet spot for most studies.
Range:      2 minimum · 8 maximum
```

**Field 6 — Question count**
```
Label:      How many interview questions per persona?
Helper:     6 questions gives enough depth without fatigue.
Range:      4 minimum · 8 maximum
```

**Cost + time estimate**
```
Estimated run:  ~3 min · ~$0.28
                Updates as you adjust persona and question count.
```

**Actions**
```
Primary CTA:  Generate Personas →   [disabled until all fields valid]
Back:         ← Back

Validation error (on submit):
              Fix the highlighted fields to continue.
```

**Interactions:** Inline validation on blur · Cost estimate recalculates live · Submit → Screen 3

---

### Screen 3 — Loading: Persona Generation

**Purpose:** Show the pipeline is running, set expectations for what comes next.

**Layout:** Centered, vertically centered in viewport. Minimal.

---

```
[agent label — Geist Mono, Mist]
AGENT 01 / PERSONA GENERATION

[H2 — Clash Display, Cream]
Building your personas...

[body — Inter, Mist]
Mapping your user population and generating
distinct archetypes across the behavioral spectrum.

[pipeline mini-map — Geist Mono, small]
● Personas  ○ Guide  ○ Interviews  ○ Synthesis

[time estimate — Inter 13px, Mist]
Usually under 30 seconds.
```

**Error state**
```
[H3]   Persona generation failed.
[body] This sometimes happens with very niche inputs.
       Try being more specific about your target user.

[actions]  Edit setup    Retry →
```

**Transition:** Agent 1 response received and validated → Screen 4

---

### Screen 4 — Gate 1: Persona Review & Edit

**Purpose:** Human quality gate. Verify the persona set before simulation runs.

**Layout:** Full-width. Progress indicator top. Card grid (2–3 col). Action bar bottom.

---

**Page header**
```
[progress — Geist Mono, Mist]
02 / PERSONA REVIEW

[H1 — Clash Display]
Meet your research participants.

[sub — Inter, Mist]
These are the people we'll interview. Check they represent
the range of users you care about — edit, regenerate,
or add anyone missing.
```

**Persona card**
```
[source badge — pill, Geist Mono]
AI Generated  /  Edited  /  You added

[name — H3, Cream]        Priya Menon
[role pill — Geist Mono]  Product Manager · 31 · Bangalore

Background    [text — Inter, Mist]
Goals         · [goal 1]
              · [goal 2]
Frustrations  · [frustration 1]
              · [frustration 2]
Their take    "[quote — Inter italic, Cream]"

[card actions]  Edit    Regenerate    ✕
```

**Regenerating state (on card)**
```
Regenerating [Name]...    [pulse animation]
```

**Edit panel (slide-in from right)**
```
[title]   Edit persona

Fields:   Name  ·  Age  ·  Role  ·  Location
          Background  ·  Goals  ·  Frustrations  ·  Their take

[actions]
Save changes         [primary]
Cancel               [secondary]
Remove persona       [destructive, bottom of panel]
```

**Delete confirmation**
```
Remove [Name] from this study?
They won't be interviewed and won't appear in synthesis.

Remove    Keep
```

**Add persona**
```
[button]       + Add a persona

[panel title]  Add a persona
[fields]       Same as edit panel
[actions]      Add to study    Cancel
```

**Page actions**
```
Primary CTA:   Confirm & Generate Questions →
Back:          ← Edit setup

Back confirmation:
               Going back will restart your run.
               Your personas won't be saved.

               Start over    Stay here
```

**Error / limit states**
```
Min not met:   Add at least 2 personas to continue.
Max reached:   You've reached the 8 persona limit.
```

**Interactions:** Edit → slide-in panel · Regenerate → spinner on card → refresh · Delete → confirmation → card fades · Confirm → saves modified personas to session → Screen 5

---

### Screen 5 — Loading: Interview Guide Generation

**Purpose:** Show progress while Agent 2 runs.

**Layout:** Same as Screen 3.

---

```
[agent label — Geist Mono, Mist]
AGENT 02 / INTERVIEW GUIDE

[H2 — Clash Display]
Writing your questions...

[body — Mist]
Designing questions that work for every persona
and stay grounded in your research goal.

[pipeline mini-map]
✓ Personas  ● Guide  ○ Interviews  ○ Synthesis

[time estimate]
Usually under 20 seconds.
```

**Error state**
```
Question generation failed. Your personas are saved.

Edit setup    Retry →
```

---

### Screen 6 — Gate 2: Interview Guide Review & Edit

**Purpose:** Verify questions will probe the right areas before 30 LLM simulation calls run.

**Layout:** Full-width. Progress top. Single-column question list. Action bar bottom.

---

**Page header**
```
[progress — Geist Mono, Mist]
03 / GUIDE REVIEW

[H1 — Clash Display]
Your interview questions.

[sub — Mist]
These go to every persona. Make sure they probe
what you actually need to learn.
```

**Research goal callout**
```
[pill — Geist Mono, Iris]   RESEARCH GOAL
[text — Inter, Cream]       [user's research goal]
```

**Question card**
```
[number pill — Geist Mono]   WARM UP  /  Q1  /  Q2...  /  CLOSE

[question — H3, Cream]       [question text]

Why this question ↓          [intent — body, Mist, collapsible]

Probes ↓                     · [probe 1]
                             · [probe 2]
                             [collapsible]

[card actions]   Edit    Regenerate    ✕
```

**Inline edit state**
```
[field]    Question
[field]    Why this question
[field]    Probe 1
[field]    Probe 2
[actions]  Save    Cancel
```

**Regenerating state**
```
Rewriting this question...    [pulse on card]
```

**Add question**
```
[button]        + Add a question

[inline form]
Field:          Question
Field:          Why this question
Actions:        Save question    Cancel
```

**Page actions**
```
Primary CTA:  Confirm & Run Interviews →
Back:         ← Back to personas

Min not met:  Add at least 4 questions to continue.
Max reached:  Maximum 10 questions.
```

---

### Screen 7 — Loading: Interview Simulation

**Purpose:** Show parallel simulation progress. Longest step — must be informative enough to prevent abandonment.

**Layout:** Centered. Per-persona status rows. Overall progress.

---

```
[agent label — Geist Mono, Mist]
AGENT 03 / INTERVIEW SIMULATION

[H2 — Clash Display]
Running [N] interviews in parallel...

[body — Mist]
Each persona is answering your questions in character.
This is the longest step — sit tight.

[per-persona rows — Geist Mono]
◦  Priya Menon     · Product Manager  · Waiting...
◉  James Okafor   · Founder          · Responding... (Q3 of 6)
✓  Sara Chen       · Designer         · 6 of 6 answered
✓  Marcus Webb    · Engineer         · 6 of 6 answered
✕  Leila Hassan   · Researcher       · Interview failed

[overall — Inter, Mist]
4 of 5 interviews complete · 2m 14s elapsed

[context note — Inter 13px, Mist]
Responses reflect each persona's individual background —
not a script. Each answer is generated independently.

[pipeline mini-map]
✓ Personas  ✓ Guide  ● Interviews  ○ Synthesis
```

**Partial failure note**
```
One interview couldn't complete.
We'll continue with [N-1] personas and flag it in your report.
```

---

### Screen 8 — Gate 3: Transcript Review

**Purpose:** Read and validate interview quality before synthesis. Regenerate or exclude — no direct editing.

**Layout:** Split. Left sidebar: persona list. Right panel: selected transcript. Action bar bottom.

---

**Page header**
```
[progress — Geist Mono, Mist]
04 / TRANSCRIPT REVIEW

[H1 — Clash Display]
Read the interviews.

[sub — Mist]
Check the depth before we synthesise. Regenerate thin
responses or exclude a persona — no direct editing.
```

**Persona sidebar**
```
[label — Geist Mono, Mist]   PARTICIPANTS

Priya Menon      PM             ● Complete
James Okafor     Founder        ⚠ Thin responses
Sara Chen        Designer       ● Complete
Marcus Webb      Engineer       ○ Excluded
Leila Hassan     Researcher     ✕ Failed
```

**Transcript panel**
```
[name — H3, Cream]         Priya Menon
[role — Geist Mono, Mist]  Product Manager · Bangalore

[label — Geist Mono, Mist] INTERVIEW TRANSCRIPT

[question label — Geist Mono, Mist]   Q1 — WARM UP
[question — Inter 16px bold, Cream]
Tell me about your typical week when it comes to
understanding your product's financial health.

[response — Inter 16px, Cream]
[transcript text]

[tone badge]     Neutral  /  Positive  /  Negative  /  Mixed
[thin badge]     Thin response
```

**Persona actions**
```
[button]     Regenerate interview
[toggle]     Exclude from synthesis

Excluded:    Not included in synthesis
Regenerating: Rerunning [Name]'s interview...
```

**Contextual notes**
```
Thin responses:
Some responses here were shorter than expected.
You can regenerate or continue as-is.

Excluded:
Excluding this persona. Synthesis will reflect [N-1] interviews.
```

**Page actions**
```
Primary CTA:   Synthesise Insights →
Back:          ← Back to questions

Min not met:
You need at least 2 interviews to run synthesis.
Regenerate a failed interview or re-include an excluded persona.
```

---

### Screen 9 — Loading: Synthesis

**Purpose:** Show progress while Agent 4 runs. Sequenced messages show the 4-step chain.

**Layout:** Same minimal centered layout.

---

```
[agent label — Geist Mono, Mist]
AGENT 04 / SYNTHESIS + INSIGHT

[H2 — Clash Display — sequenced, updates as steps complete]
Step 1: Extracting themes across [N] interviews...
Step 2: Finding patterns between personas...
Step 3: Generating product hypotheses...
Step 4: Ranking your recommendations...

[body — Mist]
The deepest step. Cross-referencing every response
to surface what actually matters.

[pipeline mini-map]
✓ Personas  ✓ Guide  ✓ Interviews  ● Synthesis

[time estimate]
Almost there — usually under 60 seconds.
```

**Error state**
```
Synthesis failed. Your transcripts are saved.

Retry synthesis →
```

---

### Screen 10 — Report View & Export

**Purpose:** Full insight report. Readable, scannable. Editable hypotheses and recommendations. Permanent confidence disclaimer.

**Layout:** Full-width. Fixed top bar. Centered report column (max 800px). Permanent footer disclaimer.

---

**Top bar**
```
researchos      [research goal — truncated, Mist]      Copy report
```

**Report header**
```
[badge — Geist Mono, Volt pill]
RESEARCH COMPLETE

[H1 — Clash Display, Cream]
[Research goal restated as a declarative title]
e.g., "Understanding revenue friction for non-technical founders."

[meta — Geist Mono, Mist]
5 personas interviewed  ·  16 June 2026

[if partial — Blush]
4 of 5 personas  ·  1 excluded from synthesis
```

**Section 1 — Personas**
```
[section label — Geist Mono, Mist]
01 / PARTICIPANTS

Priya Menon        Product Manager       Bangalore
James Okafor       Founder               Lagos
Sara Chen          Designer              San Francisco
Marcus Webb        Engineer              London
Leila Hassan       Researcher            Berlin

[expand — link]    View full profile ↓
```

**Section 2 — Themes**
```
[section label — Geist Mono, Mist]
02 / WHAT WE FOUND

[theme card]
[title — H3, Cream]           The Setup Wall
[description — body, Mist]    [description]
[frequency — Geist Mono, Mist] Mentioned by 4 of 5 personas

[quote block — Inter italic]
"[verbatim quote]"
— Priya Menon, Product Manager

"[verbatim quote]"
— James Okafor, Founder
```

**Section 3 — Hypotheses**
```
[section label — Geist Mono, Mist]
03 / WHAT TO TEST NEXT

[hypothesis card]
[number — Geist Mono, Mist]   H1
[statement — body, Cream]
We believe reducing onboarding steps from 7 to 3 will
increase week-1 activation for non-technical founders
because they reported abandoning tools at the setup stage.

[confidence badge]   ● High confidence
[themes — pills]     Supported by: The Setup Wall · Tool Fatigue
[validate — Mist]    How to validate: Run a 5-person usability test
                     on the onboarding flow with non-technical founders.

[actions]   ✎ Edit    ✕ Remove
```

**Section 4 — Recommendations**
```
[section label — Geist Mono, Mist]
04 / WHAT TO DO

[rec row]
[rank — Geist Mono, Iris]    01
[action — Inter 16px, Cream]
Remove the manual API key configuration step
from the onboarding flow.

[rationale — Inter 14px, Mist]
4 of 5 personas described this as a drop-off point.

[tags]    ● High priority    ◎ Low effort

[drag handle]   ⠿
[actions]       ✎ Edit    ✕ Remove
```

**Confidence disclaimer (permanent footer)**
```
[label — Geist Mono, Mist]   ABOUT THIS REPORT

This report was generated using synthetic AI personas — not real users.
Use these findings as directional signal to generate and prioritise
hypotheses, not as validated conclusions.

The output reflects what people might say, not what they would do.
Consider validating the top hypothesis with 5 real users before
committing to a major product decision.
```

**Export**
```
[button — top bar]    Copy report
[toast]               Report copied to clipboard.

[clipboard fallback modal]
Title:                Copy your report
Sub:                  Select all and paste into Notion, Docs, or Slack.
[textarea — full markdown]
```

**Bottom of report**
```
[link]    Run another study →
```

**Undo toast (after delete)**
```
Removed.    Undo →    [5 second timeout, then permanent]
```

**Empty / degraded states**
```
No themes:
Not enough signal. Try adding more personas or
regenerating thin interviews.

Synthesis partial:
Some sections couldn't be generated.
Retry synthesis →    Continue with partial report
```

---

## 9. Resolved Design Decisions

| Decision | Resolution |
|---|---|
| Pipeline flow | Pause at every stage — 4 user review gates |
| Export format | Copy as markdown (web-rendered report, no PDF for MVP) |
| Error UX | Per-screen error state with Retry and Edit setup options |
| Persona / question count post-generation | Locked at intake; user can add/delete within gate screens |
| Confidence disclaimer | Permanently visible at bottom of Screen 10 — not dismissible |
| Section names in report | 01 / PARTICIPANTS · 02 / WHAT WE FOUND · 03 / WHAT TO TEST NEXT · 04 / WHAT TO DO |
| Progress indicator format | 0X / [SCREEN NAME] in Geist Mono (not "Step X of 5") |

---

*Document last updated: 2026-06-16*
*Next: Design screens in Figma using these specs as the brief*
