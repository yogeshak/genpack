import { useState } from 'react';

interface RectInput {
  length: string;
  width: string;
}

function buildGENPACK1(itemCount: number, stockWidth: number, rects: RectInput[]): string {
  const lines = ['GENPACK1', String(itemCount), String(stockWidth)];
  rects.slice(0, itemCount).forEach((r) => {
    lines.push(`${r.length || '0'} ${r.width || '0'}`);
  });
  return lines.join('\n');
}

export function CreateDataFile() {
  const [itemCount, setItemCount] = useState(3);
  const [stockWidth, setStockWidth] = useState('10');
  const [rects, setRects] = useState<RectInput[]>([
    { length: '5', width: '3' },
    { length: '4', width: '2' },
    { length: '3', width: '2' },
  ]);

  const safeCount = Math.max(1, Math.min(200, Math.floor(Number(itemCount) || 1)));
  const list = rects.slice(0, safeCount);
  while (list.length < safeCount) {
    list.push({ length: '', width: '' });
  }

  const updateRect = (i: number, field: 'length' | 'width', value: string) => {
    const next = [...rects];
    while (next.length <= i) next.push({ length: '', width: '' });
    next[i] = { ...next[i], [field]: value };
    setRects(next);
  };

  const handleDownload = () => {
    const sw = Number(stockWidth) || 10;
    const content = buildGENPACK1(safeCount, sw, list);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'genpack-input.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold text-slate-800">Create data file</h2>
      <p className="mt-1 text-sm text-slate-600">
        Enter problem data and download a GENPACK1 file to use in the app.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Number of items (1–200)</span>
          <input
            type="number"
            min={1}
            max={200}
            value={itemCount}
            onChange={(e) => setItemCount(Number(e.target.value) || 1)}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-slate-800"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Stock width</span>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={stockWidth}
            onChange={(e) => setStockWidth(e.target.value)}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-slate-800"
          />
        </label>
      </div>
      <div className="mt-3 max-h-48 overflow-y-auto rounded border border-slate-200 bg-white p-2">
        <p className="mb-2 text-xs font-medium text-slate-500">Length × Width per item</p>
        {list.map((r, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input
              type="number"
              min={0}
              step={0.1}
              placeholder="Length"
              value={r.length}
              onChange={(e) => updateRect(i, 'length', e.target.value)}
              className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              min={0}
              step={0.1}
              placeholder="Width"
              value={r.width}
              onChange={(e) => updateRect(i, 'width', e.target.value)}
              className="w-24 rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleDownload}
        className="mt-3 rounded bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600"
      >
        Download GENPACK1 file
      </button>
    </div>
  );
}
