# Team and ownership

Proposed A/B/C allocation follows the existing team arrangement. Confirm responsibilities together before implementation.

| Lane | Person | Ownership | Acceptance question |
|---|---|---|---|
| A | Murtsi (`@Murtsi`) | Structured API, mock adapter, order state, persistence, approval screen integration and CI | Can a request reach a confirmed synthetic order? |
| B | Niko (`@leppiskerttu`) | Request constraints, product matching, offer comparison, scenario fixtures and evaluation | Did we buy what the buyer asked for? |
| C | Joonas (`@Joonaswaa`) | Delegation policy, approval rules, exception decisions and audit explanations | Was each action authorised and explainable? |

Suggested future paths: A `src/guru/api/`, `adapters/`, `orders/`, `storage/`, `frontend/`, `deploy/`; B `matching/`, `comparison/`, `evaluation/`, synthetic fixtures; C `policy/`, `approvals/`, `audit/`. Paths are proposals, not existing modules. A integrates C's approval decisions into the application; C owns the rules and approval semantics.

## Integration contracts to agree before coding

| ID | Producer → consumer | Contract | Ready when |
|---|---|---|---|
| G1 | A → B/C | Sponsor adapter capabilities and sanitised offer snapshot | Units, stock and price semantics verified |
| G2 | B → A/C | Purchase request and ranked feasible offers | Hard requirements preserved; failures explicit |
| G3 | C → A/B | Delegation and policy decision | Allowed/approval/blocked reasons specified |
| G4 | A/C → A | Approval record bound to preview/version | Human identity and expiry enforced |
| G5 | A → B/C | Order outcome and reconciliation state | Confirmed distinguished from unknown |
| G6 | All → C | Audit events | No credentials or identifying customer data |
| G7 | B → All | Scenario results | Real measured outcomes; mock type labelled |

Use `a/...`, `b/...`, `c/...` branches and PRs. Review shared contracts together; do not silently change another lane's interface. Keep a short integration check at request/offer, policy/approval and complete-order milestones. Everyone contributes to the final deck.
