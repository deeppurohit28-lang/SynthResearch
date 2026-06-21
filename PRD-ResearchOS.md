# Product Requirements Document
## ResearchOS — Agentic Synthetic User Research Platform

---

**Version:** 0.2 (Phase 1 — Scope & Research, Deep-Dive Requirements)
**Date:** 2026-06-16
**Author:** Deep Purohit
**Status:** Draft
**Capstone:** AI Program · Cohort 6 · Phase 1 Deliverable

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Domain Understanding — The Research Lifecycle](#2-domain-understanding--the-research-lifecycle)
3. [Competitor Research](#3-competitor-research)
4. [Competitive Gap Analysis](#4-competitive-gap-analysis)
5. [Problem Statement](#5-problem-statement)
6. [Target Users](#6-target-users)
7. [Product Vision & Positioning](#7-product-vision--positioning)
   - 7.1 [Supported Research Types](#71-supported-research-types)
8. [Success Matrix](#8-success-matrix)
9. [Product Scope](#9-product-scope)
10. [MVP Pipeline Architecture](#10-mvp-pipeline-architecture)
11. [Product Requirements](#11-product-requirements)
    - 11.1 [Functional Requirements](#111-functional-requirements)
    - 11.2 [Non-Functional Requirements](#112-non-functional-requirements)
    - 11.3 [Cross-Cutting Requirements](#113-cross-cutting-requirements)
12. [User Stories](#12-user-stories)
13. [Assumptions & Constraints](#13-assumptions--constraints)
14. [Out of Scope (MVP)](#14-out-of-scope-mvp)
15. [Open Questions](#15-open-questions)
16. [Phase 2 — UI Flow & Screen Specifications](#16-phase-2--ui-flow--screen-specifications)

---

## 1. Executive Overview

ResearchOS is an agentic synthetic user research platform that compresses the research lifecycle from weeks to minutes. It takes a product problem statement as input and orchestrates a multi-agent pipeline — generating personas, designing interview guides, simulating interviews with those personas, and synthesising the results into structured product hypotheses and actionable recommendations.

The core thesis: the highest-value output of user research is not themes or quotes — it is the answer to "what should we build or test next?" No existing tool produces this as a first-class output. ResearchOS does.

The product is built for early-stage founders and product managers who need directional research signal to make product decisions but lack access to real participants, dedicated researchers, or the time for traditional research workflows.

**Capstone context:**
This product is being built as part of the Cohort 6 AI Program Capstone — a 4-week, self-paced build following four phases: Scope & Research → Design → Build & AI Integration → Evaluate & Iterate.

---

## 2. Domain Understanding — The Research Lifecycle

### 2.1 Full Research Lifecycle — All Touchpoints

The user research lifecycle spans 24 distinct touchpoints across six stages. Understanding where existing tools play — and don't — is the foundation for product positioning.

```
PRE-RESEARCH
├── 1.  Research prioritization     What should we research? Which question is highest priority?
├── 2.  Method selection            Interviews? Surveys? Usability test? Diary study?
└── 3.  Stakeholder alignment       Getting buy-in on what we're trying to learn and why

PLANNING
├── 4.  Goal / problem statement    Translating business problem into a researchable question
├── 5.  Participant criteria        Who qualifies? What are the screening questions?
├── 6.  Persona / segment design    Who are the target users? What segments exist?
├── 7.  Study / interview guide     What questions? What tasks? What probes?
└── 8.  Stimulus preparation        Prototypes, concepts, scenarios to react to

RECRUITMENT
├── 9.  Recruiting & screening      Finding, qualifying, inviting participants
└── 10. Scheduling & logistics      Calendar, consent forms, tool setup, payments

FIELDWORK
├── 11. Moderation                  Running the session in real time
├── 12. Note-taking & observation   Real-time documentation by observers
└── 13. Transcription               Converting recordings to readable text

ANALYSIS
├── 14. Tagging & coding            Qualitative coding of raw data
├── 15. Affinity mapping            Grouping related observations spatially
├── 16. Synthesis                   Finding patterns across the data
├── 17. Insight articulation        "We learned that..." statements
└── 18. Insight prioritisation      Which findings are most important / actionable?

OUTPUT
├── 19. Hypothesis generation       What should we test or build next?
├── 20. Recommendation generation   What specific actions should the team take?
└── 21. Presentation / storytelling Communicating findings to stakeholders

POST-RESEARCH
├── 22. Repository / knowledge mgmt Storing insights so they don't die after the meeting
├── 23. Action tracking             Did the team act on the insights?
└── 24. Impact measurement          Did the product decisions based on research lead to good outcomes?
         └──────────────────────────────→ feeds back into step 1
```

### 2.2 Pre-Research Intelligence — MECE Breakdown

Pre-research intelligence is about reducing two types of uncertainty before fieldwork:
- **Epistemic uncertainty** — what don't we know yet?
- **Strategic uncertainty** — what's most important to know first?

| Category | Components | AI Serviceability |
|---|---|---|
| **Research Question Intelligence** | Problem framing, assumption audit, knowledge gap mapping, decision anchoring, risk weighting | ~65% |
| **Audience Intelligence** | Population definition, segment mapping, prioritisation, edge case ID, behavioral profiling | ~75% |
| **Method Intelligence** | Qual vs quant decision, method selection, study design, sequencing, constraint mapping | ~60% |
| **Context Intelligence** | Product context, competitive context, stakeholder landscape, urgency mapping, research debt | ~40% |

**Overall pre-research AI serviceability: ~60%**

The highest-leverage AI contributions in pre-research:
- Assumption audit (given a product idea, surface hidden assumptions)
- MECE segment and persona landscape generation
- Method recommendation given research question type and constraints

The hard limits:
- Knowledge gap mapping (needs your internal past research)
- Stakeholder mapping (organisational politics are human-owned)
- Urgency and timeline mapping (needs roadmap context)

---

## 3. Competitor Research

Five players were researched across the AI-assisted user research space. Each operates at one or several stages of the research lifecycle — none orchestrates the full pipeline from problem framing to product hypothesis.

---

### 3.1 Synthetic Users
**syntheticusers.com | Founded 2023 | Lisbon + California + London | Seed $10M (Khosla)**

**Problem solved:** Traditional research is too slow and expensive. Niche participant access (oncologists, rare roles) takes months.

**What they offer:**
- AI-simulated interviews with synthetic personas
- Multi-LLM ensemble routing (GPT, Claude, Llama) to reduce single-model bias
- RAG enrichment of personas with proprietary company data
- Interactive interview dialogues (continue conversations manually)
- Structured summary reports

**User flow:**
1. Define target user group and research goal
2. Platform generates synthetic personas
3. AI runs interview sessions per persona
4. User can probe further interactively
5. Output: interview transcripts + synthesised summary report

**Pricing:** Per-interview (~$2–$27/interview, +~$5 for RAG). 7-day free trial. No per-seat fees.

**Positioning:** "Research that pays for itself." Speed and cost as primary hooks. Gartner recognised; 85%+ behavioral fidelity claim.

**Mission:** Democratise access to user insight. Realism is their stated differentiator.

**Conviction:** Founded by Kwame Ferreira and Hugo Alves. Enterprise traction across pharma, CPG, automotive before raising.

---

### 3.2 Outset.ai
**outset.ai | Founded 2022 | San Francisco | Series B $51M total**

**Problem solved:** Qualitative research at scale is a contradiction — depth requires time and human moderation. Outset tries to dissolve that tradeoff.

**What they offer:**
- AI-moderated interviews via text, voice, or video in 40+ languages
- Real-time adaptive follow-ups (not scripted branching)
- Emotional analysis — tone, hesitation, sentiment from voice
- Instant NLP synthesis — themes, summaries, emotional cues
- Panel integration with User Interviews (real participants)
- Enterprise SSO, team workspaces

**User flow:**
1. Define study topic, goal, and participant criteria
2. Recruit via panel or bring own participants
3. AI moderator conducts live interviews — adapts dynamically
4. Platform synthesises transcripts in real time
5. Output: structured insight report — clusters, summaries, quotes

**Pricing:** Enterprise custom. ~$20K/seat/year base + usage-based billing per live research question. No self-serve tier.

**Positioning:** "World's first AI-native Customer Experience Management platform." Expanding from research tool to full CX layer. 8x revenue growth in 2025.

**Mission:** "Every organisation should have a direct line to what people want at every step of the journey."

**Conviction:** Backed by YC. Customers include Microsoft, Nestlé, Uber, HubSpot. $30M Series B led by Radical Ventures + M12 (Microsoft).

---

### 3.3 Marvin (HeyMarvin)
**heymarvin.com | Founded ~2021 | US**

**Problem solved:** Companies drown in customer feedback from 10+ sources but none of it is connected, searchable, or actioned. Insights never reach decision-makers.

**What they offer:**
- Central research repository across 20+ integrations (Zendesk, Intercom, Figma)
- AI-powered auto-tagging and theme clustering across all sources
- Affinity mapping — AI suggests clusters, researcher refines
- "Ask AI" — conversational query over entire research repository
- Interview scheduling, note-taking, and AI interview tool (5 free/month)
- Shareable insight reports

**User flow:**
1. Connect data sources (import tickets, upload recordings, paste surveys)
2. Marvin transcribes, summarises, auto-tags all content
3. AI clusters themes across sources
4. Researcher refines clusters, annotates, merges
5. Ask AI queries the full knowledge base conversationally
6. Output: shareable reports, theme summaries, tagged evidence

**Pricing:** Free (5 AI interviews/month). Standard ~$19/user/month (annual). Enterprise: custom.

**Positioning:** "The AI repository for 360° customer knowledge." Research ops angle — continuity and institutional knowledge, not just one-off studies.

**Mission:** "Every strategic business decision should be grounded in the voice of the customer."

**Conviction:** Co-founded by Prayag Narula (ex-LeadGenius, $25M raised) and Chirag Narula (ex-Blinkit design lead). Pain experienced firsthand at LeadGenius.

---

### 3.4 Maze
**maze.co | Founded 2018 | Paris | Series B**

**Problem solved:** Product teams make decisions without enough user data because running research is slow, technically complex, and requires specialist skill.

**What they offer:**
- Prototype testing (Figma-native), live website testing
- Moderated and unmoderated interviews with AI moderation
- Tree testing, card sorting, surveys in one platform
- AI moderator: transcribes, tags moments, clusters themes, maps to goals
- Panel of 5M+ participants with demographic filters
- Mobile prototype testing with QR code onboarding
- Automated reports with clips, stats, insight summaries
- Bias detection in research design

**User flow:**
1. Create a study — choose method (prototype test, interview, survey)
2. Set participant criteria, add questions/tasks
3. Distribute to Maze panel or share link externally
4. AI moderates interview sessions in real time
5. Output: automated insight report with themes, evidence, and clips

**Pricing:** Free plan available. 30-day free trial (no credit card). Paid plans custom. Significantly cheaper than UserTesting ($40K/year avg contracts).

**Positioning:** "User insights at the speed of product development." Democratising research for product teams, not just researchers. 60,000+ product teams.

**Mission:** "Live in a world where experiences are shaped by the people who engage with them."

**Conviction:** Jonathan Widawski was a UX lead (McKinsey, Rocket Internet, PSG). Hacked a prototype testing layer on InVision. Clients adopted it despite initial research reluctance. Founded 2018, proven over time.

---

### 3.5 Notably
**notably.ai**

**Problem solved:** Research synthesis is the slowest, most manual part of the research process. Researchers spend more time organising data than generating insight from it.

**What they offer:**
- Video transcription, summarisation, auto-tagging
- AI clustering by theme, sentiment, or journey stage
- Canvas-based visual interface for qualitative data organisation
- "Posty" — AI research assistant for synthesis and data queries
- Template library for every research stage
- Integrations with Miro and FigJam
- Sentiment analysis across data

**User flow:**
1. Upload interview recordings, transcripts, or documents
2. Posty auto-transcribes, summarises, highlights, tags content
3. Ask Posty to cluster by theme/sentiment, or do it manually on canvas
4. Drag, drop, merge themes on the visual canvas
5. Output: theme clusters, insight summaries, shareable reports

**Pricing:** Free-forever (1 project). Paid plans from ~$21/month. 7-day free trial. 4 pricing tiers.

**Positioning:** "AI synthesis platform for user research." Narrow focus on synthesis and analysis only. Canvas-based interface as the design differentiator.

**Mission:** "Amplify the voice of the customer." Built by researchers, for researchers.

**Conviction:** Founding story not publicly documented.

---

## 4. Competitive Gap Analysis

### 4.1 Where Each Competitor Plays

| Lifecycle Stage | Synthetic Users | Outset | Marvin | Maze | Notably |
|---|---|---|---|---|---|
| Research prioritisation | | | | | |
| Method selection | | | | Partial | |
| Stakeholder alignment | | | | | |
| Goal / problem statement | Input | Input | | Input | |
| Participant criteria | Input | Input | | Input | |
| Persona / segment design | **Core** | | | | |
| Study / interview guide | **Core** | **Core** | | **Core** | |
| Stimulus prep | | | | Partial (Figma) | |
| Recruiting & screening | None (synthetic) | **Core** | | **Core** (5M panel) | |
| Scheduling & logistics | None | Partial | | Partial | |
| Moderation | **Core** (AI) | **Core** (AI) | | **Core** (AI) | |
| Transcription | Output | Output | Input | Output | **Core** |
| Tagging & coding | | | **Core** | | **Core** |
| Affinity mapping | | | **Core** | | **Core** |
| Synthesis | Output | Output | **Core** | Output | **Core** |
| Insight articulation | Partial | Partial | Partial | Partial | Partial |
| Insight prioritisation | | | | | |
| **Hypothesis generation** | | | | | |
| **Recommendation generation** | | | | | |
| Presentation | Partial | Partial | Partial | Partial | Partial |
| Repository / knowledge mgmt | | | **Core** | | Partial |
| Action tracking | | | | | |
| Impact measurement | | | | | |

### 4.2 The Three White Spaces

**White Space 1 — Pre-research intelligence (Stages 1–3)**
No tool helps teams decide *what* to research, *which method* to use, or *how to align stakeholders*. Teams do this through intuition and Slack debates.

**White Space 2 — Hypothesis + recommendation generation (Stages 19–20)**
Every tool stops at insight themes and quotes. None produces: *"Here are 3 hypotheses worth testing and here is what to build first."* This is the highest-value output for a PM or founder and the direct bridge between research and product decisions. **This is the primary differentiator.**

**White Space 3 — Post-research loop (Stages 22–24)**
Insights die in decks. No tool tracks whether findings were acted on or whether resulting product decisions worked. Long-term opportunity, not MVP scope.

### 4.3 Competitive Positioning Summary

| Tool | Core Bet | Real Users? | Ends at... |
|---|---|---|---|
| Synthetic Users | Personas replace recruiting | No | Summary report |
| Outset | AI moderates real interviews at scale | Yes | Insight themes |
| Marvin | Central research repository | Yes (your data) | Themes + Ask AI |
| Maze | Full research platform for product teams | Yes | Automated report |
| Notably | Synthesis & analysis automation | Yes (your data) | Theme clusters |
| **ResearchOS** | **End-to-end pipeline → hypotheses + recommendations** | **No (synthetic)** | **Product hypotheses + ranked actions** |

---

## 5. Problem Statement

> **Product teams making early-stage decisions lack a fast path from "here is our product problem" to "here is what to build and test next." Traditional research is too slow (2–4 weeks), too expensive, and requires participants they don't yet have. Existing AI research tools reduce cost at isolated steps but stop at insights — leaving the hardest question — "so what do we do?" — unanswered. The opportunity is an agentic synthetic research pipeline that orchestrates the full journey from problem framing and persona generation through simulated interviews to structured hypotheses and actionable product recommendations — compressing weeks of research into minutes of AI-driven synthesis, without requiring a single real participant.**

### 5.1 Root Causes Addressed

| Root Cause | How ResearchOS addresses it |
|---|---|
| **Access bottleneck** | No real participants needed — synthetic personas replace recruitment |
| **Pipeline fragmentation** | Single end-to-end workflow — no tool switching |
| **Output translation gap** | Hypotheses and recommendations as first-class outputs — not just themes |
| **Skill barrier** | Guided intake and AI-orchestrated pipeline — no research expertise required |

### 5.2 Honest Limitations

ResearchOS produces directional, not definitive, research. It does not solve:
- The say-do gap (AI simulates what people say, not what they do)
- Unknown unknowns (LLMs respond from training data; they cannot surface entirely novel mental models)
- Statistical validity (synthetic samples are not demographically representative)
- High-stakes decisions (healthcare, finance, safety-critical — synthetic research is insufficient here)

These limitations are features, not bugs — they define where the product is honest about its value and where it defers to real research.

---

## 6. Target Users

### 6.1 Primary User — Early-Stage Founder / Product Manager

**Who they are:**
- Building a 0→1 product or pre-PMF product
- Often the sole decision-maker for product direction
- No dedicated UX researcher on the team
- No existing user base to recruit from

**Core pain:**
- Shipping product decisions based on assumptions because running real research is too slow, too expensive, or logistically blocked
- Can't recruit real users (no panel, no budget, no time)
- Even when they want to do research, the setup cost (questions, recruitment, synthesis) exceeds the runway

**What they need from ResearchOS:**
- A fast way to pressure-test a product assumption
- Clear "what to build next" output — not a research report to interpret
- No research expertise required to use the tool

**Trigger moment:**
"I'm about to write this feature spec and I genuinely don't know if users would use it this way."

---

### 6.2 Secondary User — UX Researcher (Resource-Constrained Team)

**Who they are:**
- Solo researcher or small research team supporting a larger product org
- Has research skills but is bottlenecked by logistics — recruiting, scheduling, synthesis
- Needs to produce insights at the pace of product sprints

**Core pain:**
- Spending 80% of time on research logistics, not insight generation
- Can't cover every research question the product team asks
- Needs to prioritise which questions deserve real research vs. quick directional signal

**What they need from ResearchOS:**
- A triage tool — run synthetic research first to decide if a question warrants real research
- Fast hypothesis generation to take into real field sessions
- Interview guide generation to accelerate study design

**Trigger moment:**
"The PM asked for research on this by Thursday. I can't recruit in time. I need directional signal now."

---

## 7. Product Vision & Positioning

**Vision:** A world where no product decision is made purely on assumption — where any founder or PM can access directional research signal in minutes, at any stage of product development.

**Positioning statement:**
ResearchOS is the only agentic research platform that takes your product problem as input and returns structured hypotheses and product recommendations as output — without requiring participants, researchers, or weeks of setup.

**One-liner:**
*"From product problem to research insight in minutes — no participants required."*

**What ResearchOS is:**
- A research accelerator and hypothesis generator
- A tool for directional signal, not statistical proof
- A pre-research and synthesis engine for teams without dedicated research resources

**What ResearchOS is not:**
- A replacement for real user research
- A source of behavioral observation
- A statistically valid research instrument

---

### 7.1 Supported Research Types

ResearchOS is optimized for **generative qualitative research** at the discovery phase of a product lifecycle. This scoping is a product decision, not a limitation — it defines where the tool is honest about its value and prevents misuse in contexts where synthetic bias would actively mislead.

**What it is designed for:**

| Research Goal Type | Example Question | ResearchOS Fit |
|---|---|---|
| Problem discovery | "What are the biggest friction points people face when managing X?" | Excellent |
| Segment mapping | "How do different user types experience this problem differently?" | Excellent |
| Assumption surfacing | "What hidden assumptions are baked into our product thesis?" | Excellent |
| Prioritization signal | "Which pain points are most acute and underserved across segments?" | Good |
| Hypothesis generation | "What should we build or test next, based on what users say?" | Excellent |
| Concept exploration | "How might users react to this product idea directionally?" | Good (with caution — synthetic bias risk increases for concept tests) |

**What it is not suited for:**

| Research Type | Why Not |
|---|---|
| Usability testing | Cannot test real interfaces; synthetic personas have no interaction with actual UI |
| Quantitative / statistical research | No sample validity; synthetic outputs cannot support statistical inference |
| Behavioral / observational research | Say-do gap: synthetic users say what they "should" do, not what they would actually do |
| Longitudinal studies | No time dimension; cannot track how attitudes change over time |
| Validation research | High risk that the question framing itself biases synthetic responses toward confirmation |
| High-stakes domains (healthcare, finance, safety) | Directional signal is insufficient for consequential decisions |

**Recommended use pattern:** Run ResearchOS at the front of a research initiative to discover problems and generate hypotheses. Use real user research to validate the highest-priority hypotheses identified by the pipeline.

---

## 8. Success Matrix

Success is evaluated across four MECE categories. These metrics will be measured in Phase 4 using a ground-truth comparison method: run the pipeline on 3 products with published real user research (e.g., Figma, Notion, Duolingo) and compare synthetic output against documented real findings.

---

### Category 1: Pipeline Performance
*Is the system working reliably end to end?*

| Metric | Measurement Method | Target |
|---|---|---|
| Pipeline completion rate | % of runs completing without error across 20 test runs | >95% |
| End-to-end latency | Timed runs: problem input → final report (5 personas, 6 questions) | <5 minutes |
| Consistency score | Semantic similarity (cosine) between two runs on identical inputs | >0.75 |
| Cost per run | Token count × API pricing per complete pipeline run | <$0.50/run at standard settings |

---

### Category 2: Research Output Quality
*Is the synthetic research credible and grounded?*

| Metric | Measurement Method | Target |
|---|---|---|
| Hypothesis recall | % of real-research hypotheses surfaced by synthetic pipeline vs. published case study on same product | >60% |
| Hallucination rate | % of insights not traceable to evidence in synthetic transcripts | <5% |
| Persona distinctiveness | Average cosine distance between any two personas' responses in same run | >0.4 |
| Theme coverage | % of major insight themes from real research captured by synthetic run | >65% |

---

### Category 3: Output Actionability
*Does the output help someone make a product decision?*

| Metric | Measurement Method | Target |
|---|---|---|
| Recommendation specificity | % of recommendations naming a specific action vs. vague suggestion | >80% specific |
| Actionability rating | PM/founder tester rates "can you act on this?" on 1–5 scale (5 testers) | Average >3.5/5 |
| Time to decision | Time for a PM to read the report and articulate a concrete next step | <10 minutes |
| Hypothesis clarity | Hypotheses written in testable format ("We believe X will result in Y because Z") | >80% pass format check |

---

### Category 4: Speed vs. Baseline
*Does it meaningfully compress research time?*

| Metric | Measurement Method | Target |
|---|---|---|
| Setup time saved | Synthetic pipeline setup time vs. estimated traditional setup (recruiting + scheduling + guide writing) | >90% reduction |
| Synthesis time saved | Synthetic synthesis time vs. manual tagging/theming of equivalent 5-transcript set | >85% reduction |
| Time to first hypothesis | From problem input submitted → first structured hypothesis visible | <3 minutes |

---

## 9. Product Scope

### 9.1 MVP Scope — What Is Being Built

The MVP pipeline covers 5 stages of the research lifecycle, executed by 4 AI agents bookended by a structured intake and a formatted report output.

**In scope for MVP:**

| Stage | Component | Type |
|---|---|---|
| Entry | Structured context intake form | UI — not an agent |
| Stage 1 | Persona Generation Agent | AI Agent |
| Stage 2 | Interview Guide Agent | AI Agent |
| Stage 3 | Interview Simulation Agent | AI Agent |
| Stage 4 | Synthesis + Insight Agent | AI Agent |
| Exit | Structured report output | UI — formatted render |

**Lifecycle coverage:**
- Partial pre-research (problem framing via intake, audience intelligence via persona generation)
- Full planning (persona design, interview guide design)
- Full fieldwork simulation (moderated simulation, transcription)
- Full analysis (tagging, synthesis, insight articulation, prioritisation)
- Full output (hypothesis generation, recommendation generation, presentation)

### 9.2 Iterative Build Order

Following spec-driven iterative development — start with the highest-value, lowest-risk stages and expand:

| Iteration | Stages | Rationale |
|---|---|---|
| v0.1 | Intake form + Persona Generation | Foundation. All downstream quality depends on this. |
| v0.2 | + Interview Guide Generation | Extends persona output into a usable research instrument |
| v0.3 | + Interview Simulation | Core synthetic research engine. Highest technical risk — build early. |
| v0.4 | + Synthesis + Insight Agent | Differentiator. Hypotheses and recommendations as output. |
| v0.5 | + Report formatting + UI polish | Ship-ready MVP |

---

## 10. MVP Pipeline Architecture

### 10.1 Full Pipeline Flow

```
┌─────────────────────────────────────────────┐
│           STRUCTURED INTAKE FORM            │
│                                             │
│  • Product / problem description            │
│  • Target user (broad description)          │
│  • Research goal                            │
│  • Product stage (idea/pre-MVP/MVP/growth)  │
│  • Number of personas (2–8, default 5)      │
│  • Number of questions (4–8, default 6)     │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│         AGENT 1: PERSONA GENERATION         │
│                                             │
│  Input:  Intake form JSON (full)            │
│  Process: Generate N MECE personas with     │
│           distinct behavioral profiles      │
│  Output: Persona array (structured JSON)    │
│                                             │
│  Each persona includes:                     │
│  • Name, role, demographic                  │
│  • Goals and motivations                    │
│  • Frustrations and pain points             │
│  • Behavioral context                       │
│  • Relationship to the product problem      │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│       AGENT 2: INTERVIEW GUIDE AGENT        │
│                                             │
│  Input:  Intake form + Persona array        │
│  Process: Generate research questions       │
│           grounded in goal and personas     │
│  Output: Interview guide (structured JSON)  │
│                                             │
│  Guide includes:                            │
│  • 4–8 open-ended research questions        │
│  • Follow-up probes per question            │
│  • Warm-up and closing questions            │
│  • Research goal alignment note             │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│      AGENT 3: INTERVIEW SIMULATION AGENT    │
│                                             │
│  Input:  Persona profile + Interview guide  │
│  !! Research goal EXCLUDED from context !!  │
│  Process: Simulate each persona responding  │
│           to all questions in character     │
│           (parallel execution per persona)  │
│  Output: N interview transcripts (JSON)     │
│                                             │
│  Per transcript:                            │
│  • Persona context header                   │
│  • Q&A pairs with in-character responses    │
│  • Emotional tone markers                   │
│  • Quality flag if response too thin        │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│      AGENT 4: SYNTHESIS + INSIGHT AGENT     │
│                                             │
│  Input:  All N transcripts + Research goal  │
│  Process: Cross-transcript pattern analysis,│
│           theme extraction, hypothesis and  │
│           recommendation generation         │
│  Output: Structured insight report (JSON)   │
│                                             │
│  Report includes:                           │
│  • 3–5 major themes with evidence quotes    │
│  • Cross-persona pattern analysis           │
│  • 3–5 product hypotheses (testable format) │
│  • Ranked recommendations with rationale    │
│  • Research confidence note (synthetic)     │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│            FORMATTED REPORT OUTPUT          │
│                                             │
│  • Rendered readable report from JSON       │
│  • Sections: Personas · Themes ·            │
│    Hypotheses · Recommendations             │
│  • Copy-paste exportable                    │
│  • Confidence disclaimer footer             │
└─────────────────────────────────────────────┘
```

### 10.2 Context Flow Per Agent

The research goal is not passed uniformly to all agents. This is a deliberate design decision to prevent demand characteristics in simulation.

| Context Field | Agent 1 | Agent 2 | Agent 3 | Agent 4 |
|---|---|---|---|---|
| Product description | ✓ | ✓ | ✓ | ✓ |
| Target user | ✓ | ✓ | ✓ | ✓ |
| **Research goal** | **✓** | **✓** | **✗ Excluded** | **✓** |
| Product stage | ✓ | ✓ | — | — |
| Persona array | — | ✓ | ✓ (per persona) | — |
| Interview guide | — | — | ✓ | — |
| Transcripts | — | — | — | ✓ |

### 10.3 Technical Considerations

**Interview Simulation Agent — known complexity:**
- 5 personas × 6 questions = 30 LLM calls minimum
- Must execute in parallel per persona (not sequentially) to meet latency target
- Persona context must be passed in every call to maintain character consistency
- Minimum response quality check needed before passing to synthesis
- Estimated token usage: ~15,000–20,000 tokens per complete run

**Context window management:**
- Synthesis agent receives all N transcripts simultaneously
- For 5 personas × 6 questions, transcript context is ~3,000–5,000 tokens
- Well within Claude's context window but must be structured cleanly

**Output format standard:**
- All inter-agent communication: structured JSON
- Final output: JSON → rendered markdown/HTML report
- No streaming required for MVP

---

## 11. Product Requirements

### 11.1 Functional Requirements

---

#### FR-01: Structured Intake Form

##### The What

The entry point to the pipeline. A structured form that captures the minimum context needed to condition all downstream agents. Output is a single JSON context object passed to Agent 1.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Product / problem description | Long text | Yes | Min 50 chars. Placeholder: "e.g., We're building a tool that helps solo founders track MRR without a finance background." |
| Target user description | Medium text | Yes | Placeholder: "e.g., Non-technical solo founders running B2B SaaS products under $10K MRR." |
| Research goal | Medium text | Yes | Placeholder: "e.g., What are the biggest friction points founders hit when trying to understand their revenue trends?" Frame as a discovery question, not a validation question. ResearchOS is optimized for generative research — not "does this feature work?" |
| Product stage | Dropdown | Yes | Options: Idea / Pre-MVP / MVP / Post-launch |
| Number of personas | Number input | Yes | Range: 2–8. Default: 5 |
| Number of interview questions | Number input | Yes | Range: 4–8. Default: 6 |

**Acceptance criteria:**
- Form validates all required fields before submission
- Character minimums enforced with inline error messages
- Persona and question count sliders update in real time
- On submit, intake data is compiled into a structured JSON context object passed to Agent 1

##### The Why

**Why a structured form rather than freeform input?**
GIGO (Garbage In, Garbage Out) is the primary quality risk for the entire pipeline. If a user types "research my app," every downstream agent compounds the ambiguity — generating generic personas, bland questions, and hollow synthesis. A structured form creates a typed context object that agents can reliably parse. Fields force specificity in the same way that a research brief forces clarity before a real study begins.

**Why minimum 50 characters on product description?**
"B2B SaaS tool" has no anchor. The model needs enough context to understand the domain, user type, and problem space before generating non-generic personas. 50 characters enforces at least one complete thought with a subject and predicate.

**Why is the research goal framed as a single discovery question?**
Two reasons: (1) Forces the user to prioritize — the most common research failure mode is trying to answer too many questions in one study, which produces shallow answers to all of them. (2) Discovery questions ("What friction do people feel when X?") produce substantively better synthetic output than validation questions ("Does feature Y work?") because they invite narrative responses from personas rather than forced evaluations.

**Why does product stage exist as a field?**
The same product description generates meaningfully different relevant personas depending on stage. At Idea: you want early adopters and skeptics. At Pre-MVP: you want domain practitioners and problem-aware users. At Post-launch: you want power users, marginal users, and churned users. Stage is the strongest single signal for persona relevance.

**Why is persona count configurable (not fixed at 5)?**
Different research goals warrant different sample sizes. A tight concept test (2–3 personas) is appropriate when exploring one specific segment. A broad landscape scan (7–8) is appropriate when the user doesn't yet know what segments exist. Forcing a fixed count removes the user's ability to match research depth to research purpose.

##### Stress Tests

| Scenario | Input | Expected Behavior |
|---|---|---|
| Vague product description | "I want to build an app" (25 chars) | Inline error: "Add more detail about your product and the problem it solves (min 50 characters)" |
| Research goal as validation question | "Does my feature work for users?" | Accepted — not blocked. Placeholder text and field note guide toward discovery framing. Pipeline runs but synthesis output may be less generative. |
| Maximum persona + question count | 8 personas, 8 questions | Accepted. UI shows estimated cost and estimated latency before submission. |
| Intentionally junk input | Random characters that hit the 50-char minimum | Passes form validation. Downstream agents degrade gracefully — personas will be generic. This is acceptable; the user bears responsibility for input quality. |
| All fields blank on submit | — | All required fields highlighted with inline error. Submit button disabled until resolved. |

##### Failure Modes & Mitigations

| Failure Mode | Probability | Impact | Mitigation |
|---|---|---|---|
| User enters vague description that clears the character minimum | High | Medium — personas will be shallow | Example prompts in placeholder text model specificity. A future v2 could add an "intake quality score" before submission. |
| User frames research goal as a validation question | Medium | Medium — synthesis output skews toward evaluation rather than discovery | Field-level note and placeholder text guide toward discovery framing without blocking the run |
| User sets 2 personas, 4 questions | Low | Low — thin synthesis, but functional | Synthesis agent's confidence_disclaimer notes lower confidence with smaller sample size |
| User inputs a niche domain with limited LLM training data | Low | High — personas will be generic despite specific input | Scoped to mainstream product domains in MVP; niche domains flagged in assumptions |

---

#### FR-02: Persona Generation Agent

##### The What

Generates N distinct, MECE synthetic personas based on the intake context.

**Input:** Intake form JSON (full)
**Output:** Persona array (JSON)

**Persona schema (per persona):**
```json
{
  "id": "persona_1",
  "name": "string",
  "age": "number",
  "role": "string",
  "location": "string",
  "background": "string",
  "goals": ["string"],
  "frustrations": ["string"],
  "behavioral_context": "string",
  "relationship_to_problem": "string",
  "tech_savviness": "low | medium | high",
  "quote": "string"
}
```

**Acceptance criteria:**
- Generates exactly N personas as specified in intake
- Each persona is semantically distinct (no two personas share the same role + context combination)
- Personas are MECE — collectively cover the realistic spectrum of the target user population
- Each persona has a direct, explicit relationship to the stated product problem
- At least one persona is skeptical, disengaged, or resistant (anti-sycophancy requirement)
- Pain severity varies across personas (not all personas are equally frustrated)
- Output is valid JSON matching the schema

##### The Why

**Why MECE personas?**
The synthesis agent's job is to find patterns across a population landscape. If all 5 personas are variations of the same enthusiastic early-adopter, the synthesis will produce a single echo chamber — finding only what was already assumed. MECE personas force the pipeline to surface tension, disagreement, and divergence between segments. These tensions are the most analytically valuable research output.

**Why the `relationship_to_problem` field specifically?**
The research problem is the semantic anchor for the entire pipeline. A persona who has never experienced the problem, one who solved it with a workaround, and one actively suffering from it will produce qualitatively different interview responses. Making this relationship an explicit field — not implied by role or background — ensures the synthesis agent can reason about "why did this persona respond this way?" when cross-referencing transcripts.

**Why the `quote` field?**
A single in-character quote forces the model to commit to a voice and perspective. It serves as a canary for quality: if the quote sounds generic ("I just want things to be simpler"), the persona is likely shallow. It also provides a fast human-review signal — a PM reviewing 5 persona cards can scan the quotes in seconds to judge character diversity without reading the full profiles.

**Why `tech_savviness` as a required enum?**
Almost every product problem has a technology component, and how a user relates to technology is one of the most reliable behavioral differentiators for product research. A low-tech-savviness user and a high-tech-savviness user will have categorically different mental models of the same tool. Making this explicit (rather than inferring it from role) ensures the simulation agent can calibrate language, vocabulary, and response style appropriately.

**Why is anti-sycophancy an explicit system-level requirement?**
LLMs default to generating likable, articulate, and enthusiastic personas — because that is the statistical mode of "helpful" content in their training data. Real user populations include skeptics, resisters, churned users, and people who have given up trying to solve the problem. Without explicit instruction, the model produces a fan club, not a research sample. Anti-sycophancy is enforced in the system prompt, not hoped for.

##### Prompt Architecture

**Design philosophy:** Chain-of-thought persona construction. The model must first map the population landscape, then identify the key behavioral axes on which users differ, then place one persona per distinct segment. This chain prevents the default behavior of generating N variations of the same archetype.

**System prompt template:**
```
You are an expert UX researcher specializing in synthetic persona generation for product research.

CHAIN-OF-THOUGHT REQUIREMENT — complete all steps before generating output:

STEP 1 — POPULATION: Who constitutes the total addressable population for this product problem? Define the outer boundary.

STEP 2 — BEHAVIORAL AXES: Identify the 2–3 most important dimensions on which users in this population differ. Examples: technical sophistication, frequency of the problem, current workaround behavior, severity of pain, relationship to the product domain.

STEP 3 — SEGMENTATION: Map {{persona_count}} positions across these axes so they are mutually exclusive and collectively cover the realistic spectrum. No two positions should overlap.

STEP 4 — GENERATION: Generate one persona per position. Each persona must:
  - Have a direct, explicit relationship to the stated product problem (relationship_to_problem field)
  - Include at least 2 specific frustrations
  - Speak in a distinctive voice in the quote field — not a product testimonial
  - Have tech_savviness that reflects their background, not defaults to "medium"

ANTI-SYCOPHANCY MANDATE:
  - At minimum one persona must be skeptical, resistant, or disengaged — someone who has tried to solve this problem and given up, or who doesn't see it as worth solving
  - Pain severity must vary across the persona set — not all personas are equally frustrated
  - No persona's quote may sound like a product testimonial or enthusiastic endorsement

OUTPUT: Return a valid JSON array. Do not include any text outside the JSON array.
```

**User prompt template:**
```
Product description: {{product_description}}
Target user (broad): {{target_user}}
Research goal: {{research_goal}}
Product stage: {{product_stage}}
Number of personas: {{persona_count}}

Complete all four steps and generate the persona array.
```

**Post-generation validation:**
- Parse JSON — fail loudly if malformed
- Assert array length equals N
- Assert no two personas share identical `role` value
- Assert each persona has `frustrations` array with at least 1 item
- Assert `relationship_to_problem` field is non-empty on every persona
- Assert `quote` field is non-empty and does not contain the phrase "as a [role]"

##### Stress Tests

| Scenario | Input | Expected Behavior |
|---|---|---|
| Very narrow target user | "Only female CTOs at Series A fintech startups in the UK" | Model generates N personas within the constraint — may produce demographic variation within the narrow band |
| Very broad target user | "Anyone who has ever used software" | Model must apply its own segmentation judgment — behavioral axes become the primary differentiator |
| Persona count = 2 | N=2 | Model generates two maximally distinct personas — most likely a power user vs. a skeptic |
| Persona count = 8 | N=8 | Model must find 8 non-overlapping positions — increased risk of thin persona differentiation; quality flag in output if two personas are semantically similar |
| Niche domain with thin training data | "B2B tool for artisanal textile importers" | Personas will be more generic; relationship_to_problem may be surface-level. This is an acceptable degradation for MVP. |

##### Failure Modes & Mitigations

| Failure Mode | Probability | Impact | Mitigation |
|---|---|---|---|
| Personas are variations of the same archetype | Medium | High — simulation echo chamber | Chain-of-thought segmentation step forces distinct positions before generation; anti-sycophancy mandate requires at least one resistant persona |
| Persona quote sounds generic | Medium | Low — cosmetic quality issue | Post-generation validation flags quotes containing "as a [role]" or other generic patterns |
| JSON schema non-compliance | Low | High — pipeline breaks | Post-generation JSON parse + schema validation; on failure, retry once with explicit schema reminder in prompt |
| Persona set excludes an obvious critical segment | Low-Medium | Medium — blind spot in synthesis | Human review gate (US-02) gives the PM a chance to catch this before simulation runs |

---

#### FR-03: Interview Guide Agent

##### The What

Generates a research interview guide grounded in the research goal and calibrated to the persona landscape.

**Input:** Intake form JSON + Persona array
**Output:** Interview guide (JSON)

**Interview guide schema:**
```json
{
  "research_goal": "string",
  "warmup_question": "string",
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "intent": "string",
      "follow_up_probes": ["string", "string"]
    }
  ],
  "closing_question": "string"
}
```

**Acceptance criteria:**
- Generates exactly N questions as specified in intake (plus warm-up and closing)
- All questions are open-ended (no yes/no questions)
- No question is leading, double-barreled, or solution-prescriptive
- Each question includes its research intent and at least 2 follow-up probes
- Questions are sequenced logically (general → specific)
- Questions are universally applicable across all personas in the set
- Output is valid JSON matching the schema

##### The Why

**Why does this agent receive the full persona array (not just the research goal)?**
Interview questions must work for all personas in the set — not just the most obvious one. Knowing the full persona landscape prevents questions that only make sense for one segment. For example, if one persona is a non-technical user and another is a software engineer, a question about "your current technical workaround" would be inaccessible to the non-technical persona. Persona awareness forces universally applicable questions.

**Why is `intent` a mandatory field per question?**
Without intent, the synthesis agent has no semantic anchor for interpreting responses. A question like "Tell me about your workflow" is ambiguous — the synthesis agent doesn't know whether to interpret it as probing for friction, for tool preferences, or for time spent. The intent field makes the analytical purpose explicit, which improves synthesis accuracy and prevents interpretive drift in Agent 4.

**Why are leading, double-barreled, and solution-prescriptive questions explicitly forbidden?**
Because the interview simulation agent follows the question's framing. A leading question ("How frustrated do you get with the current solution?") biases the persona's response toward frustration — producing manufactured evidence for a hypothesis you already hold. Double-barreled questions split the persona's attention and produce unfocused responses that are hard to code. Solution-prescriptive questions ("Would a dashboard feature help?") skip past problem discovery entirely.

**Why require 2 follow-up probes per question?**
First-level responses are always surface-level — the persona gives the obvious answer. Follow-up probes push toward specificity: "Can you give me a specific example?" / "What happened when you tried that?" The synthesis agent uses probe-level responses as evidence quotes — they contain the specific details that make themes credible and recommendations concrete.

**Why warm-up and closing questions?**
Warm-up questions build character continuity before the analytical questions begin — they calibrate the persona's voice so that responses to core questions feel grounded. Closing questions ("What would your ideal solution look like?") create a forward-looking vector that is disproportionately valuable for hypothesis generation.

##### Prompt Architecture

**Design philosophy:** Hypothesis-agnostic question design. The goal is to ask questions that let findings emerge — not questions that confirm what the researcher already thinks. Forbidden question categories must be explicit and enumerated.

**System prompt template:**
```
You are an expert qualitative interview researcher. Your role is to generate a research interview guide — a set of open-ended questions that will be used to simulate interviews with synthetic user personas.

FORBIDDEN QUESTION TYPES (reject any question that matches these patterns):
  - Leading: "How frustrating is it when X happens?" — implies X is frustrating
  - Yes/No: "Do you use tool X?" — does not invite narrative
  - Double-barreled: "How do you find X and how often do you use Y?" — two questions in one
  - Solution-prescriptive: "Would a feature that does X help you?" — skips problem discovery
  - Research-goal-revealing: questions that name the specific hypothesis being tested

REQUIRED QUESTION PROPERTIES:
  - Open-ended: invites narrative, not a binary or list answer
  - Persona-universal: answerable by all {{persona_count}} personas regardless of role or background
  - Intent-grounded: each question must serve the research goal — no filler questions
  - Sequenced: general-to-specific (establish context before drilling into specifics)

WARM-UP AND CLOSING:
  - Warm-up: a low-stakes, context-building question that establishes the persona's baseline (e.g., "Walk me through how you typically handle X in your current role")
  - Closing: a forward-looking question that invites ideal-state thinking (e.g., "If this problem were completely solved for you, what would that look like?")

OUTPUT: Return a valid JSON object matching the provided schema. Do not include any text outside the JSON.
```

**User prompt template:**
```
Research goal: {{research_goal}}
Product description: {{product_description}}
Target user: {{target_user}}
Persona landscape (for context): {{persona_roles_and_contexts_summary}}
Number of core questions: {{question_count}}

Generate the interview guide with exactly {{question_count}} core questions, one warm-up, one closing, and 2 follow-up probes per core question.
```

**Post-generation validation:**
- Parse JSON — fail if malformed
- Assert `questions` array length equals N
- Assert no question text ends with a binary premise (heuristic: flag questions containing "do you" or "have you" as opening phrase)
- Assert each question has `follow_up_probes` array with at least 2 items
- Assert `intent` field is non-empty on every question
- Assert `warmup_question` and `closing_question` are non-empty

##### Stress Tests

| Scenario | Input | Expected Behavior |
|---|---|---|
| Research goal is very broad | "Understand how people manage money" | Questions will be broad; synthesis output will surface many themes but shallow on each. Acceptable for v0.1. |
| Persona set has extreme diversity | 5 personas across very different roles (student, enterprise CTO, retiree, freelancer, engineer) | Guide must produce questions accessible to all — forces high-abstraction, universally applicable framing |
| Minimum questions (4) | question_count = 4 | 4 core + warm-up + closing = 6 total questions. Thin coverage — synthesis confidence_disclaimer notes limited question depth |
| Question count = 8 | question_count = 8 | 8 core + warm-up + closing = 10 total. Higher token cost per transcript; latency increases but acceptable |

##### Failure Modes & Mitigations

| Failure Mode | Probability | Impact | Mitigation |
|---|---|---|---|
| Model generates a leading question despite prohibition | Medium | Medium — biases simulation responses | Post-generation heuristic flag on leading patterns; human review gate (US-03) provides human catch |
| Questions not universally applicable across personas | Medium | Medium — some personas give thin responses to inapplicable questions | Persona landscape summary in user prompt gives model the context to check applicability |
| Intent field is generic ("to understand the user") | Medium | Low-Medium — reduces synthesis accuracy | Post-generation validation flags empty or generic intent strings |
| JSON schema non-compliance | Low | High — pipeline breaks | JSON parse + schema validation; retry once with explicit schema reminder |

---

#### FR-04: Interview Simulation Agent

##### The What

Simulates each persona responding to the interview guide in character. Executes in parallel per persona, sequential within persona.

**Input:** Persona profile (individual) + Interview guide
**Research goal: EXPLICITLY EXCLUDED from Agent 3 context**
**Output:** Array of interview transcripts (JSON)

**Transcript schema (per persona):**
```json
{
  "persona_id": "string",
  "persona_name": "string",
  "responses": [
    {
      "question_id": "string",
      "question": "string",
      "response": "string",
      "tone": "positive | neutral | negative | mixed",
      "quality_flag": "adequate | thin"
    }
  ]
}
```

**Acceptance criteria:**
- Generates one transcript per persona
- Each response maintains character consistency with the persona profile
- No two personas give identical or near-identical responses to the same question
- Responses are a minimum of 100 words each
- Responses below 100 words are marked with `quality_flag: "thin"`
- Research goal is not present in the system prompt or user prompt for this agent
- Execution is parallelised per persona (not sequential across personas)
- Full transcript set is passed to Agent 4 only when all N transcripts are complete
- Output is valid JSON matching the schema

##### The Why

**Why is the research goal explicitly excluded from Agent 3's context?**
This is the most important design decision in the simulation agent. The phenomenon it prevents is called **demand characteristics** — when a participant knows what the researcher is looking for, they unconsciously (or consciously) shape responses to be "helpful" to the research framing. If a persona is told "we're studying friction points in async communication tools," it will surface friction with async tools even if the persona profile wouldn't naturally emphasize that.

In real qualitative research, moderators are trained not to reveal the research hypothesis to participants for this exact reason. Agent 3 follows the same discipline. The interview questions themselves are the only permitted framing signal — they are designed (by Agent 2) to be hypothesis-agnostic. The research goal flows to Agents 1, 2, and 4 — but is stripped from Agent 3's context object at the orchestration layer.

**Why pass the full persona JSON in every API call?**
The LLM API is stateless. There is no persistent "memory" of the persona across calls. The simulation agent makes one call per question-response pair (to enable parallelism). Without the full persona object in every call, each response is generated by a model with no identity — producing generic answers unanchored to any character. The orchestration layer must thread the persona JSON into every system prompt.

**Why parallel per persona, sequential within persona?**
Within a single persona's transcript, question order creates narrative continuity — later answers reference earlier ones, as in a real interview. This requires sequential execution within a persona. Across personas, execution order is irrelevant — each is an independent character. Parallelizing across all N personas cuts total simulation wall-clock time by a factor of N, which is the primary mechanism for meeting the <5-minute latency target.

**Why 100-word minimum per response?**
Responses below 100 words cannot sustain evidence quote extraction. A 30-word response is a reaction, not a finding. The synthesis agent needs substantive narrative to identify themes, extract verbatim quotes, and build hypothesis arguments. 100 words is approximately two genuine thoughts — enough for the persona to establish context and elaborate.

**Why the `quality_flag` field?**
Thin responses (below threshold or structurally generic) degrade synthesis quality. Flagging them rather than failing the run allows the pipeline to complete while making the quality issue visible to both the synthesis agent and the user. The synthesis agent can weight flagged responses lower; the UI can surface the flag so the user knows the synthesis is built on incomplete evidence.

##### Information Isolation Architecture

```
Intake context flowing to each agent:

  product_description  →  Agent 1  ✓  Agent 2  ✓  Agent 3  ✓  Agent 4  ✓
  target_user          →  Agent 1  ✓  Agent 2  ✓  Agent 3  ✓  Agent 4  ✓
  research_goal        →  Agent 1  ✓  Agent 2  ✓  Agent 3  ✗  Agent 4  ✓
  product_stage        →  Agent 1  ✓  Agent 2  ✓  Agent 3  —  Agent 4  —
  persona_array        →           —  Agent 2  ✓  Agent 3  ✓  Agent 4  —
  interview_guide      →                          Agent 3  ✓  Agent 4  —
  transcripts          →                                      Agent 4  ✓
```

The orchestration layer is responsible for enforcing this isolation — the research goal must be explicitly stripped from the context object before it is passed to Agent 3.

##### Prompt Architecture

**Design philosophy:** Full persona immersion. The model must *be* the persona, not *describe* the persona. The system prompt establishes identity; the user prompt presents one question at a time. The research goal does not appear anywhere in this agent's context.

**System prompt template (injected fresh on every API call):**
```
You are {{persona_name}}.

YOUR PROFILE:
  Age: {{age}} | Role: {{role}} | Location: {{location}}
  Background: {{background}}
  Goals: {{goals}}
  Frustrations: {{frustrations}}
  How you relate to this problem: {{relationship_to_problem}}
  Tech comfort level: {{tech_savviness}}
  In your own words: "{{quote}}"

You are in a research interview. Answer each question from your own lived experience — your specific history, opinions, and feelings as described in your profile above.

RULES:
  - Never break character. Never say "as an AI," "as a language model," or anything that references being a simulation.
  - Speak in first person, in the natural voice implied by your background and role.
  - Minimum 100 words per response. Shorter responses will not capture the depth needed.
  - Include specific details: tools you've tried, situations that happened, feelings you had.
  - Do not be generically positive. If something frustrates you, say so with specificity. If you've given up on solving a problem, say so.
  - Your tone should reflect your profile — a skeptical persona should sound skeptical, a frustrated persona should convey frustration.
```

**User prompt template (one call per question):**
```
Interview question: {{question_text}}

Answer as {{persona_name}}, drawing on your specific background and experience.
```

**Post-generation validation:**
- Parse JSON — fail if malformed
- Assert word count of each `response` field ≥ 80 (flag as "thin" if below, do not fail the run)
- Assert `persona_id` matches the intended persona
- Assert `tone` value is one of: positive | neutral | negative | mixed
- Assert all N transcripts are present before passing the transcript array to Agent 4

##### Stress Tests

| Scenario | Input | Expected Behavior |
|---|---|---|
| Persona with very low tech savviness receives a technical question | Tech-savvy question + low-tech persona | Persona responds in plain language, may express confusion or avoidance — this is correct and valuable behavior |
| Two personas with similar roles | e.g., "Startup PM" and "Product Manager at Series A" | Responses should diverge based on goals, frustrations, and behavioral context — role similarity should not produce response similarity |
| API timeout on one persona | One of 5 parallel calls times out | Pipeline continues with 4 transcripts; missing transcript is noted in synthesis confidence_disclaimer; run is not aborted |
| Question touches a topic outside the persona's stated experience | e.g., persona with no marketing background asked about marketing tools | Persona responds authentically from their perspective — lack of experience is a valid and valuable research signal |

##### Failure Modes & Mitigations

| Failure Mode | Probability | Impact | Mitigation |
|---|---|---|---|
| Character break ("as an AI…") | Low-Medium | High — destroys authenticity of transcript | System prompt explicitly prohibits character breaks; post-generation validation can scan for "as an AI" strings |
| Generic responses despite persona context | Medium | High — simulation echo chamber | System prompt requires specific details (tools, situations, feelings); 100-word minimum forces elaboration |
| Persona context not threaded (stateless API issue) | Low | High — all responses generic | Orchestration layer responsibility to inject full persona JSON per call; this is a build requirement, not a model requirement |
| Research goal leaks into Agent 3 context | Low | High — demand characteristics bias | Orchestration layer explicitly strips research_goal before building Agent 3 context object; this must be a unit-tested invariant |

---

#### FR-05: Synthesis + Insight Agent

##### The What

Analyses all transcripts cross-persona, extracts themes, identifies patterns, and generates product hypotheses and ranked recommendations as first-class outputs.

**Input:** All N transcripts (JSON) + Research goal (re-introduced here)
**Output:** Structured insight report (JSON)

**Report schema:**
```json
{
  "research_goal": "string",
  "persona_count": "number",
  "themes": [
    {
      "id": "theme_1",
      "title": "string",
      "description": "string",
      "frequency": "number of personas mentioning this",
      "evidence_quotes": [
        {
          "persona_name": "string",
          "quote": "string",
          "question_id": "string"
        }
      ]
    }
  ],
  "cross_persona_patterns": ["string"],
  "hypotheses": [
    {
      "id": "h1",
      "statement": "We believe [X] will result in [Y] for [segment] because [Z]",
      "confidence": "low | medium | high",
      "supporting_themes": ["theme_id"],
      "suggested_validation_method": "string"
    }
  ],
  "recommendations": [
    {
      "rank": 1,
      "action": "string",
      "rationale": "string",
      "priority": "high | medium | low",
      "effort": "low | medium | high"
    }
  ],
  "confidence_disclaimer": "string"
}
```

**Acceptance criteria:**
- Generates 3–5 distinct themes
- Each theme has a minimum of 2 evidence quotes from different personas
- All quotes are verbatim from the actual transcripts (no paraphrasing, no composition)
- Generates 3–5 hypotheses in the format: "We believe [X] will result in [Y] for [segment] because [Z]"
- Each hypothesis maps to at least one supporting theme
- Each hypothesis includes a suggested validation method
- Generates 3–5 ranked recommendations with action, rationale, priority, and effort
- All recommendations name a specific action (verb + object, not a vague direction)
- Includes a confidence disclaimer noting the synthetic nature of the research
- Output is valid JSON matching the schema

##### The Why

**Why does the research goal re-enter context at Agent 4 (after being excluded from Agent 3)?**
Agent 4's job is to evaluate findings against the stated research objective — a fundamentally different task than simulating human responses. The research goal is the evaluation frame: "Given that we wanted to understand X, what did we actually learn?" This is the appropriate context for synthesis. The goal never contaminated the interview responses (Agent 3 was blind to it), so the synthesis is evaluating authentic signals against the research question — not confirming a pre-formed hypothesis.

**Why themes before hypotheses?**
Themes are inductive — they emerge from the data. Hypotheses are deductive — they are claims built on top of patterns. Generating hypotheses directly from transcripts, without an intermediate theme-extraction step, produces speculation rather than research output. The chain — responses → themes → cross-persona patterns → hypotheses → recommendations — mirrors the analytic process a human researcher would follow, and for the same reason: each step provides the epistemic foundation for the next.

**Why is verbatim quote attribution mandatory (anti-hallucination)?**
The primary quality failure mode of LLM synthesis is hallucinating evidence. A model generating "representative quotes" is producing fiction — synthesizing what a persona probably said, not what was actually in the transcript. This destroys traceability and research credibility. Every evidence quote must be a character-for-character match to a string in the corresponding transcript. Post-generation validation enforces this by checking quote strings against the source transcripts.

**Why the specific hypothesis format ("We believe [X] will result in [Y] for [segment] because [Z]")?**
This is the Lean UX hypothesis format, and it is structured this way because it is testable and falsifiable. "Users want simplicity" is an observation — unfalsifiable and unactionable. "We believe reducing onboarding steps from 7 to 3 will increase week-1 retention for non-technical founders because they reported abandoning tools at the setup stage" is specific, measurable, and directly connected to a build decision. The format forces the model to commit to a cause-and-effect claim that can be validated in a real experiment.

**Why ranked recommendations (not a flat list)?**
Because the primary user (a PM or founder) needs to act, not deliberate. A flat list shifts the prioritization judgment back to the user — the exact cognitive work ResearchOS is designed to remove. A ranked list forces the model to make a priority call based on the evidence. Users can disagree with the ranking, but they have a starting point rather than a blank slate.

**Why `suggested_validation_method` on each hypothesis?**
The honest positioning of ResearchOS is: "here are the hypotheses worth validating with real users." Without a suggested next step, the output is a destination with no directions. The validation method field closes the loop — it makes explicit that synthetic output is the beginning of a research process, not the end of one.

##### Prompt Architecture

**Design philosophy:** Four-step chain-of-thought synthesis. Each step builds on the last. Anti-hallucination is enforced through the verbatim quote mandate — the model must demonstrate that every claim is traceable to the transcript source.

**System prompt template:**
```
You are an expert qualitative research analyst. You have received {{persona_count}} simulated interview transcripts from a synthetic user research study. Your role is to synthesize these transcripts into a structured insight report.

FOUR-STEP SYNTHESIS CHAIN — complete all four steps before generating output:

STEP 1 — THEME EXTRACTION:
  Identify 3–5 major themes across all transcripts. A valid theme must:
  - Be mentioned by at least 2 different personas
  - Be grounded in transcript evidence (not inferred)
  - Have a title that describes the pattern, not the instance

STEP 2 — CROSS-PERSONA PATTERNS:
  Identify 2–3 patterns that cut across personas — tensions, agreements, surprises, or contradictions that are analytically interesting.

STEP 3 — HYPOTHESIS GENERATION:
  Generate 3–5 product hypotheses in this exact format:
  "We believe [specific product change or design decision] will result in [specific outcome] for [specific user segment] because [evidence from themes or transcripts]."

  Rules:
  - Each hypothesis must be testable (falsifiable by a specific experiment or metric)
  - Each hypothesis must cite at least one theme by id
  - Each hypothesis must include a suggested_validation_method (e.g., "Run a 5-person usability test on the onboarding flow with non-technical founders")
  - Do NOT generate hypotheses that restate the research goal

STEP 4 — RANKED RECOMMENDATIONS:
  Generate 3–5 specific, ranked product actions. Each must:
  - Name a concrete action: [verb] + [object] (e.g., "Remove the manual configuration step from onboarding")
  - Cite the theme or hypothesis that supports it
  - Include a priority (high/medium/low) and effort (low/medium/high) rating

ANTI-HALLUCINATION MANDATE:
  Every evidence_quote in every theme must be copied verbatim — character for character — from the provided transcripts. Do not paraphrase. Do not summarize. Do not compose. If a theme lacks 2 verbatim quotes from different personas, it does not qualify as a theme.

OUTPUT: Return a valid JSON object matching the provided schema. Do not include any text outside the JSON.
```

**User prompt template:**
```
Research goal: {{research_goal}}
Product description: {{product_description}}
Persona count: {{persona_count}}

Transcripts:
{{transcript_array_json}}

Complete all four synthesis steps and return the structured insight report.
```

**Post-generation validation:**
- Parse JSON — fail if malformed
- Assert `themes` array length is 3–5
- Assert each theme has `evidence_quotes` array with ≥ 2 items from different `persona_name` values
- **Anti-hallucination check:** for each evidence quote, verify the `quote` string exists as a substring in the corresponding persona's transcript in the input
- Assert `hypotheses` array length is 3–5
- Assert each hypothesis `statement` contains the strings "We believe", "will result in", and "because"
- Assert each hypothesis has non-empty `suggested_validation_method`
- Assert `recommendations` array length is 3–5
- Assert `confidence_disclaimer` is non-empty

##### Stress Tests

| Scenario | Input | Expected Behavior |
|---|---|---|
| Transcripts contain thin responses (quality_flag: thin) | Multiple transcripts with flagged thin responses | confidence_disclaimer acknowledges thin evidence; themes extracted from available evidence; theme frequency counts are accurate |
| Only 2 personas' transcripts available (one failed) | 4 instead of 5 transcripts passed | confidence_disclaimer notes incomplete data; synthesis proceeds with available transcripts; theme minimum of 2 quotes still required |
| All personas gave similar responses | Echo-chamber run due to poor persona MECE | 3–5 themes may overlap heavily; cross_persona_patterns notes the convergence; confidence for any one theme increases with more persona agreement |
| Research goal was a validation question | "Does our feature work?" | Synthesis frames findings as evidence for/against the question rather than generative discovery; this is a valid but suboptimal use case |

##### Failure Modes & Mitigations

| Failure Mode | Probability | Impact | Mitigation |
|---|---|---|---|
| Hallucinated evidence quotes | Medium | Critical — destroys research credibility | Post-generation anti-hallucination check; any quote that fails substring match is flagged or rejected |
| Themes are generic ("users want simplicity") | Medium | High — output is not actionable | System prompt requires titles describing the pattern, not the instance; specificity enforced in validation |
| Hypotheses restate the research goal | Medium | Medium — not generative | System prompt explicitly prohibits restating research goal; validation can check semantic overlap |
| JSON schema non-compliance | Low | High — pipeline breaks | JSON parse + schema validation; retry once with explicit schema reminder |

---

#### FR-06: Formatted Report Output

##### The What

Renders the structured JSON insight report into a human-readable, scannable format.

**Acceptance criteria:**
- Report renders in readable sections: Overview → Personas → Themes → Hypotheses → Recommendations
- Each theme shows title, description, frequency count, and representative quotes
- Each hypothesis is shown in the "We believe..." format with confidence indicator
- Recommendations are shown in ranked order with priority and effort tags
- Full report is selectable and copy-pasteable
- Confidence disclaimer is permanently visible at the bottom of the report
- Report renders correctly on desktop screen widths

##### The Why

**Why a formatted render (not just raw JSON)?**
The primary user (a PM or founder) is not a developer. The report is a decision-making artifact — it needs to be skimmable in under 10 minutes. JSON output is the pipeline's internal language; the rendered report is the product's external interface. The rendering layer is also where the confidence disclaimer becomes persistent and unavoidable, not buried.

**Why is the confidence disclaimer permanently visible (not dismissible)?**
The synthetic nature of the research is a product honesty requirement, not a legal footnote. A PM who forgets they are reading synthetic research may over-index on findings for consequential product decisions. Permanent visibility is a feature — it keeps the epistemic status of the output clear throughout the reading experience.

**Why copy-paste as the primary export mechanism (not PDF)?**
Founders and PMs live in Notion, Google Docs, and Slack. PDF requires downloading, uploading, and reformatting. Plain text or markdown copy-paste integrates into existing workflows with zero friction. PDF export is a v2 enhancement.

##### Stress Tests

| Scenario | Input | Expected Behavior |
|---|---|---|
| Report with 8 personas and 8 questions | Large JSON report | Sections remain scannable; no truncation; scroll-based layout handles length |
| Theme with 5 evidence quotes | High-frequency theme | All quotes rendered; visual design accommodates variable quote count |
| Long recommendation action text | Action text > 100 chars | Text wraps cleanly; no UI overflow |

##### Failure Modes & Mitigations

| Failure Mode | Probability | Impact | Mitigation |
|---|---|---|---|
| JSON-to-render mapping breaks on schema change | Low | High — blank or broken report | Render layer is decoupled from schema; defensive null checks on all optional fields |
| Report not copy-pasteable due to CSS rendering | Low | Medium — friction on export | Plain text / markdown layer underlying the styled render; copy button extracts markdown not HTML |

---

### 11.2 Non-Functional Requirements

| Requirement | Target |
|---|---|
| End-to-end latency | <5 minutes for 5 personas, 6 questions |
| Pipeline completion rate | >95% across test runs |
| Cost per run | <$0.50 at default settings (5 personas, 6 questions) |
| Consistency | >0.75 cosine similarity between two runs on identical input |
| JSON schema compliance | 100% — all agent outputs must match their defined schemas |
| Hallucination rate | <5% of insights not traceable to transcript evidence |

---

### 11.3 Cross-Cutting Requirements

These requirements apply across all agents and the orchestration layer — not to any single functional component.

---

#### CC-01: JSON Schema Validation at Agent Boundaries

Every agent output is validated against its defined schema before being passed to the next agent. Schema validation is synchronous and blocking — a malformed output causes a structured error response, not a silent failure that propagates bad data downstream.

**Validation must check:**
- JSON is parseable (not malformed)
- All required fields are present and non-null
- Enum fields contain only permitted values
- Array fields meet minimum length requirements

**On failure:** Log the error, attempt one retry with an explicit schema correction prompt appended. If retry fails, surface the error to the user with a clear message and allow restart.

---

#### CC-02: Persona Context Threading

The LLM API is stateless. Agent 3 makes one API call per question-response pair. The full persona JSON must be injected into the system prompt of every Agent 3 call. The orchestration layer owns this responsibility — it must construct each call's context from the persona array before dispatching.

This is a build invariant, not a model behavior. Unit tests must verify that every Agent 3 call contains the expected persona_id in its context.

---

#### CC-03: Cost Transparency

Before the user submits the intake form, the UI must display an estimated cost and estimated latency based on the selected persona count and question count. After run completion, actual token usage and actual cost are logged and displayed on the report page.

**Why:** Users making multiple runs need to understand the cost implications of different settings. Showing cost pre-run prevents surprise billing; showing post-run actuals builds trust and allows the user to optimize future runs.

---

#### CC-04: Graceful Partial Completion

If one persona's simulation fails (API timeout, rate limit error, model error), the pipeline does not abort. It continues with the remaining personas and marks the missing transcript as absent in the synthesis input. Agent 4 receives the available transcripts and notes the incomplete data set in the `confidence_disclaimer` field of the output report.

**Why:** Aborting a 4-minute run because one of 5 parallel calls timed out is a poor user experience. Partial completion with explicit acknowledgment is preferable to full failure.

---

## 12. User Stories

### Epic 1: Research Setup

---

#### US-01 — Define Research Context

> As an early-stage founder, I want to describe my product problem and research goal in plain language so that the system can set up a research study without me needing to know research methodology.

**The Why:**
The intake form is the quality gate for the entire pipeline. Every downstream agent is conditioned on this input — vague input compounds into generic personas, bland questions, and hollow synthesis. But this story must also balance quality against abandonment: if the form takes more than 3 minutes, time-pressured founders skip it entirely. This story defines the minimum-viable quality gate that doesn't create friction greater than the problem it solves.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| Form completable in under 3 minutes | The primary user is time-pressured. More than 3 minutes of setup and they'll skip research entirely — defeating the product's purpose |
| Each field has a concrete example in placeholder text | Users need to see what "good input" looks like before they can write it. Abstract field labels produce abstract responses. Example: "e.g., We're building a tool that helps solo founders track MRR without a finance background." |
| Character minimums enforced with inline errors (not on submit) | Inline errors catch low-quality inputs at the field level, before the user has to scroll back to find the error after a failed submit |
| Research goal field includes a note guiding toward discovery framing | Discovery questions produce better pipeline output than validation questions. The note nudges toward the right frame without blocking a validation question if the user insists. |
| Product stage dropdown uses plain language labels | "Idea / Pre-MVP / MVP / Post-launch" maps to how founders think. "Stage 1 / 2 / 3 / 4" does not. |
| On submit, all field values are compiled into a single JSON object | Downstream agents need a typed, parseable context object — not a set of independent strings. Compilation at submission is the orchestration layer's responsibility. |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| User enters a validation question as research goal | Placeholder text and field note guide toward discovery framing; pipeline is not blocked — output quality may be lower |
| User sets minimum personas (2) and questions (4) | System runs; synthesis confidence_disclaimer notes lower confidence with smaller sample |
| User pastes existing research brief verbatim | May exceed field length; will work but may inject noise. Future v2 could parse a brief into the structured fields automatically. |

---

#### US-02 — Review Generated Personas

> As a PM, I want to see the AI-generated personas before the interview simulation runs so that I can verify they represent my actual target user segments.

**The Why:**
Persona quality is the root cause of simulation quality. A PM or founder with domain knowledge can catch obvious gaps ("we have no enterprise persona here") or mismatches ("this persona doesn't match our actual user at all") before they propagate into 30 LLM calls of bad simulation data. This review gate introduces 60–90 seconds of friction that can prevent a 4-minute wasted run.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| Personas displayed as readable cards, not raw JSON | The user's task is pattern recognition and gap detection — they need to scan 5 cards in 60 seconds, not parse JSON |
| Each card shows name, role, background, goals, and frustrations | These are the fields a PM can verify against domain knowledge. Age and location are decorative; goals and frustrations are diagnostic. |
| Cards are visually distinct from one another (role displayed prominently) | If all 5 cards look identical, the MECE requirement has failed. The layout must make variation visible at a glance. |
| Persona set shows at least one visually distinct "skeptic" or "resistant" persona | Anti-sycophancy requirement made visible — the PM should see that the persona set includes challenge, not just enthusiasm |
| OQ-01 decision determines whether "Confirm & Continue" CTA is present | If pipeline pauses here: user clicks Confirm to proceed. If pipeline is auto-continuous: personas are shown in progress, not as a gate. OQ-01 must be resolved in Phase 2. |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| All personas look like variations of the same user | Anti-sycophancy and MECE rules in FR-02 prompt architecture prevent this; if it happens, user can restart with a more specific intake |
| User wants to edit a persona manually | Out of scope for MVP (Section 14); restart with a more specific intake is the escape hatch |

---

#### US-03 — Review Interview Guide

> As a PM, I want to see the generated interview questions before simulation so that I can verify they address my research goal.

**The Why:**
Interview questions determine the surface area of the simulation. If the questions are generic, the transcripts will be generic regardless of persona quality. This review moment gives the user a chance to verify that the questions probe the specific problem they care about — and to restart before 30 LLM simulation calls run on the wrong questions.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| Questions displayed in order with intent and follow-up probes visible | The PM needs to see not just what is asked but why — the intent field makes the analytical purpose transparent |
| Questions are numbered and labeled (warmup / core 1–N / closing) | Structure makes it easy to scan the arc of the interview and spot any missing coverage areas |
| Each question's connection to the research goal is visible | Prevents generic questions from passing unnoticed — if a question doesn't clearly connect to the goal, the PM can catch it |
| OQ-01 decision determines whether "Confirm & Continue" CTA is present | Same as US-02 — Phase 2 design decision |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| Questions appear disconnected from research goal | FR-03 intent field validation prevents this at generation; review gate is the human catch |
| User wants to edit a specific question | Out of scope for MVP; restart is the escape |

---

### Epic 2: Research Execution

---

#### US-04 — Run Simulated Interviews

> As a founder, I want the system to simulate interviews with each persona automatically so that I get research data without recruiting or scheduling participants.

**The Why:**
This is the core value proposition in execution form. The simulation must run without user intervention — removing the user from the loop is the point. The latency target (<5 minutes) is not arbitrary: it maps to a single focused work session. If the run takes longer than 5 minutes, the user context-switches and loses momentum. Under 5 minutes, the result lands while the research question is still front of mind.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| Simulation runs for all N personas without user intervention | Any required input mid-run breaks the "no participants needed" value proposition |
| Progress indicator shows which persona is being simulated | Opaque progress causes uncertainty and abandonment. "Simulating Priya (3 of 5)..." is reassuring; a blank screen is not. |
| Each persona's simulation runs in parallel (not sequentially) | Sequential execution for 5 personas would take 5× longer. Parallelism is the latency mechanism. |
| Estimated time remaining is shown during run | Helps the user decide whether to wait or switch tasks and come back |
| On completion, user is automatically directed to the transcript view | Removes one click and keeps the flow moving |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| One persona's simulation times out | CC-04 graceful partial completion — pipeline continues with N-1 transcripts; missing transcript noted |
| Rate limit hit during parallel execution | Orchestration layer implements retry with exponential backoff; total latency may increase but run does not fail |
| Run exceeds 5-minute target | Latency target is a success metric (Category 1); if exceeded, it surfaces as a metric failure in Phase 4 evaluation, not a product failure for the user |

---

#### US-05 — View Interview Transcripts

> As a researcher, I want to read the simulated transcripts so that I can verify the depth and relevance of the responses before reading the synthesis.

**The Why:**
Transcripts are the audit trail. A researcher reviewing ResearchOS output needs to verify that the synthesis is grounded in substantive responses — not that the model generated plausible-sounding summaries of thin content. Making transcripts accessible and readable builds trust in the synthesis layer by making the evidence chain transparent.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| Each transcript is accessible by persona (tabbed or expandable view) | Scanning one persona's full transcript is the primary review mode — sequential Q&A per persona, not question-by-question across all personas |
| Responses are clearly attributed (question text shown above each response) | Context needed to evaluate whether a response actually answers the question |
| Thin responses (quality_flag: thin) are visually flagged | Surfaces quality issues before the user reads the synthesis — sets appropriate expectations |
| Transcripts are readable as prose, not JSON | Target user is not a developer; JSON view is not an option for MVP |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| Transcript responses are thin despite 100-word minimum | quality_flag: thin surfaces the issue; synthesis confidence_disclaimer notes it |
| Character break detected in a response | Post-generation validation in FR-04 scans for character breaks; flagged transcripts are displayed with a warning |

---

### Epic 3: Insight Generation

---

#### US-06 — Read Synthesised Themes

> As a PM, I want to see the major themes extracted from the interviews so that I can understand what matters most to my target users.

**The Why:**
Themes are the inductive layer — the raw patterns that emerge from transcript data before analytical claims are made. A PM reading themes is building mental context for the hypotheses and recommendations that follow. If themes are generic or poorly evidenced, the hypotheses built on them will be unconvincing. This story defines what makes a theme credible and useful.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| 3–5 themes shown with title, description, and persona frequency count | Frequency count tells the PM how prevalent the theme is across the sample — a theme mentioned by 5/5 personas is a different signal than one mentioned by 2/5 |
| Each theme shows 2+ representative verbatim quotes from different personas | Quotes are the evidence. Quotes from two different personas demonstrate a cross-persona pattern, not a single anecdote. Verbatim (not paraphrased) is the anti-hallucination requirement. |
| Themes are ordered by frequency (most prevalent first) | Highest-signal themes should be read first. Ordering by frequency is a simple, defensible prioritization rule. |
| Each quote is attributed to the persona who said it | Traceability — the PM can cross-reference the quote against the transcript in US-05 if needed |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| Theme titles are generic ("users want simplicity") | FR-05 system prompt requires descriptive pattern titles; post-generation validation can flag one-phrase generic titles |
| Evidence quote does not match the transcript | Anti-hallucination check in FR-05 post-generation validation catches this before the report is rendered |

---

#### US-07 — Receive Product Hypotheses

> As a founder, I want structured product hypotheses as output so that I know what assumptions are worth testing next.

**The Why:**
Hypotheses are ResearchOS's primary differentiator. No competitor produces testable product hypotheses as a first-class output. This story defines what makes a hypothesis useful: it must be specific enough to be falsifiable, grounded in the synthetic evidence, and connected to a next step. A hypothesis that the founder can immediately argue about and decide whether to test is the target — not a generic "insight."

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| 3–5 hypotheses shown in "We believe [X] will result in [Y] for [segment] because [Z]" format | The Lean UX format enforces testability. "We believe" marks it as a claim, not a fact. "Will result in" requires a predicted outcome. "Because" requires evidence. Each clause is a quality gate. |
| Each hypothesis shows confidence level (low / medium / high) | Confidence is a function of how many personas supported the underlying themes. It calibrates the PM's prior before they decide whether to validate with real research. |
| Each hypothesis shows its supporting themes | Traceability — the PM can verify that the hypothesis is grounded in the evidence, not invented |
| Each hypothesis shows a suggested validation method | Closes the loop to real research. "Run a 5-person usability test on the onboarding flow with non-technical founders" is actionable. "Validate further" is not. |
| Hypotheses are specific to the product problem, not generic | Generic hypotheses ("users want ease of use") are not acceptable outputs. Specificity is validated by checking that the hypothesis names a concrete product change or feature area. |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| Hypotheses restate the research goal | FR-05 system prompt explicitly prohibits this; post-generation validation can check semantic overlap |
| Suggested validation method is vague | System prompt requires specific methods; post-generation validation flags generic strings like "conduct more research" |

---

#### US-08 — Receive Ranked Recommendations

> As a PM, I want ranked, specific recommendations so that I know what actions to take as a result of this research.

**The Why:**
Recommendations are the bridge between research and product decisions. A flat list of observations leaves all prioritization judgment with the PM. A ranked list of specific actions removes that cognitive load — the PM can agree or disagree with the ranking, but they have a concrete starting point. Specificity is non-negotiable: "improve onboarding" is not a recommendation — "remove the manual configuration step from onboarding" is.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| 3–5 recommendations shown in priority rank order | Ranked because the PM's first action is more important than their fifth. The model makes a priority call; the PM can override it. |
| Each recommendation names a specific action (verb + object) | "Simplify the experience" is not an action. "Remove the manual API key configuration step from the onboarding flow" is. The verb-object format is enforced in FR-05 system prompt. |
| Each recommendation shows rationale citing supporting themes or hypotheses | Traceability from recommendation to evidence. A PM who disagrees with a recommendation can evaluate whether they also disagree with the evidence behind it. |
| Priority (high/medium/low) and effort (low/medium/high) tags are shown | Enables the PM to identify quick wins (high priority, low effort) and long-term bets (high priority, high effort) at a glance |
| Top recommendation can be acted on immediately without further interpretation | The acceptance bar for "specific enough": a PM should be able to open a Jira ticket for the top recommendation without a clarifying conversation. |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| Recommendations are vague | FR-05 system prompt requires verb + object format; post-generation validation can flag recommendations without a verb |
| Recommendations are not ranked (flat list output) | Schema enforces `rank` field as required integer; validation checks rank values are sequential from 1 |

---

#### US-09 — Export the Research Report

> As a founder, I want to copy the full report so that I can share it with my co-founder or team without requiring them to use the tool.

**The Why:**
Research output has no value if it stays inside the tool. Founders and PMs share findings in Notion, Google Docs, and Slack — not via tool links. Copy-paste is the zero-friction export mechanism that integrates with every existing workflow. The confidence disclaimer must travel with the export — a shared report without the synthetic caveat misrepresents the research to readers who weren't there for the context.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| "Copy full report" button copies the report as structured markdown | Markdown preserves headings, bold labels, and bullet structure in Notion, Google Docs, and Slack — the three primary destinations |
| Exported format includes all sections (personas, themes, hypotheses, recommendations) | Partial exports lose context. The recipient needs the full report to understand the recommendations. |
| Confidence disclaimer is included in every export, not just the rendered view | A shared report without the disclaimer is a synthetic research artifact presented without its epistemic status. This is a product honesty requirement. |
| Copy action provides visual confirmation ("Copied!" toast) | Without confirmation, users click the button twice and end up with a double-paste. |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| Clipboard API unavailable in some browsers | Fallback: show the full report text in a modal textarea that the user can manually select-all and copy |
| Exported markdown does not render correctly in destination tool | Test against Notion and Google Docs rendering in Phase 3; adjust markdown syntax if needed |

---

### Epic 4: Trust & Transparency

---

#### US-10 — Understand Research Limitations

> As a PM, I want to know this is synthetic research and what that means so that I don't over-index on the findings for high-stakes decisions.

**The Why:**
Synthetic research is a powerful directional tool. It is also capable of producing confident-sounding output that misleads users into treating it as validated fact. The confidence disclaimer is the product's primary honesty mechanism — it defines the epistemic status of every output ResearchOS produces. Making it permanent (not dismissible) and specific (not a vague legal footnote) is a product design choice, not a legal requirement. This story protects users from the most common misuse of the tool.

**Acceptance Criteria (Deep):**

| Criterion | Why It Exists |
|---|---|
| Confidence disclaimer is permanently visible at the bottom of every report | A dismissible disclaimer is dismissed. A permanent one stays in view throughout the reading experience. The user's epistemic state while reading the recommendations should always include "this is synthetic." |
| Disclaimer uses plain language, not legal boilerplate | "This research was generated by AI using synthetic personas, not real users. Use these findings as directional signals to generate hypotheses — not as validated conclusions." This is a product communication, not a terms-of-service notice. |
| Disclaimer specifically names what synthetic research cannot tell you | Say-do gap, statistical validity, behavioral observation — the three primary failure modes should be named, not implied. |
| Disclaimer suggests a next step (when to run real research) | "Consider validating the top hypothesis with 5 real users before committing to a major product change." The disclaimer is not just a warning — it's a recommendation for how to use the output responsibly. |

**Failure Modes:**

| Failure Mode | Mitigation |
|---|---|
| Disclaimer is dismissed or hidden | Design decision: not dismissible. Permanent placement in the report layout is a constraint, not a preference. |
| User treats synthetic findings as statistically valid | Disclaimer explicitly states the research is not statistically valid; positioning (Section 7.1) reinforces this throughout the product experience |

---

## 13. Assumptions & Constraints

### 13.1 Product Assumptions

| # | Assumption | Risk if wrong |
|---|---|---|
| A-01 | LLMs have sufficient training data to model common user personas in mainstream product domains | Personas are generic and shallow in niche domains → mitigated by scoping to mainstream domains initially |
| A-02 | Synthetic personas provide directional signal even if not behaviorally accurate | The product's core value proposition fails → mitigated by honest positioning and the confidence disclaimer |
| A-03 | Early-stage founders and PMs will act on directional research even without statistical validity | Low adoption → mitigated by framing output as "hypotheses to test," not "proof" |
| A-04 | The say-do gap (what users say vs. what they do) is acceptable within the stated use case | Users over-rely on synthetic findings for behavioral product decisions → mitigated by disclaimer and positioning |
| A-05 | 5 personas and 6 questions provide sufficient data for meaningful synthesis | Synthesis output is too thin → can increase defaults or add a quality check gate |
| A-06 | Parallel execution per persona is achievable within the LLM API's rate limits | Latency target fails or runs hit rate limit errors → mitigated by queuing logic |

### 13.2 Technical Assumptions

| # | Assumption | Risk if wrong |
|---|---|---|
| T-01 | Claude (Anthropic API) will be the primary LLM for all agents | N/A — this is a design decision, not an assumption |
| T-02 | Sequential pipeline with parallel execution within Agent 3 is sufficient for latency target | Latency exceeds 5 minutes → explore streaming or async display of partial results |
| T-03 | A web application (browser-based) is the right delivery format for MVP | Wrong channel → defer to Phase 2 validation |
| T-04 | Structured JSON outputs between agents are reliable without strict output parsing validation | Malformed JSON breaks the pipeline → mitigated by output schema validation at each agent boundary |
| T-05 | No authentication or user accounts are required for MVP | Cannot save or revisit past reports → accepted tradeoff for MVP |

### 13.3 Business Assumptions

| # | Assumption | Risk if wrong |
|---|---|---|
| B-01 | The primary user (early-stage founder/PM) will self-serve without onboarding | Abandonment at intake form → mitigated by example prompts and guided UI |
| B-02 | Synthetic research is positioned as a complement to, not replacement of, real research | Backlash from research community → mitigated by transparent positioning and disclaimers |
| B-03 | The ground-truth evaluation method (comparing against published case studies) is a valid proxy for research quality | Evaluation results are misleading → use 3 diverse products with well-documented research to triangulate |

---

## 14. Out of Scope (MVP)

The following are explicitly not being built for the MVP. They are documented here to prevent scope creep and to serve as a future roadmap backlog.

| Feature | Category | Why deferred |
|---|---|---|
| Real participant recruitment | Core feature | Contradicts the synthetic-only thesis for MVP |
| Video / audio capabilities | Core feature | Significant infra complexity; text is sufficient for MVP |
| Pre-research intelligence module (assumption audit, method selection) | Pipeline stage | High value but not required for core pipeline to function |
| Research repository / knowledge management | Post-research | Build v2 after core pipeline is validated |
| Action tracking and impact measurement | Post-research | Requires longitudinal usage; not feasible in 4-week capstone |
| User authentication and saved sessions | Infrastructure | Adds complexity without validating the core pipeline |
| Multi-user collaboration | Infrastructure | Single-user is sufficient for MVP validation |
| Custom persona upload / manual persona editing | Feature | Adds UI complexity; auto-generation is the core thesis |
| RAG over proprietary company data | Feature | High value (Synthetic Users does this) but adds infra; post-MVP |
| Integration with external tools (Jira, Notion, Figma, Slack) | Integration | Out of scope for capstone; post-MVP |
| Quantitative research methods (surveys, A/B) | Research method | Out of scope; qualitative synthetic interviews is the MVP bet |
| Mobile application | Platform | Desktop web is sufficient for MVP |
| Real-time streaming of responses | Performance | Nice-to-have; polling or async is acceptable for MVP |

---

## 15. Open Questions

These questions are unresolved and need to be answered during Phase 2 (Design) or early Phase 3 (Build).

| # | Question | Owner | Decision needed by |
|---|---|---|---|
| OQ-01 | Does the pipeline pause for user review between each agent stage, or does it run end-to-end automatically? | Design | Phase 2 |
| OQ-02 | What is the tech stack? (Frontend framework, backend language, hosting) | Engineering | **Resolved — see `TECH-SPEC.md`** |
| OQ-03 | Do we use Claude only, or a multi-model approach per agent? | Engineering | Phase 3 kickoff |
| OQ-04 | How do we handle thin or low-quality responses from the simulation agent? (retry, flag, discard?) | Product | Phase 3 |
| OQ-05 | Is the output format a web-rendered report, a downloadable PDF, or both? | Design | Phase 2 |
| OQ-06 | What is the error state UX when a pipeline run fails mid-way? | Design | Phase 2 |
| OQ-07 | Should the number of personas and questions be configurable after generation, or locked at intake? | Product | Phase 2 |
| OQ-08 | What is the ground truth corpus for Phase 4 evaluation? (Which 3 products with published research?) | Research | Phase 4 planning |
| OQ-09 | Should the confidence disclaimer be dismissible, or permanently visible on every report? | Design | Phase 2 |
| OQ-10 | Do hypotheses include a priority ranking, or are they presented as a flat list? | Product | Phase 3 |

---

*Document last updated: 2026-06-16*

---

## 16. Phase 2 — UI Flow & Screen Specifications

> Full screen specifications, copy, brand system, and visual language are documented in **`DESIGN-SPEC.md`**.

**Decisions locked for this phase:**
- Pipeline pauses after every agent stage for user review
- User can modify output at every gate (except Gate 3 — regenerate-only, no direct editing)
- Desktop web only, single-user, session-based (no auth)
- Export mechanism: copy as markdown

**10 screens across 5 states:** Landing → Intake → [Load → Gate] × 4 → Report

---

### Screen 1 — Landing Page

**Purpose:** Introduce the product, establish trust, drive the user to start a run.

**Layout:** Full-width, single-scroll page. Fixed top navigation. Three content sections below the hero. Sticky CTA at the bottom on scroll.

**Components:**

| Component | Content |
|---|---|
| Nav bar | Logo (ResearchOS) · "How it works" anchor link · "Start Research" CTA button (right-aligned) |
| Hero section | Headline: **"From product problem to research insight in minutes."** Sub-headline: "No participants. No scheduling. No synthesis. ResearchOS runs the research — you make the decisions." · Primary CTA button: **"Start a Research Run →"** |
| How it works | 4-step horizontal pipeline visual: Describe your problem → Generate personas → Simulate interviews → Get hypotheses + recommendations. Brief one-line description under each step. |
| Honest positioning strip | Two-column layout. Left: "Built for" list (problem discovery, segment mapping, hypothesis generation). Right: "Not a substitute for" list (usability testing, statistical research, behavioral observation). This sets expectations before the user starts. |
| Social proof / context | Capstone context note or a single illustrative example output (a sample theme + hypothesis card). Shows what the output looks like before committing. |
| Footer CTA | "Ready to run your first study?" · **"Start Research →"** button · Confidence note: "ResearchOS uses synthetic AI personas. Output is directional, not statistically validated." |

**Interactions:**
- "Start a Research Run" / "Start Research" buttons → navigate to Screen 2 (Intake Form)
- "How it works" anchor → smooth scroll to that section
- Sticky bottom CTA appears after scrolling past the hero

**Transition trigger:** Any CTA click → Screen 2

**Edge / error states:** None. This is a static screen.

---

### Screen 2 — Intake Form

**Purpose:** Capture the minimum context needed to condition all four agents. This is the quality gate — vague input compounds downstream.

**Layout:** Centered single-column form, max width 720px. Progress indicator at top showing "Step 1 of 5 — Research Setup". Back arrow to Landing.

**Components:**

| Component | Detail |
|---|---|
| Page heading | "Set up your research" · Sub-text: "The more specific you are, the better your output." |
| Field 1 — Product description | Textarea · Min 50 chars · Label: "Describe your product and the problem it solves" · Placeholder: "e.g., We're building a tool that helps solo founders track MRR without a finance background." · Character counter shown below field |
| Field 2 — Target user | Textarea · Label: "Who is your target user?" · Placeholder: "e.g., Non-technical solo founders running B2B SaaS products under $10K MRR." |
| Field 3 — Research goal | Textarea · Label: "What is the one question this research should answer?" · Placeholder: "e.g., What are the biggest friction points founders face when trying to understand their revenue trends?" · Helper text below: "Frame this as a discovery question — 'what' or 'how' questions produce better output than 'does this work' questions." |
| Field 4 — Product stage | Dropdown · Options: Idea · Pre-MVP · MVP · Post-launch · Label: "Where is your product right now?" |
| Field 5 — Persona count | Stepper (2–8) · Default: 5 · Label: "How many user personas should be generated?" · Helper: "5 is recommended for most research goals." |
| Field 6 — Question count | Stepper (4–8) · Default: 6 · Label: "How many interview questions per persona?" |
| Cost + time estimate | Shown below the steppers, updates in real time as persona/question count changes · "Estimated run time: ~3 min · Estimated cost: ~$0.30" |
| Submit CTA | "Generate Personas →" · Disabled until all required fields pass validation · Inline field-level error messages on blur |

**Interactions:**
- Character counter updates live as user types
- Cost + time estimate recalculates when persona or question stepper changes
- Inline validation fires on field blur, not on submit
- Submit → validates all fields → if valid, saves intake JSON to session → navigates to Screen 3

**Transition trigger:** Valid form submission → Screen 3

**Error states:**
- Field below character minimum → red border + inline message "Add more detail (min 50 characters)"
- Submit with empty required field → field scrolls into view, highlighted

---

### Screen 3 — Loading: Persona Generation

**Purpose:** Show the user that the pipeline is running and set expectations for what comes next.

**Layout:** Centered, vertically centered in viewport. Minimal — no distractions.

**Components:**

| Component | Detail |
|---|---|
| Agent label | "Agent 1 of 4 — Persona Generation" |
| Animated indicator | Subtle pulsing or spinning indicator (not a progress bar — indeterminate duration) |
| Status message | "Generating {{persona_count}} personas based on your research goal..." |
| Pipeline mini-map | 4-step strip at the bottom showing current step highlighted: [Personas] → Guide → Interviews → Synthesis |
| Estimated time | "This usually takes under 30 seconds." |

**Interactions:** None. Non-interactive loading state.

**Transition trigger:** Agent 1 response received and validated → Screen 4

**Error state:** If Agent 1 fails after retry → error screen: "Persona generation failed. Check your input and try again." · "Edit intake" button + "Retry" button.

---

### Screen 4 — Gate 1: Persona Review & Edit

**Purpose:** Let the user verify that the generated personas represent the right target segments before any further pipeline work runs. This is the highest-leverage quality gate — persona quality determines simulation quality.

**Layout:** Full-width. Progress indicator: "Step 2 of 5 — Review Personas". Grid of persona cards (2 or 3 columns depending on persona count). Action bar at the bottom.

**Components:**

| Component | Detail |
|---|---|
| Page heading | "Review your personas" · Sub-text: "These personas will be interviewed. Make sure they represent the range of users you care about." |
| Persona cards grid | One card per persona. Each card shows: Name · Role · Age + Location · Background (truncated, expandable) · Goals (2–3 bullets) · Frustrations (2–3 bullets) · Quote (italicised) · "AI generated" badge |
| Card actions | Each card has: **Edit** (opens edit panel) · **Regenerate** (re-runs Agent 1 for this persona only) · **Delete** (removes card, minimum 2 must remain) |
| Edit panel | Slides in from right. Editable fields for all persona properties. Save / Cancel buttons. On save, card shows "Edited" badge instead of "AI generated". |
| Add persona button | "+ Add persona" button below the grid. Opens blank edit panel. Added persona shows "User added" badge. Capped at 8 total. |
| Confirm CTA | "Confirm personas and generate interview guide →" · Disabled if 0 personas remain |
| Back link | "← Edit intake" — returns to Screen 2, clears session (with confirmation modal: "Going back will restart your run. Continue?") |

**Interactions:**
- Edit card → slide-in panel with all fields editable inline
- Regenerate → shows loading spinner on that card only → replaces card content on completion
- Delete → card fades out, count updates, confirm CTA label updates
- Add → blank edit panel → on save, new card added to grid with "User added" badge
- Confirm → saves modified persona array to session → Screen 5

**Transition trigger:** "Confirm personas" CTA → Screen 5

**Error states:**
- All personas deleted → confirm CTA disabled, message: "Add at least 2 personas to continue"
- Persona regeneration fails → card shows "Regeneration failed. Try again." with retry button

---

### Screen 5 — Loading: Interview Guide Generation

**Purpose:** Show progress while Agent 2 runs.

**Layout:** Same as Screen 3.

**Components:**

| Component | Detail |
|---|---|
| Agent label | "Agent 2 of 4 — Interview Guide" |
| Status message | "Designing {{question_count}} questions grounded in your research goal..." |
| Pipeline mini-map | Step 2 highlighted: Personas → [Guide] → Interviews → Synthesis |
| Estimated time | "This usually takes under 20 seconds." |

**Transition trigger:** Agent 2 response received and validated → Screen 6

**Error state:** Guide generation failed → "Edit intake" · "Retry" buttons.

---

### Screen 6 — Gate 2: Interview Guide Review & Edit

**Purpose:** Let the user verify that the questions will probe the right areas before 30 LLM simulation calls run on a guide they might want to change.

**Layout:** Full-width. Progress indicator: "Step 3 of 5 — Review Interview Guide". Single-column question list. Action bar at bottom.

**Components:**

| Component | Detail |
|---|---|
| Page heading | "Review your interview guide" · Sub-text: "These questions will be asked to every persona. Make sure they address what you actually want to learn." |
| Research goal reminder | Pill or callout at the top: "Research goal: [user's research goal text]" — keeps the anchor visible while reviewing questions |
| Warm-up question | Displayed at top, labeled "Warm-up". Edit / Regenerate actions. |
| Question list | Numbered 1–N. Each question shows: Question text · Intent (collapsible, labeled "Why this question") · Follow-up probes (collapsible, labeled "Probes", shown as bullet list) · Edit · Regenerate · Delete actions |
| Closing question | Displayed at bottom, labeled "Closing". Edit / Regenerate actions. |
| Add question button | "+ Add question" below the list. Opens inline form: question text + intent field. Capped at question_count + 2. |
| Confirm CTA | "Confirm guide and simulate interviews →" · Minimum 4 questions required |
| Back link | "← Back to personas" — returns to Screen 4, does not re-run Agent 1 (uses saved persona set) |

**Interactions:**
- Expand/collapse intent and probes per question
- Edit → inline editing on the question row (not a panel)
- Regenerate question → spinner on that row, replaces content
- Delete → question removed, remaining questions renumbered
- Add → inline blank form appended at bottom of list
- Confirm → saves modified guide to session → Screen 7

**Transition trigger:** "Confirm guide" CTA → Screen 7

**Error states:**
- Fewer than 4 questions → confirm CTA disabled, message: "Add at least 4 questions to continue"
- Question regeneration fails → row shows "Regeneration failed. Try again."

---

### Screen 7 — Loading: Interview Simulation

**Purpose:** Show simulation progress across all personas running in parallel. This is the longest-running step (~2–4 minutes) — the loading state must be informative enough that users don't abandon.

**Layout:** Centered. Progress section shows per-persona status.

**Components:**

| Component | Detail |
|---|---|
| Agent label | "Agent 3 of 4 — Interview Simulation" |
| Per-persona progress list | One row per persona: Persona name + role · Status indicator: Pending / In progress (animated) / Complete / Failed · On complete: "6 of 6 questions answered" |
| Overall progress | "3 of 5 interviews complete" · Elapsed time counter |
| Pipeline mini-map | Step 3 highlighted: Personas → Guide → [Interviews] → Synthesis |
| Context note | "Each persona is being interviewed in parallel. Responses reflect their individual background and experience." |

**Interactions:** None. Non-interactive loading state.

**Transition trigger:** All (or partial, per CC-04) transcripts received → Screen 8

**Error state:** Partial completion (one persona failed) → Screen 8 loads with that persona flagged as "Interview failed — excluded from synthesis". Run does not abort.

---

### Screen 8 — Gate 3: Transcript Review

**Purpose:** Let the user read the simulated interviews and decide whether they're substantive enough to synthesise. Regenerate or exclude low-quality transcripts — no direct editing.

**Layout:** Split layout. Left sidebar: persona list (names + status). Right panel: selected persona's full transcript. Action bar at bottom.

**Components:**

| Component | Detail |
|---|---|
| Page heading | "Review interview transcripts" · Sub-text: "Read each persona's responses. Regenerate thin interviews or exclude a persona from synthesis." |
| Persona sidebar | List of persona names + role. Click to load transcript. Status badge per persona: Complete · Thin (1+ responses flagged) · Excluded · Failed |
| Transcript panel | Selected persona's name + role at top. Q&A format: Question text (bold) → Response (body text). Tone badge per response (positive / neutral / negative / mixed). "Thin" badge on flagged responses. |
| Persona actions | Per persona in sidebar: **Regenerate interview** (re-runs Agent 3 for this persona only) · **Exclude from synthesis** toggle (persona is skipped in Agent 4; shown greyed in sidebar) |
| Exclusion note | If a persona is excluded: "This persona will not be included in the synthesis. Themes and hypotheses will reflect {{N-1}} personas." |
| Confirm CTA | "Confirm and synthesise →" · Requires at least 2 non-excluded transcripts |
| Back link | "← Back to guide" — returns to Screen 6, does not re-run Agent 2 |

**Interactions:**
- Click persona in sidebar → transcript loads in right panel
- Regenerate → sidebar shows spinner for that persona, transcript panel updates on completion
- Exclude toggle → persona greyed in sidebar, synthesis count note updates
- Confirm → saves transcript set (with excluded flags) to session → Screen 9

**Transition trigger:** "Confirm and synthesise" CTA → Screen 9

**Error states:**
- Fewer than 2 non-excluded transcripts → confirm CTA disabled: "At least 2 interviews needed for synthesis"
- Regeneration fails → persona shows "Regeneration failed. Try again." in sidebar

---

### Screen 9 — Loading: Synthesis

**Purpose:** Show progress while Agent 4 runs cross-transcript analysis.

**Layout:** Same minimal centered layout.

**Components:**

| Component | Detail |
|---|---|
| Agent label | "Agent 4 of 4 — Synthesis + Insight" |
| Status messages | Sequenced: "Extracting themes across {{N}} interviews..." → "Identifying cross-persona patterns..." → "Generating hypotheses..." → "Ranking recommendations..." |
| Pipeline mini-map | Step 4 highlighted: Personas → Guide → Interviews → [Synthesis] |
| Estimated time | "Almost there — this usually takes under 60 seconds." |

**Transition trigger:** Agent 4 response received and validated → Screen 10

**Error state:** Synthesis failed → "Synthesis failed. Your transcripts are saved." · "Retry synthesis" button.

---

### Screen 10 — Report View & Export

**Purpose:** Present the full insight report in a readable, scannable format. Allow inline editing of hypotheses and recommendations. Export the final output.

**Layout:** Full-width. Fixed top bar with export action. Scrollable report content below in a centered column (max 800px). Permanent confidence disclaimer at bottom.

**Components:**

| Component | Detail |
|---|---|
| Top bar | "ResearchOS Report" · Run metadata: research goal (truncated) · Date · "Copy report" button (right-aligned) |
| Report header | Research goal restated · Persona count · Transcripts used (e.g., "5 of 5" or "4 of 5 — 1 excluded") |
| Section 1 — Personas summary | Compact list of personas used: name + role. Expandable to full persona card. |
| Section 2 — Themes | 3–5 theme cards. Each shows: Title · Description · Persona frequency ("Mentioned by 4 of 5 personas") · Evidence quotes (2+, attributed to persona name). Quote text is verbatim and visually distinct (blockquote style). Themes ordered by frequency. |
| Section 3 — Hypotheses | 3–5 hypothesis cards. Each shows: "We believe..." statement · Confidence badge (low / medium / high) · Supporting themes (linked pills) · Suggested validation method. **Edit icon** on hypothesis text — opens inline edit. **Delete icon** — removes card (with undo toast). |
| Section 4 — Recommendations | Ranked list 1–N. Each shows: Rank number · Action text · Rationale · Priority tag · Effort tag. **Drag handle** for reordering. **Edit icon** on action text — inline edit. **Delete icon** — removes with undo toast. |
| Confidence disclaimer | Fixed at bottom of report (not dismissible). Plain language: "This report was generated using synthetic AI personas, not real users. Treat these findings as directional hypotheses — not validated conclusions. Consider validating the top hypothesis with 5 real users before committing to a major product decision. Synthetic research cannot capture behavioral patterns, statistical significance, or unknown unknowns." |
| Copy report button | Copies full report as structured markdown. Includes all sections + confidence disclaimer. Toast confirmation: "Report copied to clipboard." |
| Start new run link | "Start a new research run →" at the very bottom |

**Interactions:**
- Edit hypothesis text → inline editing on click, save on Enter or blur
- Edit recommendation text → same inline editing pattern
- Delete hypothesis / recommendation → card fades out with undo toast (5 seconds)
- Drag recommendation → reorders list, rank numbers update
- Copy report → full markdown to clipboard + toast
- Start new run → clears session, returns to Screen 2 (or Screen 1 with confirmation)

**Transition trigger:** "Start new run" → Screen 1 or Screen 2

**Error states:**
- Clipboard API unavailable → "Copy report" opens a modal with the full markdown text in a textarea ("Select all and copy")
- Synthesis produced fewer than 3 themes → report shown as-is with a note: "Limited themes were extracted. Consider adding more personas or regenerating specific interviews."

---

### 16.1 Resolved Open Questions (Phase 2)

| OQ | Question | Decision |
|---|---|---|
| OQ-01 | Pause for review or auto-run? | Pause at every stage — 4 review gates |
| OQ-05 | Report format — web or PDF? | Web-rendered for MVP; copy-as-markdown is the export |
| OQ-06 | Error state UX when pipeline fails mid-way? | Per-screen error state with "Retry" and "Edit intake" options; partial completion handled by CC-04 |
| OQ-07 | Persona/question count configurable after generation? | Locked at intake; user can add/delete within the gate screens |
| OQ-09 | Confidence disclaimer — dismissible? | Permanently visible at the bottom of Screen 10 |

---

*Document last updated: 2026-06-16*
*Next milestone: Phase 2 continued — Data Model*
