# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GENPACK is a C implementation of a genetic algorithm for solving the 2D rectangular bin packing problem — optimally nesting rectangular parts into stock material to minimize waste. Originally a B.E. project (circa 2001), recently refactored for portability and optimization.

## Build Commands

```bash
make all       # Build the genpack executable
make clean     # Remove object files and executable
```

Compiler: `gcc -O3 -Wall`. No platform-specific frameworks; builds on macOS and Linux.

## Running the Program

```bash
./genpack
```

Interactive menu with three options:
1. Manual part input
2. Load and display a heuristic solution
3. Run the genetic algorithm

Input files must begin with the header `GENPACK1`, followed by item count, stock length, then one `length width` pair per line.

Test input files are in `TEST/` (e.g., `TEST/CAT11.TXT` through `TEST/CAT73.TXT`, plus `TEST/IRRF.TXT`).

## Architecture

### Source Files

| File | Role |
|---|---|
| `Source/Reg-tourna.c` | Core: GA operators, bottom-left fill placement, I/O, main loop |
| `Source/optimized_structures.h` | All data structure definitions (Chromosome, Population, QuadTreeNode, PivotPoint) |
| `Source/globals.h` / `globals.c` | Shared global state (population, quadtree, GA parameters) |
| `Source/quadtree_ops.c` | Quadtree spatial index for pivot queries |
| `Source/graphics.c` / `graphics.h` | Platform abstraction for ANSI/console graphics |

### Key Data Flow

1. **Input** (`input1()`) — reads part dimensions, allocates `struct rect` array and `struct pivot` array, collects GA parameters.
2. **Initialization** (`initialize()`) — builds a population of 20 chromosomes: first 4 are heuristic orderings (by length, width, perimeter, area); remaining 16 are random permutations with random rotation flags.
3. **Decode / Fitness** (`decode()` → `place_sort()`) — each chromosome is an ordering of part indices; `place_sort()` runs the bottom-left fill heuristic and returns packing height as the fitness measure (lower = better).
4. **GA Loop** (`genetic()`) — selection (tournament, size=2), single-point crossover, bit-flip mutation on rotation signs, repeat for `maxgen` generations.
5. **Output** — best solution printed to a result text file and an AutoCAD Lisp (`.LSP`) file for visualization.

### Placement Algorithm (Bottom-Left Fill)

- `inplace()` seeds pivot points along the left edge of the stock.
- `choosepivot()` finds the lowest-leftmost valid pivot with sufficient space.
- `checkx()` / `checky()` update pivot availability after each rectangle is placed.
- The quadtree (`quadtree_ops.c`) accelerates `find_best_pivot()` queries.

### Constants (in `Reg-tourna.c`)

```c
#define inmax    200   // Max items
#define popsize   20   // GA population size
#define fmultiple 1.5  // Fitness scaling
#define scale    350   // Screen scale factor
#define s          2   // Tournament size
```

## Platform Notes

- `graphics.c` uses ANSI escape codes for console output; `#ifdef _WIN32` guards exist but are not the active path on macOS/Linux.
- `custom_random()` (in `graphics.c`) replaces the non-portable `random()` call.
- No Cocoa/Windows-specific linking; the binary runs on macOS and Linux.
