# GENPACK Web

Web application for GENPACK: 2D rectangular strip packing using a genetic algorithm.

- **Backend:** Node.js + TypeScript (parse GENPACK1, bottom-left fill placement).
- **Frontend:** React + TypeScript (Phase 4+).

## Quick start

```bash
npm install
npm test              # run backend unit + API tests
npm run build         # build backend + frontend
```

**Run locally (Phase 4):**

1. Start the API: `npm run dev:backend` (or `cd backend && npm start`) → http://localhost:3001
2. Start the frontend: `npm run dev` → http://localhost:5173 (proxies `/api` to backend)
3. Upload a GENPACK1 file or paste content, validate, then Run GA or Run heuristic.

## Phase 3 — API

Server runs on **port 3001** (or `PORT` env). CORS allows `*`; body limit 2MB.

| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/api/parse` | `{ "content": "<GENPACK1 text>" }` | `{ valid, itemCount?, stockWidth?, error? }` |
| POST | `/api/run` | `{ "content": "...", "pcross"?, "pmute"?, "maxGen"?, "populationSize"?, "seed"? }` | `RunResult` |
| POST | `/api/heuristic` | `{ "content": "...", "method": "length"\|"width"\|"area"\|"perimeter" }` | `RunResult` |
| GET | `/health` | — | `{ "status": "ok" }` |

**Example (curl):**

```bash
curl -s -X POST http://localhost:3001/api/parse -H "Content-Type: application/json" \
  -d '{"content":"GENPACK1\n3\n10\n5 3\n4 2\n3 2"}' | jq

curl -s -X POST http://localhost:3001/api/run -H "Content-Type: application/json" \
  -d '{"content":"GENPACK1\n3\n10\n5 3\n4 2\n3 2","maxGen":5,"seed":42}' | jq

curl -s -X POST http://localhost:3001/api/heuristic -H "Content-Type: application/json" \
  -d '{"content":"GENPACK1\n3\n10\n5 3\n4 2\n3 2","method":"length"}' | jq
```

## Phase 4 & 5 — Frontend

- **Stack:** Vite, React 18, TypeScript, Tailwind CSS.
- **Flow:** Create data file (optional) or upload/paste GENPACK1 → Validate → set params → Run GA or Run heuristic → Result summary + **packing layout** (canvas).
- **Packing layout:** After a run, a canvas shows the strip (stock width × packing height) and each placed rectangle (color by id, optional label). Scale-to-fit, origin top-left.
- **Create data file:** Form for item count, stock width, and length×width per item; downloads a GENPACK1 file.
- **Dev:** `npm run dev` (frontend on :5173, proxies `/api` to backend); run backend with `npm run dev:backend`.

## Phase 1 & 2

- **Domain:** `Rect`, `PlacedRect`, `PackingInput`, `Pivot`, `BottomLeftPlacer`, `Chromosome`, `Population`, `RunResult`, `GeneticRunner`, `HeuristicSolver`.
- **Util:** `Rng`, `seededRng`, `defaultRng` for reproducible runs.
- **Services:** `ParseService` (GENPACK1 → `PackingInput`).
- **Tests:** Jest in `backend`; run with `npm test` from repo root or `cd backend && npm test`.

## Input format

GENPACK1: first line `GENPACK1`, then item count, stock width, then one `length width` per line. See `TEST/` in the parent C project.
