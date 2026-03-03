"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const parse_1 = require("./api/parse");
const run_1 = require("./api/run");
const heuristic_1 = require("./api/heuristic");
const PORT = process.env.PORT ?? 3001;
const MAX_BODY = '2mb';
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: MAX_BODY }));
    app.use((_req, res, next) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
    app.options('*', (_req, res) => res.sendStatus(204));
    app.use('/api/parse', parse_1.parseRouter);
    app.use('/api/run', run_1.runRouter);
    app.use('/api/heuristic', heuristic_1.heuristicRouter);
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    return app;
}
if (require.main === module) {
    const app = createApp();
    app.listen(PORT, () => {
        console.log(`GENPACK API listening on http://localhost:${PORT}`);
    });
}
//# sourceMappingURL=server.js.map