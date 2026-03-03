# GENPACK — Functional Specification

**Document version:** 1.0  
**Based on:** Source code analysis of GENPACK (Reg-tourna.c, quadtree_ops.c, globals, graphics).

---

## 1. Project Overview

**GENPACK** solves the **2D rectangular strip packing problem** (optimal nesting): given a fixed-width strip (stock length = width) and a list of rectangular parts (length × width), it finds an ordering and placement that **minimizes packing height** (and thus waste).

- **Algorithm:** Genetic algorithm (GA) with **bottom-left fill (BLF)** placement heuristic.
- **Origin:** B.E. project (2001), originally Turbo C / BGI for Windows; refactored for portability (ANSI C, console/ANSI graphics).
- **Output:** Best packing height, waste %, utilization factor, optional AutoCAD Lisp (`.LSP`) file for visualization.

---

## 2. Input / Output

### 2.1 Input file format

- **Header:** First token must be `GENPACK1`.
- **Next:** Item count `in` (integer), stock length `leng` (float).
- **Then:** For each of `in` items, one line: `length width` (two floats).
- **Example:** See `TEST/CAT21.TXT` (25 items, stock length 15, then 25 lines of length width).

### 2.2 User prompts (during run)

- Input data file name, result file name, Lisp file name.
- For genetic run: probability of crossover (0–1), probability of mutation (0–1), maximum generations.

### 2.3 Output

- **Result file:** Input echo, GA parameters, per-generation report (height, fitness, chosen chromosome), final packing height, area wasted, utilization factor.
- **Lisp file:** AutoCAD script drawing the base rectangle and (when implemented in place_sort) rectangle commands for visualization.

---

## 3. Constants (Reg-tourna.c)

| Constant   | Value | Meaning                          |
|-----------|-------|----------------------------------|
| `inmax`   | 200   | Maximum number of items          |
| `popsize` | 20    | GA population size               |
| `fmultiple` | 1.5 | Fitness scaling (roulette)       |
| `scale`   | 350   | Screen scale factor for display  |
| `s`       | 2     | Tournament size                  |

---

## 4. Data Structures

### 4.1 Reg-tourna.c (main program)

| Structure     | Role |
|---------------|------|
| `struct pivot` | Pivot point: `sx,sy` position; `avalx,avaly` available space; `parent`, `isalive`, `pfor`, `which`, `ischeckx`, `ischecky`. |
| `struct rect`  | Rectangle: `len`, `wid`; `rot` (0/1), `flag` (placed or not), `no`, `irr`, `number`. |
| `struct pop_detail` | One chromosome: `chrom[inmax]` (ordering; sign = rotation), `packht`, `gen_number`, `parent1`/`parent2`, `cross_site`, `cross_length`, `is_crossed`, `fx`. |
| `struct roullete` | Roulette selection: `stringno`, `height`, `fitness`, `scalfit`, `a`, `b`, `c`, `d`, `choostr` (all arrays of size popsize). |
| `struct co`   | Coordinate pair `sx`, `sy`; `flag` (used for irregular shapes; not actively used in rectangular path). |

### 4.2 optimized_structures.h / quadtree_ops.c

| Type / struct   | Role |
|-----------------|------|
| `PivotPoint`    | Pivot with `x`, `y`, `avalx`, `avaly`, `isalive`, `parent`, `which`, `ischeckx`, `ischecky`, `pfor`. |
| `QuadTreeNode`   | Quadtree node: bounds `x`, `y`, `width`, `height`; `is_leaf`, `num_points`, `points[]`, `children[4]`. |
| `Chromosome`     | `order[]`, `order_size`, `fitness`, `is_evaluated`, `is_crossed`. |
| `Population`     | `individuals[]`, `size`, `best_fitness`, `best_index`. |

**Note:** The main GA in Reg-tourna.c uses `struct pop_detail` and `struct pivot` only. The quadtree and `PivotPoint`/`Chromosome`/`Population` in optimized_structures.h are **not** currently used by the main flow; they are available for a future optimized/quadtree-based placement path.

---

## 5. Function Catalog

### 5.1 Reg-tourna.c — GA core

| Function | Signature | Description |
|----------|------------|-------------|
| `main` | `int main(void)` | Entry point. Initializes graphics, shows option screen; loop: create data file (1), heuristic solutions (2), genetic run (3); ESC to exit. |
| `input1` | `int input1(void)` | Reads input file (GENPACK1), allocates `rr`, `sor`, `arr`, `ar1`, `p`; prompts for result file, Lisp file, `pcross`, `pmute`, `maxgen`. Returns 0 if valid, else non-zero. |
| `initialize` | `void initialize(void)` | Builds initial population: indices 0–3 = heuristic orderings (sort by length, width, perimeter, area); 4–(popsize-1) = random permutation + random rotation (seqgenr). |
| `decode` | `void decode(void)` | For each population member, sets `oldpop[i].packht = height(i)`. |
| `best` | `void best(void)` | Keeps best-so-far solution: if `oldpop[i].packht < bestever.packht` then `bestever = oldpop[i]`. |
| `selection` | `void selection(void)` | Calls `tour_select()` (tournament selection); roulette `roul()` is commented out. |
| `crossover` | `void crossover(void)` | Pairs members (0,1), (2,3), …; with probability `pcross` calls `crosser(mate1, mate2)`, else copies parents; fills `newpop`. |
| `mutation` | `void mutation(void)` | For each gene of each member in `newpop`, with probability `pmute` flips sign (rotation). |
| `genetic` | `void genetic(void)` | Calls `input1()`; loop: decode, best, selection, crossover, mutation; copy newpop → oldpop; then writes results, offers `final_op()` to show output. |
| `ifflip` | `int ifflip(float pcr)` | Probabilistic flip: returns 1 with probability `pcr`, else 0 (uses custom_random(1000)/1000.0). |
| `seqgenr` | `void seqgenr(int maxno)` | Random permutation of 0..maxno-1 into `arr`; random rotation per index via `givesign(i)`; copies into `sor` with rotation applied (swap len/wid if rot). |
| `seqgen` | `void seqgen(int maxno)` | Random permutation of 0..maxno-1 into `arr1` only (no rotation). |
| `givesign` | `void givesign(int i)` | With probability 0.3 sets `arr[i] = -arr[i]` (rotation). |
| `roul` | `void roul(void)` | Roulette wheel selection with scaling (Goldberg-style); fills `generation.*` and `newpop`. Writes generation report to `rfp`. (Not used when tour_select is active.) |
| `tour_select` | `void tour_select(void)` | Tournament selection: for each slot, pick `s` random individuals, choose one with best (lowest) height; fill `newpop`, write report to `rfp`. |
| `crosser` | `void crosser(int mate1, int mate2)` | Single-point crossover: random crossover length `q`, build child1 from tempop[mate1] prefix + mate2 remainder (by absolute value); child2 from mate2 prefix + mate1 remainder. Writes into global `child1`, `child2`. |
| `area_occupied` | `float area_occupied(void)` | Sum of `rr[i].len * rr[i].wid` over all items. |
| `final_op` | `void final_op(void)` | Displays best solution: set `sor` from `bestever.chrom`, `inplace()`, `place_sort()`; shows packing height, writes Lisp file. |
| `report` | `void report(void)` | **Declared only; no definition in Reg-tourna.c.** Unused. |

### 5.2 Reg-tourna.c — Heuristic (sorting) solutions

| Function | Signature | Description |
|----------|------------|-------------|
| `sort_menu` | `char sort_menu(void)` | Draws heuristic menu (1=length, 2=width, 3=area, 4=perimeter), returns key from `getch()`. |
| `place_sort` | `float place_sort(void)` | Places rectangles in current `sor` order using BLF; draws on screen and writes Lisp commands; returns packing height. Uses `choosepivot`, `pivot_status`, `chosen`. |
| `sortlen` | `void sortlen(void)` | Sorts rectangles by length (descending); fills `sor` and `arr`; normalizes so len ≥ wid. |
| `sortwid` | `void sortwid(void)` | Sorts by width (descending); same convention. |
| `sortper` | `void sortper(void)` | Sorts by perimeter (descending). |
| `sortarea` | `void sortarea(void)` | Sorts by area (descending). |
| `load` | `int load(void)` | Reads input file (GENPACK1), allocates arrays and pivots; prompts Lisp file name. Returns 0 if valid. |
| `sorting` | `void sorting(void)` | Loop: clear screen, `sort_menu()`; on 1–4 run corresponding sort then `inplace()` + `place_sort()` and show height; ESC exits. |
| `input` | `void input(void)` | Creates data file: prompts file name, item count, stock length, then length/width per item; writes GENPACK1 format. |

### 5.3 Reg-tourna.c — Bottom-left fill placement

| Function | Signature | Description |
|----------|------------|-------------|
| `inplace` | `void inplace(void)` | Seeds pivots along left edge: for `i = 0..2*leng-1`, pivot at (Lx, Ly+i) with avalx=leng, avaly=(2*leng)-i; sets count. |
| `place` | `float place(void)` | BLF loop: for each item in `sor` (with rotation applied), call `choosepivot`; mark pivot alive; update height; set pflag by pivot type; call `pivot_status`; return packing height. (No drawing.) |
| `choose_x` | `void choose_x(void)` | Sort pivots by (sy, sx) so that among same y, leftmost (smaller x) comes first. |
| `choosepivot` | `int choosepivot(int z)` | Sort pivots by y then call choose_x; return index of first pivot with avaly ≥ sor[z].wid, avalx ≥ sor[z].len, isalive==0; set global `chosen`; return -1 if none. |
| `checkx` | `void checkx(int ww)` | After placement, update pivot available space in x: reduce avalx / mark dead for pivots to the left and in same vertical band. |
| `checky` | `void checky(int ww)` | Update pivot available space in y: reduce avaly / mark dead for pivots below and in same horizontal band. |
| `px` | `int px(int p_pos)` | Find index of “previous” pivot: same parent, which==0, isalive==1; used for special pivot logic. |
| `ch` | `void ch(int p_pos, int re_pos)` | Create a special pivot when parent width equals placed-rect width: new pivot to the right of current; increment count. |
| `pivot_status` | `void pivot_status(int pflag, int p_pos, int re_pos)` | Updates pivot list after placing rectangle at chosen pivot: pflag 0–5 (by parent vs current size and which); creates 0, 1, or 2 new pivots; calls checkx/checky/ch as needed. |
| `height` | `float height(int i)` | Decode chromosome `i`: set `sor` from `oldpop[i].chrom` (with rotation and len≥wid); `inplace()`; return `place()`. |

### 5.4 Reg-tourna.c — UI / entry

| Function | Signature | Description |
|----------|------------|-------------|
| `option_screen` | `void option_screen(void)` | Draws main menu: 1=Create data file, 2=Heuristic solutions, 3=Genetic approach; “Choose your option”. |

### 5.5 quadtree_ops.c (spatial index; not used by main GA)

| Function | Signature | Description |
|----------|------------|-------------|
| `create_quadtree` | `QuadTreeNode* create_quadtree(float x, float y, float w, float h)` | Allocates root node; is_leaf=1, num_points=0, children=NULL. |
| `free_quadtree` | `void free_quadtree(QuadTreeNode* node)` | Recursive free of tree and points. |
| `split_quadtree` | `void split_quadtree(QuadTreeNode* node)` | Converts leaf to internal node: create 4 children, redistribute points, clear points. |
| `insert_point` | `void insert_point(QuadTreeNode* node, PivotPoint* point)` | Insert point into leaf; if num_points > MAX_POINTS_PER_NODE, split. |
| `find_best_pivot` | `PivotPoint* find_best_pivot(QuadTreeNode* node, float width, float height)` | Recursively find live pivot with avalx≥width, avaly≥height and minimum y. |
| `update_quadtree` | `void update_quadtree(QuadTreeNode* node, PivotPoint* point)` | Mark point as used (isalive=1) in the tree. |

### 5.6 graphics.c / graphics.h (platform abstraction)

| Function | Signature | Description |
|----------|------------|-------------|
| `initgraph` | `void initgraph(int* gd, int* gm, const char* path)` | Init RNG (srand). |
| `closegraph` | `void closegraph(void)` | No-op. |
| `cleardevice` | `void cleardevice(void)` | ANSI clear screen + cursor home. |
| `getmaxx` / `getmaxy` | `int getmaxx(void)` / `int getmaxy(void)` | Return 800 / 600. |
| `setcolor` / `setbkcolor` | `void setcolor(int c)` / `void setbkcolor(int c)` | ANSI text/background color. |
| `settextstyle` / `setfillstyle` | `void settextstyle(...)` / `void setfillstyle(...)` | No-op in console. |
| `bar` | `void bar(int L, int T, int R, int B)` | Draw filled rectangle with `#`. |
| `rectangle` | `void rectangle(int L, int T, int R, int B)` | Draw rectangle outline with `-` and `|`. |
| `outtextxy` | `void outtextxy(int x, int y, const char* str)` | Position cursor and print string. |
| `gotoxy` | `void gotoxy(int x, int y)` | ANSI cursor position. |
| `getch` | `int getch(void)` | Raw tty, read one char, restore tty. |
| `randomize` | `void randomize(void)` | srand(time(NULL)). |
| `custom_random` | `int custom_random(int max)` | rand() % max. |
| `recta` | `void recta(float x1, float y1, float x2, float y2)` | Rectangle outline (float coords). |
| `recta1` | `void recta1(int x1, int y1, int x2, int y2, int re_pos)` | Rectangle outline + label (re_pos+1). |

### 5.7 globals.c / globals.h

Defines globals used by GA and (optionally) quadtree path: `current_pop`, `quadtree`, `rfp`, `genc`, `maxgen`, `popsize`, `in`, `leng`, `pcross`, `pmute`. Main Reg-tourna.c uses its own globals (oldpop, newpop, p, rr, sor, etc.) and only partially overlaps (e.g. rfp, genc, maxgen, popsize, in, leng, pcross, pmute are in globals).

### 5.8 optimized_structures.h — Declared but not implemented

These are declared in the header but have **no implementation** in the repo:

- `initialize_population(void)`
- `evaluate_population_parallel(void)`
- `tournament_selection(void)`
- `crossover_optimized(Chromosome*, Chromosome*)`
- `mutate_optimized(Chromosome*)`
- `update_quadtree_for_generation(void)`
- `free_resources(void)`

They are placeholders for a possible alternate GA using Chromosome/Population and quadtree.

---

## 6. Data Flow Summary

1. **Start:** `main()` → initgraph → option_screen → getch.
2. **Option 1 — Create data file:** `input()` → prompts → write GENPACK1 file.
3. **Option 2 — Heuristic:** `load()` → `sorting()` → sort_menu → sortlen/sortwid/sortarea/sortper → `inplace()` → `place_sort()` → show height.
4. **Option 3 — Genetic:** `genetic()` → `input1()` → loop: `decode()` (calls `height(i)` = inplace + place per chromosome) → `best()` → `selection()` (tour_select) → `crossover()` (crosser) → `mutation()` → oldpop = newpop; then write results → optional `final_op()` (inplace + place_sort for bestever).

---

## 7. File Roles

| File | Role |
|------|------|
| `Source/Reg-tourna.c` | Main program: GA, BLF, heuristics, I/O, UI. |
| `Source/optimized_structures.h` | Structs (PivotPoint, QuadTreeNode, Chromosome, Population) and declarations for quadtree + optional GA (latter unimplemented). |
| `Source/quadtree_ops.c` | Quadtree create/free/split/insert/find_best_pivot/update (not called from Reg-tourna.c). |
| `Source/globals.c`, `globals.h` | Shared globals (partially used by main). |
| `Source/graphics.c`, `graphics.h` | Console/ANSI implementation of BGI-like API. |

---

## 8. Build and Run

- **Build:** `make all` (gcc, no Cocoa required).
- **Run:** `./genpack`; use menu 1/2/3; input files in `TEST/` must start with `GENPACK1`.

This spec reflects the code as analyzed; the quadtree and optimized GA declarations are reserved for future use.
