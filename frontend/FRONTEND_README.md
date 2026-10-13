# SmartLedger Frontend — React + JavaScript + Tailwind CSS

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. The existing workspace continues using mock data by default; the Dashboard's **Single Test Case** panel calls the real FastAPI `/api/predict` endpoint.

## Backend connection

Set `VITE_API_BASE_URL=/api` in `.env`. Start the SmartLedger FastAPI backend separately on port 8000. Vite proxies `/api` requests to `http://127.0.0.1:8000` during development, avoiding the need to configure browser CORS for local demo use.

The demo panel sends a request shaped as `{ "transaction": { ... } }` to `POST /api/predict`, and displays the category, model category, decision source, reasoning, evidence, and review status when present in the response.

## Build

```bash
npm run build
npm run preview
```

All application source files use JavaScript (`.js`) and JSX (`.jsx`); styling remains Tailwind CSS. TypeScript and TypeScript configuration have been removed.


## Live Single Test Case (FastAPI + Qwen)

The Dashboard includes a **Single Test Case** panel that sends the editable JSON transaction to `POST /api/predict` as `{ "transaction": { ... } }`.

For local development:
1. Start the FastAPI backend on `127.0.0.1:8000`.
2. Start this Vite frontend with `npm run dev`.
3. Open the Dashboard and click **Run Test Case**. The Vite proxy forwards `/api` requests to the backend.
4. The sample `JWOO Ref` record is intended to exercise Job Work Out evidence validation.

Set `VITE_USE_MOCKS=true` to keep the rest of the dashboard on mock data; the Single Test Case panel still calls the live prediction endpoint.


## Demo persistence note

When `VITE_USE_MOCKS=true`, dashboard batches, review actions, transactions and settings are demo data. This frontend stores mock state in browser `localStorage` under `smartledger_mock_store`, so confirming/correcting a review survives a page refresh in the same browser. This is local demo persistence, not server/database persistence.

The Single Test Case panel separately calls the FastAPI `POST /api/predict` endpoint. Do not describe batch upload/review actions as backend-integrated until matching backend endpoints and persistent storage are implemented and tested.
