# Local synthetic POC

This is a self-contained, in-memory demonstration of request matching and order authority. It does not call Valio systems and its suppliers, prices, stock, delivery evidence, approvals, and order references are fabricated.

## Run

From the repository root, run:

```sh
python3 poc/server.py
```

Open <http://127.0.0.1:8000>. Stop the server with Ctrl+C. State is lost when the process stops.

## Walkthrough

1. Compare feasible and excluded synthetic offers for 1,000 L of lactose-free milk due 2026-11-16 (Europe/Helsinki).
2. Create a preview with the €1,300 illustrative limit and commit it.
3. Create a second preview with the €1,100 limit. Confirm commit is blocked, approve the exact preview, then commit it.
4. Try the partial-stock, late-delivery, and standard-milk offers with the **Ask policy** button. The server refuses all three and names the unmet constraint. The cheaper standard milk cannot bypass the lactose-free requirement.
5. Commit the same preview again; the existing synthetic order is returned.

## Limits before sponsor-mock integration

The demo uses hard-coded synthetic fixtures and in-memory state. The approval button records a local operator decision without authentication; it demonstrates the flow, not an identity control. The sample date and economics are illustrative. Tax, stock freshness, delivery semantics, sponsor authentication, sponsor order behavior, persistent audit, and the agreed G1–G7 contracts remain unverified. Do not present local fixture values or order references as sponsor responses.
