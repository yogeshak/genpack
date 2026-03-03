import type { PackingInput } from './PackingInput';
import type { RunResult } from './RunResult';
import { type Rng } from '../util/Rng';
export interface GeneticRunnerOptions {
    /** Optional seed for reproducible runs */
    seed?: number;
    /** Optional RNG (overrides seed if provided) */
    rng?: Rng;
}
export declare class GeneticRunner {
    private readonly input;
    private readonly rng;
    constructor(input: PackingInput, options?: GeneticRunnerOptions);
    run(options?: {
        includeGenerationReports?: boolean;
    }): RunResult;
}
//# sourceMappingURL=GeneticRunner.d.ts.map