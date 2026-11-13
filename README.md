# Guru

An agent can find the order. Guru decides whether it is allowed to place it.

Junction 2026: **Trusted Trade Agents by Valio Aimo**.

**Status: documentation and architecture only. There is no implemented agent, API, UI or sponsor integration yet.** This repository describes a proposed interface for an external purchasing agent to search a wholesaler's synthetic catalog, check fixed prices and availability, and submit an order within a buyer's authority or request human approval.

Our reference request is the sponsor's example: 1,000 litres of lactose-free milk by Monday. The proposed demonstration will preserve the required quantity, dietary constraints and delivery deadline while comparing valid offers. It will show both an order within delegated authority and an approval-required case.

The scope is today's mocked webshop and backend. We are not building a marketplace, negotiating quotes, or connecting to production purchasing systems.

## Start here

| Document | Purpose |
|---|---|
| [CHALLENGE.md](CHALLENGE.md) | Sanitised brief, requirements and judging weights |
| [IDEA.md](IDEA.md) | User, use case and scope |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Proposed agent interface and trust boundaries |
| [TEAM.md](TEAM.md) | A/B/C ownership and proposed integration contracts |
| [TODO.md](TODO.md) | Ordered tasks with acceptance criteria |
| [docs/DEMO.md](docs/DEMO.md) | Planned judge walkthrough and exception cases |
| [docs/JUDGING.md](docs/JUDGING.md) | Evidence required for each criterion |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Decisions and unverified assumptions |
| [docs/PITCH.md](docs/PITCH.md) | Presentation outline |
| [docs/SUBMISSION.md](docs/SUBMISSION.md) | Release and submission checklist |
| [AGENTS.md](AGENTS.md) | Contributor and agent rules |

## Sponsor resources

The [resource portal](https://junction26.valioaimo.fi/) provides synthetic datasets, API documentation and mock-backend instructions. Obtain credentials from the challenge materials through the team. No portal password or API key is included here. The authenticated portal and its API contract have not been verified for this setup.

Only use sponsor mock systems and data that the challenge permits. Synthetic data can still have access or redistribution conditions; confirm these before publishing downloaded files. Never invent a sponsor endpoint or present a local fixture as a sponsor API response.

## Development status

No language, framework or SDK has been committed as a final choice. OpenAPI/JSON Schema are proposed for our own interface. Authentication, units, tax treatment, stock semantics and order behaviour must be checked against the sponsor documentation before implementation.

There are no install, run or test commands yet. Follow [TODO.md](TODO.md) to start implementation. No license has been selected; public visibility is not a license declaration.
