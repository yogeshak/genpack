"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeuristicSolver = void 0;
const BottomLeftPlacer_1 = require("./BottomLeftPlacer");
const Rect_1 = require("./Rect");
function orderByLength(rectangles) {
    return [...rectangles].map(Rect_1.normalized).sort((a, b) => b.length - a.length);
}
function orderByWidth(rectangles) {
    return [...rectangles].map(Rect_1.normalized).sort((a, b) => b.width - a.width);
}
function orderByArea(rectangles) {
    return [...rectangles].map(Rect_1.normalized).sort((a, b) => (0, Rect_1.area)(b) - (0, Rect_1.area)(a));
}
function orderByPerimeter(rectangles) {
    return [...rectangles].map(Rect_1.normalized).sort((a, b) => (0, Rect_1.perimeter)(b) - (0, Rect_1.perimeter)(a));
}
function runHeuristic(stockWidth, rectangles, ordered) {
    const placer = new BottomLeftPlacer_1.BottomLeftPlacer(stockWidth);
    const { height, placements } = placer.place(ordered);
    let totalArea = 0;
    for (const r of rectangles)
        totalArea += (0, Rect_1.area)(r);
    const stripArea = height * stockWidth;
    const areaWasted = stripArea - totalArea;
    const utilizationFactor = totalArea / stripArea;
    return {
        packingHeight: height,
        areaWasted,
        utilizationFactor,
        placements,
    };
}
class HeuristicSolver {
    static byLength(input) {
        const ordered = orderByLength(input.rectangles);
        return runHeuristic(input.stockWidth, input.rectangles, ordered);
    }
    static byWidth(input) {
        const ordered = orderByWidth(input.rectangles);
        return runHeuristic(input.stockWidth, input.rectangles, ordered);
    }
    static byArea(input) {
        const ordered = orderByArea(input.rectangles);
        return runHeuristic(input.stockWidth, input.rectangles, ordered);
    }
    static byPerimeter(input) {
        const ordered = orderByPerimeter(input.rectangles);
        return runHeuristic(input.stockWidth, input.rectangles, ordered);
    }
    static run(input, method) {
        switch (method) {
            case 'length':
                return HeuristicSolver.byLength(input);
            case 'width':
                return HeuristicSolver.byWidth(input);
            case 'area':
                return HeuristicSolver.byArea(input);
            case 'perimeter':
                return HeuristicSolver.byPerimeter(input);
        }
    }
}
exports.HeuristicSolver = HeuristicSolver;
//# sourceMappingURL=HeuristicSolver.js.map