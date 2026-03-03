import { useState } from 'react';
import type { HeuristicMethod } from '../types/api';
import { runGA, runHeuristic } from '../api/client';
import type { RunResult } from '../types/api';

const DEFAULT_PCROSS = 0.8;
const DEFAULT_PMUTE = 0.1;
const DEFAULT_MAX_GEN = 100;

interface RunFormProps {
  content: string | null;
  onResult: (result: RunResult) => void;
  disabled?: boolean;
}

export function RunForm({ content, onResult, disabled }: RunFormProps) {
  const [pcross, setPcross] = useState(DEFAULT_PCROSS);
  const [pmute, setPmute] = useState(DEFAULT_PMUTE);
  const [maxGen, setMaxGen] = useState(DEFAULT_MAX_GEN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [heuristicMethod, setHeuristicMethod] = useState<HeuristicMethod>('length');

  const canRun = content && content.trim().length > 0 && !disabled;

  const handleRunGA = async () => {
    if (!content) return;
    setError(null);
    setLoading(true);
    try {
      const result = await runGA({
        content,
        pcross,
        pmute,
        maxGen,
      });
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunHeuristic = async () => {
    if (!content) return;
    setError(null);
    setLoading(true);
    try {
      const result = await runHeuristic({ content, method: heuristicMethod });
      onResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold text-slate-800">Run</h2>
      <p className="mt-1 text-sm text-slate-600">
        Set parameters and run the genetic algorithm or a heuristic.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Crossover (0–1)</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={pcross}
            onChange={(e) => setPcross(Number(e.target.value))}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-slate-800"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Mutation (0–1)</span>
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={pmute}
            onChange={(e) => setPmute(Number(e.target.value))}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-slate-800"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Max gen</span>
          <input
            type="number"
            min={1}
            value={maxGen}
            onChange={(e) => setMaxGen(Number(e.target.value))}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-slate-800"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleRunGA}
          disabled={!canRun || loading}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Running…' : 'Run GA'}
        </button>
        <span className="text-slate-400">|</span>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span>Heuristic:</span>
          <select
            value={heuristicMethod}
            onChange={(e) => setHeuristicMethod(e.target.value as HeuristicMethod)}
            className="rounded border border-slate-300 bg-white px-2 py-1.5 text-slate-800"
          >
            <option value="length">Length</option>
            <option value="width">Width</option>
            <option value="area">Area</option>
            <option value="perimeter">Perimeter</option>
          </select>
        </label>
        <button
          type="button"
          onClick={handleRunHeuristic}
          disabled={!canRun || loading}
          className="rounded bg-slate-600 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Run heuristic
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
