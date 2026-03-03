"use strict";
/**
 * GENPACK backend - Phase 1 & 2
 * Exports domain, services, GA runner, and heuristics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndValidate = exports.parseFileContent = exports.seededRng = exports.defaultRng = exports.HeuristicSolver = exports.GeneticRunner = exports.BottomLeftPlacer = exports.Population = exports.Chromosome = exports.Pivot = exports.MAX_ITEMS = exports.DEFAULT_MAX_GEN = exports.DEFAULT_PMUTE = exports.DEFAULT_PCROSS = exports.DEFAULT_POPULATION_SIZE = exports.perimeter = exports.area = exports.normalized = void 0;
var Rect_1 = require("./domain/Rect");
Object.defineProperty(exports, "normalized", { enumerable: true, get: function () { return Rect_1.normalized; } });
Object.defineProperty(exports, "area", { enumerable: true, get: function () { return Rect_1.area; } });
Object.defineProperty(exports, "perimeter", { enumerable: true, get: function () { return Rect_1.perimeter; } });
var PackingInput_1 = require("./domain/PackingInput");
Object.defineProperty(exports, "DEFAULT_POPULATION_SIZE", { enumerable: true, get: function () { return PackingInput_1.DEFAULT_POPULATION_SIZE; } });
Object.defineProperty(exports, "DEFAULT_PCROSS", { enumerable: true, get: function () { return PackingInput_1.DEFAULT_PCROSS; } });
Object.defineProperty(exports, "DEFAULT_PMUTE", { enumerable: true, get: function () { return PackingInput_1.DEFAULT_PMUTE; } });
Object.defineProperty(exports, "DEFAULT_MAX_GEN", { enumerable: true, get: function () { return PackingInput_1.DEFAULT_MAX_GEN; } });
Object.defineProperty(exports, "MAX_ITEMS", { enumerable: true, get: function () { return PackingInput_1.MAX_ITEMS; } });
var Pivot_1 = require("./domain/Pivot");
Object.defineProperty(exports, "Pivot", { enumerable: true, get: function () { return Pivot_1.Pivot; } });
var Chromosome_1 = require("./domain/Chromosome");
Object.defineProperty(exports, "Chromosome", { enumerable: true, get: function () { return Chromosome_1.Chromosome; } });
var Population_1 = require("./domain/Population");
Object.defineProperty(exports, "Population", { enumerable: true, get: function () { return Population_1.Population; } });
var BottomLeftPlacer_1 = require("./domain/BottomLeftPlacer");
Object.defineProperty(exports, "BottomLeftPlacer", { enumerable: true, get: function () { return BottomLeftPlacer_1.BottomLeftPlacer; } });
var GeneticRunner_1 = require("./domain/GeneticRunner");
Object.defineProperty(exports, "GeneticRunner", { enumerable: true, get: function () { return GeneticRunner_1.GeneticRunner; } });
var HeuristicSolver_1 = require("./domain/HeuristicSolver");
Object.defineProperty(exports, "HeuristicSolver", { enumerable: true, get: function () { return HeuristicSolver_1.HeuristicSolver; } });
var Rng_1 = require("./util/Rng");
Object.defineProperty(exports, "defaultRng", { enumerable: true, get: function () { return Rng_1.defaultRng; } });
Object.defineProperty(exports, "seededRng", { enumerable: true, get: function () { return Rng_1.seededRng; } });
var ParseService_1 = require("./services/ParseService");
Object.defineProperty(exports, "parseFileContent", { enumerable: true, get: function () { return ParseService_1.parseFileContent; } });
Object.defineProperty(exports, "parseAndValidate", { enumerable: true, get: function () { return ParseService_1.parseAndValidate; } });
//# sourceMappingURL=index.js.map