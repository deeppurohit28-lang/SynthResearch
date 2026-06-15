# Product Requirements Document
## ResearchOS — Agentic Synthetic User Research Platform

---

**Version:** 0.1 (Phase 1 — Scope & Research)
**Date:** 2026-06-15
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
8. [Success Matrix](#8-success-matrix)
9. [Product Scope](#9-product-scope)
10. [MVP Pipeline Architecture](#10-mvp-pipeline-architecture)
11. [Product Requirements](#11-product-requirements)
12. [User Stories](#12-user-stories)
13. [Assumptions & Constraints](#13-assumptions--constraints)
14. [Out of Scope (MVP)](#14-out-of-scope-mvp)
15. [Open Questions](#15-open-questions)

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
│  Input:  Intake form JSON                   │
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
│  Input:  Persona array + Interview guide    │
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

### 10.2 Technical Considerations

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

**Description:** The entry point to the pipeline. A structured form that captures the minimum context needed to condition all downstream agents.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| Product / problem description | Long text | Yes | Min 50 chars. Prompt: "Describe your product and the problem it solves." |
| Target user description | Medium text | Yes | Prompt: "Who is your target user? Be as specific as you can." |
| Research goal | Medium text | Yes | Prompt: "What is the one question this research should answer?" |
| Product stage | Dropdown | Yes | Options: Idea / Pre-MVP / MVP / Post-launch |
| Number of personas | Number input | Yes | Range: 2–8. Default: 5 |
| Number of interview questions | Number input | Yes | Range: 4–8. Default: 6 |

**Acceptance criteria:**
- Form validates all required fields before submission
- Character minimums enforced with inline error messages
- Persona and question count sliders update in real time
- On submit, intake data is compiled into a structured JSON context object passed to Agent 1

---

#### FR-02: Persona Generation Agent

**Description:** Generates N distinct, MECE synthetic personas based on the intake context.

**Input:** Intake form JSON
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
- No persona is a demographic clone of another
- Output is valid JSON matching the schema

---

#### FR-03: Interview Guide Agent

**Description:** Generates a research interview guide grounded in the research goal and sensitive to the persona landscape.

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
- Each question includes its research intent and at least 2 follow-up probes
- Questions are sequenced logically (general → specific)
- No question is a restatement of another
- Questions are grounded in the research goal, not generic
- Output is valid JSON matching the schema

---

#### FR-04: Interview Simulation Agent

**Description:** Simulates each persona responding to the interview guide in character. Executes in parallel per persona.

**Input:** Persona array + Interview guide
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
- Responses are in-character — they reflect the persona's background, goals, and frustrations
- No two personas give identical or near-identical responses to the same question
- Responses are a minimum of 80 words each
- Responses flagged as "thin" (<80 words or generic) are marked with quality_flag: "thin"
- Execution is parallelised per persona (not sequential)
- Full transcript set is passed to Agent 4 only when all N transcripts are complete
- Output is valid JSON matching the schema

---

#### FR-05: Synthesis + Insight Agent

**Description:** Analyses all transcripts cross-persona, extracts themes, and generates product hypotheses and ranked recommendations as first-class outputs.

**Input:** All N transcripts (JSON) + Research goal
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
      "statement": "We believe [X] will result in [Y] because [Z]",
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
- All quotes are traceable to the actual transcript (no hallucinated quotes)
- Generates 3–5 hypotheses in testable format: "We believe [X] will result in [Y] because [Z]"
- Each hypothesis maps to at least one supporting theme
- Each hypothesis includes a suggested validation method
- Generates 3–5 ranked recommendations with action, rationale, priority, and effort
- All recommendations name a specific action (not vague suggestions)
- Includes a confidence disclaimer noting the synthetic nature of the research
- Output is valid JSON matching the schema

---

#### FR-06: Formatted Report Output

**Description:** Renders the structured JSON insight report into a human-readable format.

**Acceptance criteria:**
- Report is rendered in readable sections: Overview → Personas → Themes → Hypotheses → Recommendations
- Each theme shows title, description, and representative quotes
- Each hypothesis is shown in the "We believe..." format with confidence indicator
- Recommendations are shown in ranked order with priority and effort tags
- Full report is selectable and copy-pasteable
- Confidence disclaimer is visible at the bottom of the report
- Report renders correctly on desktop screen widths

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

## 12. User Stories

### Epic 1: Research Setup

**US-01 — Define research context**
> As an early-stage founder, I want to describe my product problem and research goal in plain language so that the system can set up a research study without me needing to know research methodology.

Acceptance criteria:
- I can fill in the intake form in under 3 minutes
- The form guides me with example prompts for each field
- I can choose how many personas and questions I want
- I can submit and immediately see the pipeline begin

---

**US-02 — Review generated personas**
> As a PM, I want to see the AI-generated personas before the interview simulation runs so that I can verify they represent my actual target user segments.

Acceptance criteria:
- Personas are displayed as readable cards after Agent 1 completes
- Each persona card shows name, role, background, goals, and frustrations
- I can see at a glance that the personas are distinct from each other
- The pipeline pauses for my review (or continues automatically — TBD in Phase 2)

---

**US-03 — Review interview guide**
> As a PM, I want to see the generated interview questions before simulation so that I can verify they address my research goal.

Acceptance criteria:
- Interview guide is displayed after Agent 2 completes
- Questions are shown with their stated intent and follow-up probes
- I can see how the questions connect to my stated research goal

---

### Epic 2: Research Execution

**US-04 — Run simulated interviews**
> As a founder, I want the system to simulate interviews with each persona automatically so that I get research data without recruiting or scheduling participants.

Acceptance criteria:
- Simulation runs for all personas without my intervention
- I can see a progress indicator while simulation is running
- Each persona's responses reflect their stated profile (not generic)
- The simulation completes within the latency target

---

**US-05 — View interview transcripts**
> As a researcher, I want to read the simulated transcripts so that I can verify the depth and relevance of the responses before reading the synthesis.

Acceptance criteria:
- Each transcript is accessible by persona
- Responses are clearly attributed to the correct persona
- Thin responses are flagged visually
- Transcripts are readable without JSON formatting

---

### Epic 3: Insight Generation

**US-06 — Read synthesised themes**
> As a PM, I want to see the major themes extracted from the interviews so that I can understand what matters most to my target users.

Acceptance criteria:
- 3–5 themes are presented with clear titles and descriptions
- Each theme shows how many personas mentioned it
- Representative quotes from transcripts support each theme
- All quotes are accurate (traceable to the transcript)

---

**US-07 — Receive product hypotheses**
> As a founder, I want structured product hypotheses as output so that I know what assumptions are worth testing next.

Acceptance criteria:
- 3–5 hypotheses are presented in the "We believe [X] will result in [Y] because [Z]" format
- Each hypothesis shows its confidence level and supporting themes
- Each hypothesis includes a suggested validation method
- Hypotheses are specific to my product problem, not generic

---

**US-08 — Receive ranked recommendations**
> As a PM, I want ranked, specific recommendations so that I know what actions to take as a result of this research.

Acceptance criteria:
- 3–5 recommendations are shown in priority order
- Each recommendation names a specific action (not vague)
- Each recommendation has a rationale, priority level, and effort estimate
- I can immediately act on the top recommendation without further interpretation

---

**US-09 — Export the research report**
> As a founder, I want to copy the full report so that I can share it with my co-founder or team without requiring them to use the tool.

Acceptance criteria:
- Full report is selectable and pasteable as plain text or markdown
- The exported format preserves structure (sections, themes, hypotheses, recommendations)
- The confidence disclaimer is included in any export

---

### Epic 4: Trust & Transparency

**US-10 — Understand research limitations**
> As a PM, I want to know this is synthetic research and what that means so that I don't over-index on the findings for high-stakes decisions.

Acceptance criteria:
- A confidence disclaimer is shown on every report
- The disclaimer clearly states the synthetic nature of the research
- The disclaimer suggests when real user research should follow

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
| OQ-02 | What is the tech stack? (Frontend framework, backend language, hosting) | Engineering | Phase 3 kickoff |
| OQ-03 | Do we use Claude only, or a multi-model approach per agent? | Engineering | Phase 3 kickoff |
| OQ-04 | How do we handle thin or low-quality responses from the simulation agent? (retry, flag, discard?) | Product | Phase 3 |
| OQ-05 | Is the output format a web-rendered report, a downloadable PDF, or both? | Design | Phase 2 |
| OQ-06 | What is the error state UX when a pipeline run fails mid-way? | Design | Phase 2 |
| OQ-07 | Should the number of personas and questions be configurable after generation, or locked at intake? | Product | Phase 2 |
| OQ-08 | What is the ground truth corpus for Phase 4 evaluation? (Which 3 products with published research?) | Research | Phase 4 planning |
| OQ-09 | Should the confidence disclaimer be dismissible, or permanently visible on every report? | Design | Phase 2 |
| OQ-10 | Do hypotheses include a priority ranking, or are they presented as a flat list? | Product | Phase 3 |

---

*Document last updated: 2026-06-15*
*Next milestone: Phase 2 — Design (UI flow + data model)*
