"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.heuristicRouter = void 0;
const express_1 = require("express");
const ParseService_1 = require("../services/ParseService");
const HeuristicSolver_1 = require("../domain/HeuristicSolver");
exports.heuristicRouter = (0, express_1.Router)();
const METHODS = ['length', 'width', 'area', 'perimeter'];
function validateHeuristicBody(body) {
    if (!body || typeof body.content !== 'string') {
        return { ok: false, status: 400, error: 'Missing or invalid body: expected { content: string, method: string }' };
    }
    const method = body.method;
    if (!METHODS.includes(method)) {
        return {
            ok: false,
            status: 400,
            error: `method must be one of: ${METHODS.join(', ')}`,
        };
    }
    return {
        ok: true,
        data: { content: body.content, method },
    };
}
/** POST /api/heuristic — run heuristic. Body: { content: string, method: 'length'|'width'|'area'|'perimeter' } */
exports.heuristicRouter.post('/', (req, res) => {
    const validated = validateHeuristicBody(req.body);
    if (!validated.ok) {
        res.status(validated.status).json({ error: validated.error });
        return;
    }
    const { content, method } = validated.data;
    const parseResult = (0, ParseService_1.parseFileContent)(content);
    if (!parseResult.valid || !parseResult.input) {
        res.status(400).json({
            error: parseResult.error ?? 'Invalid GENPACK1 file',
        });
        return;
    }
    try {
        const result = HeuristicSolver_1.HeuristicSolver.run(parseResult.input, method);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : 'Heuristic run failed';
        res.status(500).json({ error: message });
    }
});
//# sourceMappingURL=heuristic.js.map