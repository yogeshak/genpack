"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRouter = void 0;
const express_1 = require("express");
const ParseService_1 = require("../services/ParseService");
exports.parseRouter = (0, express_1.Router)();
/** POST /api/parse — validate GENPACK1 file content. Body: { content: string } */
exports.parseRouter.post('/', (req, res) => {
    const content = req.body?.content;
    if (typeof content !== 'string') {
        res.status(400).json({
            valid: false,
            error: 'Missing or invalid body: expected { content: string }',
        });
        return;
    }
    const result = (0, ParseService_1.parseAndValidate)(content);
    res.json(result);
});
//# sourceMappingURL=parse.js.map