import type { GenerationReport } from '../types/api';

interface GAEvolutionChartProps {
  reports: GenerationReport[];
}

export function GAEvolutionChart({ reports }: GAEvolutionChartProps) {
  if (!reports.length) return null;

  const maxH = Math.max(...reports.map((r) => r.bestHeight), ...reports.map((r) => r.avgFitness ?? 0));
  const minH = Math.min(...reports.map((r) => r.bestHeight), ...reports.map((r) => r.avgFitness ?? 0));
  const padding = (maxH - minH) * 0.1 || 1;
  const yMax = maxH + padding;
  const yMin = Math.max(0, minH - padding);
  const yRange = yMax - yMin || 1;
  const chartW = 400;
  const chartH = 180;
  const n = reports.length;
  const x = (i: number) => (n <= 1 ? chartW / 2 : (i / (n - 1)) * (chartW - 20) + 10);
  const y = (v: number) => chartH - 20 - ((v - yMin) / yRange) * (chartH - 40);

  const bestPath = reports.map((r, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(r.bestHeight)}`).join(' ');
  const avgPoints = reports
    .map((r, i) => (r.avgFitness != null ? [x(i), y(r.avgFitness!)] as const : null))
    .filter((p): p is [number, number] => p != null);
  const avgPath = avgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <div>
      <p className="text-sm text-slate-600">
        Best and average packing height (fitness) per generation. Lower is better.
      </p>

      <div className="mt-3">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full max-w-lg"
          style={{ height: chartH }}
          aria-label="Best and average fitness by generation"
        >
          <line x1={10} y1={chartH - 20} x2={chartW - 10} y2={chartH - 20} stroke="#e2e8f0" strokeWidth={1} />
          <line x1={10} y1={20} x2={10} y2={chartH - 20} stroke="#e2e8f0" strokeWidth={1} />
          <path d={bestPath} fill="none" stroke="#059669" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <path d={avgPath} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="mt-1 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded bg-emerald-500" />
            Best height
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4 rounded border border-slate-400 border-dashed" />
            Avg fitness
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[200px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-4 text-left font-medium text-slate-700">Generation</th>
              <th className="py-2 pr-4 text-right font-medium text-slate-700">Best height</th>
              <th className="py-2 text-right font-medium text-slate-700">Avg fitness</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.generation} className="border-b border-slate-100">
                <td className="py-1.5 pr-4 text-slate-800">{r.generation}</td>
                <td className="py-1.5 pr-4 text-right font-medium text-slate-800">
                  {r.bestHeight.toFixed(2)}
                </td>
                <td className="py-1.5 text-right text-slate-700">
                  {r.avgFitness != null ? r.avgFitness.toFixed(2) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
