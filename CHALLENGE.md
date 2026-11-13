# Trusted Trade Agents

Sponsor: **Valio Aimo**. Source: the challenge text supplied by the repository owner on 2026-11-13. This is a sanitised working summary; it deliberately omits all credentials.

## Required outcome

Define and demonstrate an open interface and operating model through which an external purchasing agent can interact with a simulated wholesaler. Use the current mocked webshop/backend, not a future marketplace or real systems.

1. Structured product, fixed-price and availability lookup.
2. A defined progression from inquiry to order commitment.
3. Explicit delegated permissions and human approval when required.

The reference request is 1,000 litres of lactose-free milk by Monday. The agent must satisfy the buyer's actual constraints and act within its authority.

## Optional directions

Delivery reliability, existing sustainability certificates/labels, substitutions, other exceptions, traceability and human-readable explanations. Category-level carbon ranges are a stretch goal. Payment protocols and verifiable credentials are context, not mandatory integrations.

Exceptions are described as optional extensions in the brief, but robustness is also a scored criterion. Our proposed demo therefore includes partial availability and an approval-required change without trying to build every exception workflow.

## Judging

| Criterion | Weight |
|---|---|
| Working request → lookup → order/approval demo | 30% |
| Matching the buyer's problem and need | 20% |
| Autonomy, permissions and auditable controls | 20% |
| Exceptions, substitutions and delivery constraints | 15% |
| Open standards, assumptions and credible production path | 15% |

## Resources and questions

- [Sponsor resource portal](https://junction26.valioaimo.fi/): synthetic catalog, suppliers, API documentation and mock-backend instructions. Keep access credentials private.
- Commercial: Hanna Forsström, Pirjo Kaartinen. Online sales: Minni Ruhtinas. IT/data governance: Tommi Nurmi-Aro, Ville Takanen, Riku Tapper.
- Verify authentication and account scoping, product units and pack sizes, currency/VAT, price validity, stock freshness, delivery cut-offs, order identifiers, idempotency support, and redistribution terms.
- Do not imply that integration or sponsor verification has happened merely because a public specification is written.
