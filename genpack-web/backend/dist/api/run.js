"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRouter = void 0;
const express_1 = require("express");
const ParseService_1 = require("../services/ParseService");
const GeneticRunner_1 = require("../domain/GeneticRunner");
const PackingInput_1 = require("../domain/PackingInput");
exports.runRouter = (0, express_1.Router)();
function validateRunBody(body) {
    if (!body || typeof body.content !== 'string') {
        return { ok: false, status: 400, error: 'Missing or invalid body: expected { content: string, ...params }' };
    }
    const b = body;
    const pcross = b.pcross !== undefined && b.pcross !== null ? Number(b.pcross) : PackingInput_1.DEFAULT_PCROSS;
    const pmute = b.pmute !== undefined && b.pmute !== null ? Number(b.pmute) : PackingInput_1.DEFAULT_PMUTE;
    const maxGen = b.maxGen !== undefined && b.maxGen !== null ? Number(b.maxGen) : PackingInput_1.DEFAULT_MAX_GEN;
    const populationSize = b.populationSize !== undefined && b.populationSize !== null ? Number(b.populationSize) : PackingInput_1.DEFAULT_POPULATION_SIZE;
    if (!Number.isFinite(pcross) || pcross < 0 || pcross > 1) {
        return { ok: false, status: 400, error: 'pcross must be a number in [0, 1]' };
    }
    if (!Number.isFinite(pmute) || pmute < 0 || pmute > 1) {
        return { ok: false, status: 400, error: 'pmute must be a number in [0, 1]' };
    }
    if (!Number.isFinite(maxGen) || maxGen < 1) {
        return { ok: false, status: 400, error: 'maxGen must be a positive integer' };
    }
    if (!Number.isFinite(populationSize) || populationSize < 4 || populationSize > PackingInput_1.MAX_ITEMS) {
        return { ok: false, status: 400, error: `populationSize must be an integer in [4, ${PackingInput_1.MAX_ITEMS}]` };
    }
    return {
        ok: true,
        data: {
            content: b.content,
            pcross,
            pmute,
            maxGen,
            populationSize,
            seed: b.seed,
        },
    };
}
/** POST /api/run — run GA. Body: { content, pcross?, pmute?, maxGen?, populationSize?, seed? } */
exports.runRouter.post('/', (req, res) => {
    const validated = validateRunBody(req.body);
    if (!validated.ok) {
        res.status(validated.status).json({ error: validated.error });
        return;
    }
    const { content, pcross, pmute, maxGen, populationSize, seed } = validated.data;
    const parseResult = (0, ParseService_1.parseFileContent)(content, { pcross, pmute, maxGen, populationSize });
    if (!parseResult.valid || !parseResult.input) {
        res.status(400).json({
            error: parseResult.error ?? 'Invalid GENPACK1 file',
        });
        return;
    }
    try {
        const runner = new GeneticRunner_1.GeneticRunner(parseResult.input, { seed });
        const result = runner.run({ includeGenerationReports: true });
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Run failed';
        res.status(500).json({ error: message });
    }
});
//# sourceMappingURL=run.js.map