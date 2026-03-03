import { Router, type Request, type Response } from 'express';
import { parseFileContent } from '../services/ParseService';
import { HeuristicSolver, type HeuristicMethod } from '../domain/HeuristicSolver';

export const heuristicRouter = Router();

const METHODS: HeuristicMethod[] = ['length', 'width', 'area', 'perimeter'];

interface HeuristicBody {
  content: string;
  method: HeuristicMethod;
}

function validateHeuristicBody(body: unknown): { ok: true; data: HeuristicBody } | { ok: false; status: number; error: string } {
  if (!body || typeof (body as HeuristicBody).content !== 'string') {
    return { ok: false, status: 400, error: 'Missing or invalid body: expected { content: string, method: string }' };
  }
  const method = (body as HeuristicBody).method;
  if (!METHODS.includes(method)) {
    return {
      ok: false,
      status: 400,
      error: `method must be one of: ${METHODS.join(', ')}`,
    };
  }
  return {
    ok: true,
    data: { content: (body as HeuristicBody).content, method },
  };
}

/** POST /api/heuristic — run heuristic. Body: { content: string, method: 'length'|'width'|'area'|'perimeter' } */
heuristicRouter.post('/', (req: Request, res: Response) => {
  const validated = validateHeuristicBody(req.body);
  if (!validated.ok) {
    res.status(validated.status).json({ error: validated.error });
    return;
  }
  const { content, method } = validated.data;

  const parseResult = parseFileContent(content);
  if (!parseResult.valid || !parseResult.input) {
    res.status(400).json({
      error: parseResult.error ?? 'Invalid GENPACK1 file',
    });
    return;
  }

  try {
    const result = HeuristicSolver.run(parseResult.input, method);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Heuristic run failed';
    res.status(500).json({ error: message });
  }
});
