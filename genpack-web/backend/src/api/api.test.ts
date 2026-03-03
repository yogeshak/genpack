import request from 'supertest';
import { createApp } from '../server';

const SAMPLE = `GENPACK1
3
10
5 3
4 2
3 2`;

/** Same 4-rect input as BottomLeftPlacer 4-rect test: stock 20, four 10×5. BLF should place at (0,0), (10,0), (0,5), (10,5). */
const FOUR_RECT_SAMPLE = `GENPACK1
4
20
10 5
10 5
10 5
10 5`;

const app = createApp();

describe('API', () => {
  describe('POST /api/parse', () => {
    it('returns valid summary for valid content', async () => {
      const res = await request(app)
        .post('/api/parse')
        .send({ content: SAMPLE })
        .expect(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.itemCount).toBe(3);
      expect(res.body.stockWidth).toBe(10);
    });

    it('returns 400 for missing content', async () => {
      const res = await request(app)
        .post('/api/parse')
        .send({})
        .expect(400);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it('returns valid: false for invalid header', async () => {
      const res = await request(app)
        .post('/api/parse')
        .send({ content: 'BAD\n1\n10\n1 1' })
        .expect(200);
      expect(res.body.valid).toBe(false);
      expect(res.body.error).toContain('GENPACK1');
    });
  });

  describe('POST /api/run', () => {
    it('returns RunResult for valid request', async () => {
      const res = await request(app)
        .post('/api/run')
        .send({
          content: SAMPLE,
          maxGen: 3,
          seed: 42,
        })
        .expect(200);
      expect(res.body.packingHeight).toBeGreaterThan(0);
      expect(res.body.utilizationFactor).toBeGreaterThan(0);
      expect(res.body.placements).toBeInstanceOf(Array);
    });

    it('returns 400 for invalid file', async () => {
      await request(app)
        .post('/api/run')
        .send({ content: 'BAD' })
        .expect(400);
    });

    it('returns 400 for invalid params', async () => {
      await request(app)
        .post('/api/run')
        .send({ content: SAMPLE, pcross: 2 })
        .expect(400);
    });
  });

  describe('POST /api/heuristic', () => {
    it('returns RunResult for length method', async () => {
      const res = await request(app)
        .post('/api/heuristic')
        .send({ content: SAMPLE, method: 'length' })
        .expect(200);
      expect(res.body.packingHeight).toBeGreaterThan(0);
      expect(res.body.placements).toBeInstanceOf(Array);
    });

    it('returns 200 for each method', async () => {
      for (const method of ['length', 'width', 'area', 'perimeter']) {
        const res = await request(app)
          .post('/api/heuristic')
          .send({ content: SAMPLE, method })
          .expect(200);
        expect(res.body.packingHeight).toBeGreaterThan(0);
      }
    });

    it('returns 400 for invalid method', async () => {
      await request(app)
        .post('/api/heuristic')
        .send({ content: SAMPLE, method: 'invalid' })
        .expect(400);
    });

    it('returns non-stacked placements for 4 identical rects (BLF)', async () => {
      const res = await request(app)
        .post('/api/heuristic')
        .send({ content: FOUR_RECT_SAMPLE, method: 'length' })
        .expect(200);
      const placements = res.body.placements as Array<{ x: number; y: number; width: number; height: number }>;
      expect(placements).toHaveLength(4);
      expect(res.body.packingHeight).toBe(10);
      const positions = placements.map((p) => `${p.x},${p.y}`);
      const unique = new Set(positions);
      expect(unique.size).toBe(4);
      expect(placements).toMatchObject([
        { x: 0, y: 0, width: 10, height: 5 },
        { x: 10, y: 0, width: 10, height: 5 },
        { x: 0, y: 5, width: 10, height: 5 },
        { x: 10, y: 5, width: 10, height: 5 },
      ]);
    });
  });

  describe('GET /health', () => {
    it('returns 200 ok', async () => {
      const res = await request(app).get('/health').expect(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
