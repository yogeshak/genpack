import type { ParseResult, RunResult } from '../types/api';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? res.statusText ?? 'Request failed');
  }
  return data as T;
}

export async function parseFile(content: string): Promise<ParseResult> {
  return post<ParseResult>('/api/parse', { content });
}

export interface RunParams {
  content: string;
  pcross?: number;
  pmute?: number;
  maxGen?: number;
  populationSize?: number;
  seed?: number;
}

export async function runGA(params: RunParams): Promise<RunResult> {
  return post<RunResult>('/api/run', params);
}

export interface HeuristicParams {
  content: string;
  method: 'length' | 'width' | 'area' | 'perimeter';
}

export async function runHeuristic(params: HeuristicParams): Promise<RunResult> {
  return post<RunResult>('/api/heuristic', params);
}
