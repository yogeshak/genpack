import type { PackingInput } from '../domain/PackingInput';
export interface ParseResult {
    valid: boolean;
    itemCount?: number;
    stockWidth?: number;
    error?: string;
}
export interface ParseFullResult {
    valid: boolean;
    input?: PackingInput;
    error?: string;
}
/**
 * Parse GENPACK1 file content.
 * Format: first token "GENPACK1", then itemCount (int), stockWidth (float), then itemCount lines of "length width".
 */
export declare function parseFileContent(content: string, options?: {
    pcross?: number;
    pmute?: number;
    maxGen?: number;
    populationSize?: number;
}): ParseFullResult;
/**
 * Validate only: return summary without building full PackingInput.
 */
export declare function parseAndValidate(content: string): ParseResult;
//# sourceMappingURL=ParseService.d.ts.map