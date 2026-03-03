"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneticRunner = void 0;
const Population_1 = require("./Population");
const BottomLeftPlacer_1 = require("./BottomLeftPlacer");
const Rect_1 = require("./Rect");
const Rng_1 = require("../util/Rng");
class GeneticRunner {
    constructor(input, options = {}) {
        this.input = input;
        if (options.rng) {
            this.rng = options.rng;
        }
        else if (options.seed !== undefined) {
            this.rng = (0, Rng_1.seededRng)(options.seed);
        }
        else {
            this.rng = (0, Rng_1.defaultRng)();
        }
    }
    run(options) {
        const { stockWidth, rectangles, pcross, pmute, maxGen, populationSize, itemCount, } = this.input;
        const pop = new Population_1.Population(populationSize, stockWidth, rectangles, this.rng);
        pop.evaluateAll();
        pop.updateBest();
        let bestChromosome = pop.individuals[pop.bestIndex].copy();
        let bestFitness = pop.bestFitness;
        const reports = options?.includeGenerationReports ? [] : undefined;
        for (let gen = 0; gen < maxGen - 1; gen++) {
            const selected = pop.selectTournament(this.rng);
            pop.individuals = selected;
            pop.crossover(pcross, this.rng);
            pop.mutate(pmute, this.rng);
            pop.evaluateAll();
            pop.updateBest();
            if (pop.bestFitness < bestFitness) {
                bestFitness = pop.bestFitness;
                bestChromosome = pop.individuals[pop.bestIndex].copy();
            }
            if (reports) {
                let sumFit = 0;
                for (const ch of pop.individuals)
                    sumFit += 1 / ch.fitness;
                reports.push({
                    generation: gen + 1,
                    bestHeight: bestFitness,
                    bestIndex: pop.bestIndex,
                    avgFitness: sumFit / pop.individuals.length,
                });
            }
        }
        const placer = new BottomLeftPlacer_1.BottomLeftPlacer(stockWidth);
        const ordered = bestChromosome.toOrderedRects(rectangles);
        const placeResult = placer.place(ordered);
        const placements = placeResult.placements.map((p) => {
            const orig = rectangles[p.id];
            const rotated = orig != null &&
                p.width === orig.width &&
                p.height === orig.length;
            return { ...p, rotated };
        });
        const totalArea = (() => {
            let sum = 0;
            for (let i = 0; i < itemCount; i++)
                sum += (0, Rect_1.area)(rectangles[i]);
            return sum;
        })();
        const stripArea = bestFitness * stockWidth;
        const areaWasted = stripArea - totalArea;
        const utilizationFactor = totalArea / stripArea;
        return {
            packingHeight: bestFitness,
            areaWasted,
            utilizationFactor,
            placements,
            generationReports: reports?.length ? reports : undefined,
        };
    }
}
exports.GeneticRunner = GeneticRunner;
//# sourceMappingURL=GeneticRunner.js.map