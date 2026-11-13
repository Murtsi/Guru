# G2 request and matching proposal

**Status: draft for team review. This is not an agreed interface or an implementation.**

This proposal covers the buyer request and the result of matching it to a fixed offer. It uses only synthetic data and does not assume sponsor field names, units, tax treatment, or stock semantics. Those details must be confirmed before an offer can be treated as orderable.

## Purchase request

The matching input needs:

- a request reference;
- requested quantity and unit, kept together;
- hard product requirements, including dietary constraints;
- delivery deadline and time zone;
- optional budget with currency and an explicit tax basis;
- an explicit substitution policy (none unless the buyer allows it).

Missing or ambiguous required information should produce a validation error with a field and reason. Matching must not infer a unit, deadline, or relaxed dietary constraint.

## Offer evidence

Each synthetic offer should carry enough evidence to compare it without losing the source meaning:

- product and supplier references;
- product attributes relevant to the hard requirements;
- pack size and unit conversion evidence;
- fixed price, currency, tax basis, and validity;
- available quantity and the unit/stock timestamp;
- delivery date evidence;
- a fixture/source reference so the demo can distinguish fixture data from sponsor responses.

Unknown or incomparable values remain unknown; they are not filled with defaults.

## Matching result

Return feasible offers ranked by a documented deterministic rule, plus excluded offers with machine-readable reasons. Hard requirements and the delivery deadline are feasibility gates, not ranking preferences. Quantity must be converted using explicit pack evidence; do not round down the requested quantity. If an offer cannot satisfy the full amount, report the shortage instead of presenting it as a full match.

## Questions for agreement

1. Which request fields are mandatory, and how should deadline/time zone be represented?
2. What exact unit and pack conversion rules are in scope for the milk scenario?
3. Which ranking rule should break ties between equally feasible fixed offers?
4. What evidence is sufficient to claim stock and delivery feasibility in the synthetic demo?
5. Which fixture fields and examples are safe to publish under the sponsor's data terms?

After these points are agreed, lane B can implement B-1 fixtures and matching without treating this draft as a sponsor API contract.
