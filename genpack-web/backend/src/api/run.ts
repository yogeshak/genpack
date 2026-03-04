import { Router, type Request, type Response } from 'express';
import { parseFileContent } from '../services/ParseService';
import { GeneticRunner } from '../domain/GeneticRunner';
import {
  DEFAULT_POPULATION_SIZE,
  DEFAULT_PCROSS,
  DEFAULT_PMUTE,
  DEFAULT_MAX_GEN,
  MAX_ITEMS,
} from '../domain/PackingInput';

export const runRouter = Router();

interface RunBody {
  content: string;
  pcross?: number;
  pmute?: number;
  maxGen?: number;
  populationSize?: number;
  seed?: number;
}

function validateRunBody(body: unknown): { ok: true; data: RunBody } | { ok: false; status: number; error: string } {
  if (!body || typeof (body as RunBody).content !== 'string') {
    return { ok: false, status: 400, error: 'Missing or invalid body: expected { content: string, ...params }' };
  }
  const b = body as RunBody;
  const pcross = b.pcross !== undefined && b.pcross !== null ? Number(b.pcross) : DEFAULT_PCROSS;
  const pmute = b.pmute !== undefined && b.pmute !== null ? Number(b.pmute) : DEFAULT_PMUTE;
  const maxGen = b.maxGen !== undefined && b.maxGen !== null ? Number(b.maxGen) : DEFAULT_MAX_GEN;
  const populationSize = b.populationSize !== undefined && b.populationSize !== null ? Number(b.populationSize) : DEFAULT_POPULATION_SIZE;

  if (!Number.isFinite(pcross) || pcross < 0 || pcross > 1) {
    return { ok: false, status: 400, error: 'pcross must be a number in [0, 1]' };
  }
  if (!Number.isFinite(pmute) || pmute < 0 || pmute > 1) {
    return { ok: false, status: 400, error: 'pmute must be a number in [0, 1]' };
  }
  if (!Number.isFinite(maxGen) || maxGen < 1) {
    return { ok: false, status: 400, error: 'maxGen must be a positive integer' };
  }
  if (!Number.isFinite(populationSize) || populationSize < 4 || populationSize > MAX_ITEMS) {
    return { ok: false, status: 400, error: `populationSize must be an integer in [4, ${MAX_ITEMS}]` };
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
runRouter.post('/', (req: Request, res: Response) => {
  const validated = validateRunBody(req.body);
  if (!validated.ok) {
    res.status(validated.status).json({ error: validated.error });
    return;
  }
  const { content, pcross, pmute, maxGen, populationSize, seed } = validated.data;

  const parseResult = parseFileContent(content, { pcross, pmute, maxGen, populationSize });
  if (!parseResult.valid || !parseResult.input) {
    res.status(400).json({
      error: parseResult.error ?? 'Invalid GENPACK1 file',
    });
    return;
  }

  try {
    const runner = new GeneticRunner(parseResult.input, { seed });
    const result = runner.run({ includeGenerationReports: true });
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Run failed';
    res.status(500).json({ error: message });
  }
});
