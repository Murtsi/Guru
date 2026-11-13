# Decisions and assumptions

| ID | Date | Decision | Why / status |
|---|---|---|---|
| 001 | 2026-11-13 | Documentation-only setup | Requested scope; no runnable scaffold or completed integration claimed |
| 002 | 2026-11-13 | External purchasing-agent interface to synthetic current webshop/backend | Matches the core challenge; excludes a future marketplace |
| 003 | 2026-11-13 | Reference workflow: lactose-free milk request, fixed offers, delegated order or human approval | Covers all three core capabilities |
| 004 | 2026-11-13 | Proposed open contracts with deterministic server-side policy | Keeps agent choice separate from authority; exact schemas await sponsor docs |
| 005 | 2026-11-13 | No credentials or unapproved sponsor datasets in public Git | Public hackathon repository; use private local configuration |
| 006 | 2026-11-13 | Build an isolated local POC with a Python standard-library mock API, React/TypeScript frontend, and fabricated fixtures | Provides a runnable walkthrough without waiting for sponsor access; Vite and Tailwind support the interactive offer conveyor. Prototype choice only, not the production stack or sponsor contract |

Open: sponsor authentication/API contract, units/tax, stock/price validity, idempotency and reconciliation, runtime/storage, human authentication, data redistribution, deployment and deadline. Record evidence and trade-offs when resolving these. Do not describe a design proposal as sponsor-approved behaviour.
