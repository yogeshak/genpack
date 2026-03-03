import type { RunResult } from '../types/api';

interface ResultSummaryProps {
  result: RunResult | null;
}

export function ResultSummary({ result }: ResultSummaryProps) {
  if (!result) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h2 className="text-lg font-semibold text-slate-800">Result</h2>
        <p className="mt-2 text-sm text-slate-500">Run GA or a heuristic to see results.</p>
      </div>
    );
  }

  const utilPct = (result.utilizationFactor * 100).toFixed(2);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold text-slate-800">Result</h2>
      <dl className="mt-3 grid gap-2 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Packing height</dt>
          <dd className="text-lg font-semibold text-slate-800">
            {result.packingHeight.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Area wasted</dt>
          <dd className="text-lg font-semibold text-slate-800">
            {result.areaWasted.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase text-slate-500">Utilization</dt>
          <dd className="text-lg font-semibold text-slate-800">{utilPct}%</dd>
        </div>
      </dl>
      <p className="mt-2 text-sm text-slate-600">
        {result.placements.length} rectangle(s) placed.
      </p>
    </div>
  );
}
