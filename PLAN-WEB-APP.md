# GENPACK Web Application — Implementation Plan

**Goal:** Port GENPACK to a web app: frontend for file upload, run parameters, and graphics output; backend (TypeScript or Java) implementing the GA and bottom-left fill (BLF) with an object-oriented, non-C architecture.

**Reference:** [SPEC.md](SPEC.md) for algorithm and data structures.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Web Frontend (SPA)                                              │
│  • Upload GENPACK1 input file                                     │
│  • Form: pcross, pmute, maxgen, popsize (optional)               │
│  • Start run → Poll or WebSocket for progress                     │
│  • Results: packing height, waste %, utilization                 │
│  • Graphics: canvas/SVG of placed rectangles                      │
└───────────────────────────────┬──────────────────────────────────┘
                                │ REST API (JSON)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend (TypeScript/Node OR Java/Spring)                         │
│  • Parse GENPACK1 → domain model                                  │
│  • GA service: initialize → decode → best → selection →           │
│    crossover → mutation → repeat                                  │
│  • BLF placement: pivots + place() → height + placements[]        │
│  • Return: run result + list of (x, y, w, h, label) for drawing  │
└─────────────────────────────────────────────────────────────────┘
```

- **Stateless API:** Each “run” is one request (or run ID + poll). No long-lived C-style globals.
- **Backend choice:** **TypeScript (Node.js)** recommended for single-language stack, shared types with frontend, and simpler deployment. **Java (Spring Boot)** is the alternative if the team prefers JVM and strong typing on the server only.

---

## 2. Technology Recommendations

| Layer     | Option A (Recommended)     | Option B                    |
|----------|-----------------------------|-----------------------------|
| Frontend | React or Vue 3 + TypeScript | Same                        |
| UI       | Tailwind or plain CSS       | Same                        |
| Graphics | HTML5 Canvas or SVG         | Same                        |
| Backend  | Node.js + Express (TS)      | Java 17+ / Spring Boot      |
| API      | REST, JSON                  | REST, JSON                  |
| Progress | Polling GET /run/:id       | Same or SSE                 |

---

## 3. Domain Model (Backend — OOP, Language-Agnostic)

Design for **TypeScript or Java**: classes, immutable DTOs for API boundaries, no raw structs or global mutable state.

### 3.1 Value objects / DTOs (API and internal)

| Name           | Role | Fields |
|----------------|------|--------|
| `Rectangle`    | One part (read-only) | `id: number`, `length: number`, `width: number` |
| `PlacedRect`   | One placed part for graphics | `id: number`, `x: number`, `y: number`, `width: number`, `height: number`, `label?: string` |
| `PackingInput` | Parsed file + params | `itemCount: number`, `stockWidth: number`, `rectangles: Rectangle[]`, `pcross: number`, `pmute: number`, `maxGen: number`, `populationSize: number` |
| `RunResult`    | API response | `packingHeight: number`, `areaWasted: number`, `utilizationFactor: number`, `placements: PlacedRect[]`, `generationReports?: GenerationReport[]` |
| `GenerationReport` | Optional per-gen log | `generation: number`, `bestHeight: number`, `bestIndex: number`, `avgFitness?: number` |

### 3.2 Core domain classes (backend)

- **Rect**
  - Fields: `id`, `length`, `width`.
  - Methods: `area()`, `perimeter()`, `normalized()` (return new Rect with length ≥ width for BLF).

- **Pivot**
  - Fields: `x`, `y`, `avalX`, `avalY`, `isAlive`, `parentIndex`, `which` (0/1/2), `isCheckX`, `isCheckY`, `pFor`.
  - Encapsulates one candidate placement point; BLF updates pivots in a list.

- **Chromosome**
  - Fields: `genes: number[]` (ordering; sign = rotation: negative = rotate 90°).
  - Methods: `copy()`, `fitness` set after decode (packing height).

- **Population**
  - Fields: `individuals: Chromosome[]`, `bestIndex: number`, `bestFitness: number`.
  - Methods: `evaluateAll(problem: PackingProblem)`, `updateBest()`, `selectTournament(size: number, rng)`, `crossover(pcross, rng)`, `mutate(pmute, rng)`.

- **BottomLeftPlacer** (replaces C’s inplace/place/choosepivot/pivot_status/checkx/checky/ch/px)
  - Input: `stockWidth: number`, `orderedRects: Rect[]` (each already normalized if rotated).
  - Output: `{ height: number, placements: PlacedRect[] }`.
  - Internal: list of Pivot; methods `seedPivots()`, `choosePivot(rect)`, `placeOne(rect, pivotIndex)`, `updatePivots(pflag, ...)` (mirroring pivot_status + checkx/checky/ch). No globals; all state in instance.

- **GeneticRunner**
  - Input: `PackingInput`.
  - Holds: `population: Population`, `problem` (rects + stockWidth), `params` (pcross, pmute, maxGen).
  - Methods: `run(): RunResult` (loop: decode → best → selection → crossover → mutation; then build RunResult with best placement and optional generation reports).
  - Optional: `runWithProgress(callback each gen)` for progress reporting.

### 3.3 Heuristic entry points (backend)

- **HeuristicSolver**
  - Methods: `byLength(input)`, `byWidth(input)`, `byArea(input)`, `byPerimeter(input)`.
  - Each returns `RunResult` (same shape as GA) using a fixed sort order + single BLF run via `BottomLeftPlacer`.

This keeps GA and heuristics sharing the same placement and result shape.

---

## 4. API Design

### 4.1 Parse input file (validate only)

- **POST** `/api/parse`
- **Body:** multipart file (GENPACK1) or raw text.
- **Response:** `{ valid: boolean, itemCount?: number, stockWidth?: number, error?: string }`.

### 4.2 Run genetic algorithm

- **POST** `/api/run`
- **Body:** `{ file: <uploaded or base64>, pcross: number, pmute: number, maxGen: number, populationSize?: number }`  
  or pass previously parsed payload.
- **Response:** `RunResult` (packingHeight, areaWasted, utilizationFactor, placements, optional generationReports).
- **Alternative (async):** **POST** `/api/run` → `{ runId: string }`; **GET** `/api/run/:runId` → `{ status: 'running'|'done', result?: RunResult }` for polling.

### 4.3 Run heuristic

- **POST** `/api/heuristic`
- **Body:** `{ file, method: 'length'|'width'|'area'|'perimeter' }`.
- **Response:** `RunResult` (no generation reports).

### 4.4 Download result file (optional)

- **POST** `/api/run` with `includeReport: true` or **GET** `/api/run/:id/report`
- **Response:** plain text or JSON with full generation log (for “result file” parity with C version).

---

## 5. Frontend Structure

### 5.1 Pages / views

1. **Home / Run**
   - File dropzone or file input for GENPACK1.
   - After parse: show item count, stock width, optional table of rectangles.
   - Form: Crossover probability (0–1), Mutation probability (0–1), Max generations.
   - Buttons: “Run GA”, “Run heuristic” (with method selector: length/width/area/perimeter).
   - Result panel: packing height, waste %, utilization; “Show layout” button.

2. **Results + Graphics**
   - Summary numbers (height, waste, utilization).
   - **Graphics area:** Canvas or SVG:
     - One rectangle for stock (fixed width, height = packing height).
     - For each `PlacedRect`: draw rectangle at (x, y) with width/height, optional label (id or 1-based index).
   - Scale: fit to viewport while preserving aspect (stock width vs packing height).
   - Optional: zoom/pan, toggle labels, color by id.

3. **Optional: Create data file**
   - Form: number of items, stock width, for each item length/width (dynamic list).
   - Button: “Download GENPACK1 file” (generate file client-side or via API).

### 5.2 State and API usage

- Store parsed input in frontend state (or send file each time).
- On “Run GA”: POST to `/api/run`, show loading; on success store `RunResult`, switch to results view and draw from `result.placements`.
- Optional: use `runId` + polling for long runs and progress (e.g. “Generation 50 / 200”).

### 5.3 Graphics implementation options

- **Canvas:** Simple `ctx.fillRect`, `ctx.strokeRect`, scale = min(canvasWidth/stockWidth, canvasHeight/packingHeight), origin at bottom-left or top-left with y-flip so layout matches spec.
- **SVG:** One `<rect>` per part + stock; same scaling; easier for zoom/pan and accessibility.

---

## 6. Backend Implementation Outline (TypeScript)

### 6.1 Project layout (Node + Express + TS)

```
genpack-web/
  backend/
    src/
      domain/
        Rect.ts
        Pivot.ts
        Chromosome.ts
        Population.ts
        BottomLeftPlacer.ts
        GeneticRunner.ts
        HeuristicSolver.ts
      services/
        ParseService.ts      # GENPACK1 → PackingInput
        RunService.ts        # orchestrate GeneticRunner / HeuristicSolver
      api/
        routes/
          parse.ts
          run.ts
          heuristic.ts
      index.ts
    package.json
    tsconfig.json
  frontend/
    src/
      components/
        FileUpload.tsx
        RunForm.tsx
        ResultSummary.tsx
        PackingCanvas.tsx  (or PackingSvg.tsx)
      pages/
        Home.tsx
        Result.tsx
      api/
        client.ts
      types/
        api.d.ts
    package.json
```

### 6.2 Key mappings from C to OOP

| C (SPEC)              | Backend (TS/Java)                          |
|-----------------------|--------------------------------------------|
| `struct rect` + `rr[]`| `Rectangle[]` + normalized copy per use    |
| `struct pivot` + `p[]`| `Pivot` class in `BottomLeftPlacer.pivots` |
| `inplace()`            | `BottomLeftPlacer.seedPivots()`            |
| `choosepivot()`        | `BottomLeftPlacer.choosePivot(rect)`        |
| `pivot_status()`       | `BottomLeftPlacer.updatePivots(pflag, …)`  |
| `checkx` / `checky`    | Private methods inside `BottomLeftPlacer`  |
| `place()`              | `BottomLeftPlacer.place()` → height + placements |
| `height(i)`            | Build order from chromosome → `place()`     |
| `oldpop` / `newpop`    | `Population.individuals` + temp array     |
| `tour_select()`        | `Population.selectTournament(2)`           |
| `crosser()`            | `Chromosome.crossover(other, rng)` or static |
| Mutation               | `Chromosome.mutate(pmute, rng)`            |
| `decode()`             | `Population.evaluateAll(problem)`          |
| `best()`               | `Population.updateBest()`                  |

Use a single **RNG** (e.g. seeded from request or `Math.random()`) passed into selection/crossover/mutation for reproducibility if needed.

---

## 7. Backend Implementation Outline (Java Alternative)

### 7.1 Project layout (Spring Boot)

```
genpack-web/
  backend-java/
    src/main/java/com/genpack/
      domain/
        Rectangle.java
        Pivot.java
        Chromosome.java
        Population.java
        BottomLeftPlacer.java
        GeneticRunner.java
        HeuristicSolver.java
      dto/
        PackingInput.java
        RunResult.java
        PlacedRect.java
      service/
        ParseService.java
        RunService.java
      web/
        ParseController.java
        RunController.java
      Application.java
    build.gradle
  frontend/
    (same as above)
```

### 7.2 Same domain logic

- Same class responsibilities and method names as in §3.2.
- Use `List<Pivot>`, `List<Chromosome>`, etc.; avoid static mutable state.
- `RunService` parses file via `ParseService`, builds `GeneticRunner` or `HeuristicSolver`, returns `RunResult` (JSON via DTOs).

---

## 8. File Format Handling

- **Parser:** Read line by line or split by whitespace; expect first token `GENPACK1`, then int (item count), float (stock width), then `itemCount` lines of two floats (length, width).
- **Validation:** Reject if header missing, count &lt; 1 or &gt; 200 (or configurable max), stock width &lt;= 0, any dimension &lt;= 0.
- **Backend:** No need to write Lisp; frontend uses `placements` for drawing. Optional endpoint to generate a text “result report” (like C’s rfp output) for download.

---

## 9. Phased Implementation Plan

### Phase 1 — Core domain and BLF (backend)

1. **Rect / Rectangle** and **PlacedRect** DTO.
2. **PackingInput** DTO and **ParseService** (GENPACK1 → PackingInput).
3. **Pivot** class and **BottomLeftPlacer**:
   - Implement `seedPivots(stockWidth)`, `choosePivot(rect)`, `placeOne`, `updatePivots` (pflag 0–5), mirroring C’s checkx/checky/ch/px logic.
   - `place(orderedRects)` returns `{ height, placements }`.
4. Unit tests: known input (e.g. from TEST/CAT21.TXT), one heuristic order; compare height and placement count with C output or hand-check.

**Exit criterion:** BLF output matches C for the same order (same height and same number of placements).

### Phase 2 — GA on backend

1. **Chromosome**: genes (signed indices), `copy()`, apply rotation when building rect order.
2. **Population**: init (4 heuristic + rest random with rotation), `evaluateAll` (call placer per chromosome), `updateBest`, tournament selection, single-point crossover, sign flip mutation.
3. **GeneticRunner**: loop decode → best → selection → crossover → mutation; return **RunResult** with best height, waste, utilization, placements, optional generation reports.
4. **HeuristicSolver**: four sort orders + one BLF run each.
5. Unit tests: small instance, fixed seed; compare best height with C run (same params).

**Exit criterion:** GA and heuristics return valid RunResult; GA best height ≤ heuristic best for a small test.

### Phase 3 — API and run endpoint

1. **POST** `/api/parse`: multipart file → ParseService → validation response.
2. **POST** `/api/run`: body with file + params → ParseService → GeneticRunner → RunResult JSON.
3. **POST** `/api/heuristic`: file + method → HeuristicSolver → RunResult JSON.
4. Optional: **GET** `/api/run/:id` for async runs with polling.

**Exit criterion:** Curl/Postman can run GA and heuristic and get correct JSON.

### Phase 4 — Frontend shell and run flow

1. Create app (React/Vue + TS), routing, basic layout.
2. File upload component; call `/api/parse`, show item count and stock width.
3. Run form (pcross, pmute, maxGen); “Run GA” and “Run heuristic” buttons; call API, show loading.
4. Result summary component: height, waste %, utilization from RunResult.

**Exit criterion:** User can upload file, set params, run GA, see result numbers.

### Phase 5 — Graphics and polish

1. **PackingCanvas** or **PackingSvg**: input `stockWidth`, `packingHeight`, `placements`; scale to fit; draw stock and each placed rect (and optional labels).
2. Wire to Result view; “Show layout” or auto-show after run.
3. Optional: create-data-file page (form → download GENPACK1).
4. Error handling, validation messages, responsive layout.

**Exit criterion:** User sees correct visual layout matching backend placements.

### Phase 6 — Optional improvements

- Async run with `runId` and progress (e.g. generation index).
- Configurable population size and tournament size in API and UI.
- Export result as text report (like C result file).
- Shared TypeScript types between frontend and backend (monorepo or npm package).

---

## 10. Optimization Notes for Target Architecture

- **Immutability:** Prefer immutable DTOs and “copy on change” for chromosomes during crossover/mutation to avoid C-style in-place mutation bugs.
- **No globals:** All state in runner/placer/population instances; request-scoped or one-off.
- **RNG:** Inject a single RNG (or seed) per run for reproducibility and testability.
- **Placement list:** BLF returns a list of (x, y, w, h, id); no drawing in backend. Frontend does all rendering.
- **Scaling:** One run per request is stateless; for very long runs, use job queue + polling or SSE and keep run state in memory or DB by runId.
- **Quadtree:** Omitted in v1; can be added later inside `BottomLeftPlacer` to speed pivot search (replace linear scan with `find_best_pivot`-style query).

---

## 11. Success Criteria

- Input: GENPACK1 file + run parameters (pcross, pmute, maxGen).
- Output: Same or very close packing height to C implementation for the same instance and parameters.
- Frontend: Upload file, set parameters, run GA or heuristic, see numeric results and a correct 2D drawing of the packing.
- Backend: Clean OOP design, no C-style globals, testable domain and API.

This plan is sufficient to implement the web application with a TypeScript or Java backend and a graphics-capable frontend; start with Phase 1 and proceed in order.
