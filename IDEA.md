# Idea

## Buyer and problem

A professional kitchen delegates a repeat purchase to an agent. The kitchen needs the right product and quantity by a deadline, while keeping control over spending and substitutions. A wholesaler needs to expose enough structured information for that agent to act without giving it unrestricted access to internal systems.

## Proposed experience

The buyer supplies a structured request or confirms a request parsed from text. Guru searches valid products, obtains current fixed prices and availability, and presents a comparable order preview. A deterministic policy check decides whether the agent may commit it or must ask a named human approver.

If the agent cannot satisfy a hard requirement, it explains the gap. It does not silently relax lactose-free or allergen requirements. Any proposed substitution must be explicit and evaluated against the buyer's policy.

The external agent is a separate client of the interface. A conversational screen may help the demo, but a chatbot replacing the webshop is not the deliverable.

## Minimum demonstration

- Structured catalog search and fixed-price/availability responses.
- A complete synthetic order within authority.
- The same workflow with a spend limit that requires approval.
- Partial stock or a missed delivery constraint, with a clear next action.
- An audit view that connects the buyer request, evidence, policy decision, approval and order outcome.

## Boundaries

No production data, real purchases, payment handling, marketplace, quote negotiation, multi-supplier platform or invented sustainability claims. Recipe planning and proactive selling are optional future directions, not first-demo requirements.

## Success evidence

Measure requirement satisfaction, successful mock order outcomes, approval enforcement, duplicate-order prevention and exception outcomes on a fixed scenario set. Compare human steps or time only if we actually measure a baseline. No accuracy, speed or savings claims exist yet.
