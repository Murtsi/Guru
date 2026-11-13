# Changelog

## [Unreleased]

### Added
- Replaced the prototype's monolithic HTML frontend with a Vite, React, TypeScript, and Tailwind app; added the shadcn-compatible `src/components/ui` structure.
- Added a typed React milk-carton conveyor with animated perspective, drag/keyboard controls, pause, stepping, reduced-motion support, and offer selection wired into policy review.
- Added a draggable, animated offer conveyor with custom inline milk-carton artwork, pause/step controls, selectable offers, and a compact list-view fallback.
- Reworked the local POC into an interactive purchasing dashboard with selectable offer cards, a live authority slider, approval/rejection controls, a decision timeline, and a reset action.
- Added an explicitly non-compliant, cheaper standard-milk fixture and a policy inspection action so the POC demonstrates that a hard lactose-free requirement blocks it.
- Added an isolated local Python proof of concept with synthetic offer matching, spend policy, approval flow, order deduplication per preview, and audit events. It makes no sponsor calls and has no authenticated approval.
- Drafted a lane B request/matching contract proposal for team review; no interface or sponsor semantics are agreed by this draft.
- [X] Documentation-only foundation for Guru: sanitised Valio Aimo challenge, reference purchasing workflow, proposed open interface and deterministic authority checks.
- [X] A/B/C ownership, integration contracts, ordered task board, judging evidence, demo, pitch and submission plans.
- [X] Public-data guidance and ignore rules; sponsor passwords and API keys are deliberately excluded.
