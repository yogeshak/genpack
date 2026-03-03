import { Router, type Request, type Response } from 'express';
import { parseAndValidate } from '../services/ParseService';

export const parseRouter = Router();

/** POST /api/parse — validate GENPACK1 file content. Body: { content: string } */
parseRouter.post('/', (req: Request, res: Response) => {
  const content = req.body?.content;
  if (typeof content !== 'string') {
    res.status(400).json({
      valid: false,
      error: 'Missing or invalid body: expected { content: string }',
    });
    return;
  }
  const result = parseAndValidate(content);
  res.json(result);
});
