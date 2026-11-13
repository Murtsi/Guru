# Guru local proof of concept

The POC combines a Python standard-library mock API with a React/TypeScript frontend. Offers and orders are fabricated local fixtures; the API does not connect to Valio systems.

## Run the frontend in development

Use two terminals from the repository root.

Terminal 1, start the API:

```sh
python3 poc/server.py
```

Terminal 2, start Vite:

```sh
cd poc/frontend
npm install
npm run dev
```

Open <http://127.0.0.1:5173>. Vite proxies `/api` requests to the local mock API on port 8000.

## Serve the built app through Python

```sh
cd poc/frontend
npm install
npm run build
cd ../..
python3 poc/server.py
```

Open <http://127.0.0.1:8000>. The Python server serves the generated `frontend/dist` files and the same local API.

## Demo flow

1. Drag the milk-carton conveyor, pause it, step between offers, or switch to the list view.
2. Select a feasible offer and move the spend-limit slider to see authority update.
3. Create an allowed preview and commit a synthetic order.
4. Set a lower limit, create an approval-required preview, then approve or reject that exact preview.
5. Inspect partial-stock, late-delivery, and standard-milk cartons to see why policy blocks them.
6. Use **Reset** to clear previews, orders, and audit events. State is also lost when the Python process stops.

## POC limits

Supplier names, offer prices, stock, delivery evidence, approvals, and order references are invented demo data. Approval is not authenticated. The mock API stores state in memory. The POC does not verify tax treatment, sponsor stock semantics, delivery behavior, or any production integration.
