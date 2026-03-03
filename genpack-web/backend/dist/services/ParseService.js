"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFileContent = parseFileContent;
exports.parseAndValidate = parseAndValidate;
const PackingInput_1 = require("../domain/PackingInput");
const GENPACK_HEADER = 'GENPACK1';
/**
 * Parse GENPACK1 file content.
 * Format: first token "GENPACK1", then itemCount (int), stockWidth (float), then itemCount lines of "length width".
 */
function parseFileContent(content, options) {
    const lines = content
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    if (lines.length < 3) {
        return { valid: false, error: 'File too short: need header, item count, stock width, and at least one rectangle' };
    }
    const tokens0 = lines[0].split(/\s+/);
    const header = tokens0[0];
    if (header !== GENPACK_HEADER) {
        return { valid: false, error: `Invalid header: expected "${GENPACK_HEADER}", got "${header}"` };
    }
    const itemCount = parseInt(lines[1].trim(), 10);
    if (Number.isNaN(itemCount) || itemCount < 1 || itemCount > PackingInput_1.MAX_ITEMS) {
        return {
            valid: false,
            error: `Invalid item count: must be 1..${PackingInput_1.MAX_ITEMS}, got "${lines[1]}"`,
        };
    }
    const stockWidth = parseFloat(lines[2].trim());
    if (Number.isNaN(stockWidth) || stockWidth <= 0) {
        return { valid: false, error: `Invalid stock width: must be > 0, got "${lines[2]}"` };
    }
    const rectLines = lines.slice(3, 3 + itemCount);
    if (rectLines.length < itemCount) {
        return {
            valid: false,
            error: `Expected ${itemCount} rectangle lines, got ${rectLines.length}`,
        };
    }
    const rectangles = [];
    for (let i = 0; i < itemCount; i++) {
        const parts = rectLines[i].split(/\s+/).filter((s) => s.length > 0);
        if (parts.length < 2) {
            return { valid: false, error: `Line ${i + 4}: expected "length width", got "${rectLines[i]}"` };
        }
        const len = parseFloat(parts[0]);
        const wid = parseFloat(parts[1]);
        if (Number.isNaN(len) || Number.isNaN(wid) || len <= 0 || wid <= 0) {
            return {
                valid: false,
                error: `Line ${i + 4}: length and width must be positive numbers, got "${rectLines[i]}"`,
            };
        }
        rectangles.push({ id: i, length: len, width: wid });
    }
    const input = {
        itemCount,
        stockWidth,
        rectangles,
        pcross: options?.pcross ?? PackingInput_1.DEFAULT_PCROSS,
        pmute: options?.pmute ?? PackingInput_1.DEFAULT_PMUTE,
        maxGen: options?.maxGen ?? PackingInput_1.DEFAULT_MAX_GEN,
        populationSize: options?.populationSize ?? PackingInput_1.DEFAULT_POPULATION_SIZE,
    };
    return { valid: true, input };
}
/**
 * Validate only: return summary without building full PackingInput.
 */
function parseAndValidate(content) {
    const result = parseFileContent(content);
    if (!result.valid) {
        return { valid: false, error: result.error };
    }
    return {
        valid: true,
        itemCount: result.input.itemCount,
        stockWidth: result.input.stockWidth,
    };
}
//# sourceMappingURL=ParseService.js.map