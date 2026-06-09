# Conveyancing Case Portal

A customer-facing web app that turns a conveyancing firm's raw, jargon-heavy case
data into **clear, plain-English visibility** for the person who actually cares
about it: the buyer.

It answers the four questions a customer keeps phoning their conveyancer to ask:

1. **Where does my case stand?** — an overall progress bar and a journey of the
   stages from instruction to keys-in-hand.
2. **What's actually happening right now?** — a plain-English summary of the
   current state and what it means for the timeline.
3. **What's holding things up?** — outstanding items explained in human terms,
   including what happens if they can't be resolved.
4. **What's happened so far?** — a friendly, filterable history of the case.

The sample case (`data/`) is a residential purchase mid-flight: searches and
title are done, 13 of 15 pre-contract enquiries are resolved, and the case is
waiting on two replies from the seller's solicitor before it can move to exchange.

---

## What I built and why

### A domain layer that translates "operational" into "customer-facing"

The hard part of this problem isn't the UI — it's the **translation**. The feed
is an operational record: 17 tasks with a dependency graph, 41 audit events with
internal jargon, status enums like `in_review` and `blocked`. A customer should
never see any of that raw.

So the heart of the codebase is a pure, dependency-free **domain layer**
(`src/domain/`) that maps the operational model into a customer **view model**,
and the UI is a thin render over that view model:

```
Raw JSON ──load+validate──▶ Domain entities ──derive──▶ Customer view model ──▶ UI
 (data/)      (zod)          (Case/Task/Event)  (pure fns)    (CaseView)        (RSC)
```

Everything that matters happens in small, pure functions, which is why that's
where the tests live (`src/domain/__tests__`, 27 tests).

Key modelling decisions:

- **A customer journey, not a task list.** `phases.ts` defines an ordered,
  human-meaningful journey (*Getting started → Searches & legal checks →
  Enquiries → Preparing to exchange → Exchange → Completion → After completion*)
  and assigns each task to a phase. Assignment is category-driven by default
  (new tasks slot in automatically) with a few task-level overrides — because the
  operational `finance` category is spread across the *whole* transaction (the
  mortgage offer is secured early; the funds are drawn down at the very end), so
  it doesn't map onto a single customer stage.
- **The timeline is humanised and filtered** (`timeline.ts`). Internal-only
  events (`internal.note`, raw `task.status_changed` churn) are dropped; every
  remaining event type is rewritten into a friendly title + plain body, and
  actors are relabelled ("system" → "Automated update", the buyer → "You").
- **Blockers carry meaning, not just status** (`progress.ts`). The two
  outstanding enquiries are explained in plain English *and* paired with what
  happens if they aren't resolved (e.g. indemnity insurance as the fallback for
  the missing loft-conversion building-regs certificate — which is exactly what
  the conveyancer told the client in the event log).
- **Plain-English summaries** (`narrative.ts`) are generated deterministically
  from the view model — see "AI" below.

### "AI" summaries — deterministic, with a clear seam for a real model

The brief hints at an AI chat feature. I chose to ship the **plain-English
narrative** that such a feature would produce, but generate it deterministically
from the structured data (`narrative.ts`) rather than calling an LLM. This means:

- **The app runs with no API key and no network access** — important for "works
  on the first try".
- The output is grounded and predictable (no hallucinated legal advice).

`narrative.ts` is deliberately the single seam where a live model (e.g. Claude)
could later generate the same paragraphs from the same structured inputs —
nothing else in the app would change. See "If I had more time".

### Technical choices

- **Next.js (App Router) + React Server Components.** The JSON is read and
  validated on the server; the client never fetches or bundles it. One
  deployable, one Dockerfile. Matches "no backend required" while leaving a clean
  server seam for a future LLM call.
- **TypeScript everywhere + zod** at the data boundary. The feed is treated as
  untrusted input: a malformed file fails loudly with a clear error instead of
  surfacing as `undefined` deep in the UI.
- **shadcn/ui on Tailwind** for accessible primitives and a clean, consistent UI
  without bespoke CSS.
- **Vitest** for the domain unit tests.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm test         # run the domain unit tests (27 tests)
npm run build    # production build
npm start        # serve the production build
npm run lint
```

---

## Demo: stepping through the journey

The provided feed is a single snapshot — the case stops mid-enquiries on
13 December 2024. To show how the portal looks at *every* stage, there's a
**demo stepper** along the top: click any stage (or Back/Next) to time-travel the
case from "Case opened" all the way to "Registered with Land Registry", and watch
the progress bar, current stage, blockers, next steps and timeline all update.

How it works — and why it's barely any extra code: the feed is **event-sourced**,
so "what did the case look like on date X" is just a fold over the events up to X.
`src/domain/asOf.ts` reconstructs each task's status (and the enquiry tracker) by
replaying the event log up to a chosen timestamp, and the page renders the view as
of the selected checkpoint (`?stage=N`). The default landing point is the real
present; stages beyond it replay a **mocked continuation** of the case
(`src/domain/demo/futureEvents.ts`), kept deliberately separate from the provided
`data/` so the real feed stays untouched.

---

## Data

The app reads the three provided files from `data/` (`case.json`, `tasks.json`,
`events.json`) at build/render time and validates them with zod. The files are
included in the repo so it runs out of the box. I kept them **verbatim** — the
brief allows reshaping them, but I chose to add all structure in the derivation
layer instead, so the provided feed stays the contract.

---

## Assumptions & trade-offs

- **"Now" is anchored to the data, not the wall clock.** The data is from late
  2024; using the real current date would make a mid-flight case look wildly
  overdue. `buildCaseView(now)` defaults to the real "present" in the feed (the
  "Today" checkpoint), and the demo stepper passes other timestamps to time-travel.
  The value is injectable so a live feed could pass the real time, which also keeps
  the date logic testable.
- **Single, hard-coded case.** The feed describes one case, so the app shows one.
  Multi-case support would be a routing + list layer on top of the same domain
  functions (see below).
- **Customer-only view.** I built solely for the buyer, as the brief's goal is
  customer transparency. There's no conveyancer/admin mode.
- **The page is statically generated** because the data is static. If the feed
  became live, switching to dynamic rendering is a one-line change; the data
  loader already isolates the I/O.
- **Outstanding-enquiry explanations are matched on topic text** (knotweed,
  building regs) with a sensible generic fallback. A production system would key
  these off structured enquiry records rather than free-text topics.

---

## Project structure

```
src/
  domain/                 # pure, testable translation layer (no React, no I/O except loadCase)
    schema.ts             # zod schemas + inferred raw types (the data boundary)
    loadCase.ts           # reads & validates data/*.json
    types.ts              # the customer-facing view model
    phases.ts             # the customer journey + task→phase mapping
    progress.ts           # phases, % complete, next steps, blockers, enquiry rollup
    timeline.ts           # humanises & filters the event log
    narrative.ts          # deterministic plain-English summaries (the LLM seam)
    asOf.ts               # time-travel: reconstruct case state from event replay
    demo/                 # demo checkpoints + mocked future events (demo only)
    index.ts              # buildCaseView(now): assembles the whole view model
    __tests__/            # 27 vitest tests over the real data
  app/(portal)/           # the portal page + its page-specific components
    page.tsx              # server component: reads ?stage, buildCaseView() → sections
    DemoControls.tsx      # demo stepper (time-travel through the journey)
    CaseHeader / StatusSummary / NextSteps / KeyFacts
    ProgressJourney/      # component + its PhaseStep subcomponent
    Blockers/             # component + its OutstandingEnquiry subcomponent
    Timeline/             # client component (filtering) + TimelineEntry subcomponent
  components/             # generic, reusable components (SectionCard, ui/* from shadcn)
  lib/format.ts           # shared date/money/prose formatting helpers
```

---

## If I had more time

- **A live AI chat ("Ask about my case").** Drop a Claude call behind
  `narrative.ts` and add a chat route that's grounded in the same view model.
  *Benefit:* customers ask free-form questions ("will this delay completion?")
  instead of reading. *Approach:* a server action that passes the structured
  `CaseView` as context to the model, with the deterministic summaries as a
  no-key fallback.
- **Multiple cases + auth.** A case list and per-case routes over the same domain
  functions, gated by a customer login. *Benefit:* a real multi-tenant portal.
- **Proactive notifications.** Email/SMS when a milestone is reached or a blocker
  clears — derivable from the event stream we already model. *Benefit:* attacks
  the root cause (customers chasing for updates).
- **Live feed instead of files.** Swap `loadCase.ts` for an API/event-bus client
  and switch the page to dynamic rendering. The view model and UI are untouched.
- **Accessibility & i18n pass** and a small visual-regression test suite for the
  timeline/journey components.
