import type { PackingInput } from './PackingInput';
import type { RunResult } from './RunResult';
export type HeuristicMethod = 'length' | 'width' | 'area' | 'perimeter';
export declare class HeuristicSolver {
    static byLength(input: PackingInput): RunResult;
    static byWidth(input: PackingInput): RunResult;
    static byArea(input: PackingInput): RunResult;
    static byPerimeter(input: PackingInput): RunResult;
    static run(input: PackingInput, method: HeuristicMethod): RunResult;
}
//# sourceMappingURL=HeuristicSolver.d.ts.map