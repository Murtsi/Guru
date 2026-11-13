# Task board

All implementation tasks are **not started**. Documentation setup is complete; it does not count as a working demo. Owners follow [TEAM.md](TEAM.md). P0 means the core demonstration needs it. Record blocked items with owner and reason.

| ID | Owner | Priority | Task and acceptance criteria | Dependency |
|---|---|---|---|---|
| PRE-1 | A | P0 | Read authenticated sponsor docs; record real auth, units, tax, stock and order semantics without secrets | Team-held credentials |
| PRE-2 | All | P0 | Agree G1–G7, exact milk scenario and technology choices; record decisions | PRE-1 |
| PRE-3 | C | P0 | Confirm synthetic data redistribution and approval identity assumptions with mentors | Sponsor guidance |
| A-1 | A | P0 | Read-only mock adapter; retrieve structured product/price/availability evidence | PRE-1/2 |
| B-1 | B | P0 | Request validation and matching fixtures, including unit/pack conversion and dietary hard constraints | G1/G2 |
| B-2 | B | P0 | Fixed-price comparison; report unavailable or incomparable choices explicitly | B-1/A-1 |
| C-1 | C | P0 | Delegation policy: spend boundaries, hard blocks and named approval requirements | G3 |
| A-2 | A | P0 | Order preview/state and authenticated approval integration | B-2/C-1/G4 |
| C-2 | C | P0 | Approval binding, expiry and rejection; agent cannot self-approve | A-2 |
| A-3 | A | P0 | Commit synthetic order, deduplicate retries and reconcile uncertain outcomes | G5/C-2 |
| C-3 | C | P0 | Partial stock, delivery miss and explicit substitution policy outcomes | A-1/B-2 |
| C-4 | C | P0 | Redacted audit view with request→decision→approval→order references | G6/A-3 |
| B-3 | B | P0 | Scenario tests and measured results for all core and exception flows | G7/A-3/C-3 |
| A-4 | A | P0 | Reproducible startup, tests, CI and seed/reset instructions | Selected stack |
| X-1 | All | P0 | Rehearse full mock-backed demo and approval flow; record backup video | All P0 |
| X-2 | All | P0 | Deck, limitations, links and submission evidence; verify actual deadline | X-1 |
| ST-1 | B/C | P2 | Delivery/certificate comparison only where source evidence exists | Core done |
| ST-2 | All | P2 | Recipe workflow, carbon ranges, payment standards or credentials only if justified | Core done |

## Cut line

Finish the structured lookup, authorised order, human approval and audit path first. Demonstrate one partial-stock/deadline exception before expanding features. Avoid building a marketplace or a chat-only demo.

## Blocked

Sponsor API details and redistribution terms have not been checked. No implementation stack or deployment has been selected. The official submission deadline remains unverified.
