import { useState, useCallback, useRef } from 'react';
import { FileUpload } from './components/FileUpload';
import { RunForm } from './components/RunForm';
import { ResultSummary } from './components/ResultSummary';
import { PackingSvg } from './components/PackingSvg';
import { CreateDataFile } from './components/CreateDataFile';
import type { ParseResult, RunResult, PlacedRect } from './types/api';

function App() {
  const [content, setContent] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);

  const handleParsed = useCallback((c: string, result: ParseResult) => {
    setContent(c);
    setParseResult(result);
    setRunResult(null);
  }, []);

  const handleResult = useCallback((result: RunResult) => {
    setRunResult(result);
  }, []);

  const packingSvgRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = useCallback(() => {
    const container = packingSvgRef.current;
    const svg = container?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(svg);
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'genpack-packing.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadPng = useCallback(() => {
    const container = packingSvgRef.current;
    const svg = container?.querySelector('svg');
    if (!svg) return;
    const viewBox = svg.getAttribute('viewBox');
    const [,, vw, vh] = viewBox ? viewBox.split(/\s+/).map(Number) : [0, 0, 520, 400];
    const w = Math.round(Number(svg.getAttribute('width')) || svg.clientWidth || vw);
    const h = Math.round(Number(svg.getAttribute('height')) || svg.clientHeight || vh);
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    const serializer = new XMLSerializer();
    const str = serializer.serializeToString(clone);
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob((pngBlob) => {
          URL.revokeObjectURL(url);
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = 'genpack-packing.png';
          a.click();
          URL.revokeObjectURL(pngUrl);
        }, 'image/png');
      } else {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, []);

  const handleDownloadSequenceExcel = useCallback(
    (result: RunResult) => {
      const header = ['Packing height', result.packingHeight.toFixed(2)];
      const cols = ['Sequence', 'Id', 'Length', 'Width', 'Rotation'];
      const rows = result.placements.map((r: PlacedRect, i: number) => [
        i + 1,
        r.id + 1,
        r.width,
        r.height,
        r.rotated === true ? 'Yes' : 'No',
      ]);
      const lines = [
        header.join(','),
        cols.join(','),
        ...rows.map((row) => row.join(',')),
      ];
      const csv = lines.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'genpack-sequence.csv';
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h1 className="text-xl font-bold text-slate-800">GENPACK</h1>
        <p className="text-sm text-slate-600">
          Optimal nesting of 2D parts using genetic algorithms
        </p>
      </header>

      <main className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:gap-6 lg:p-6">
        {/* Left panel: inputs */}
        <aside className="w-full shrink-0 space-y-4 lg:w-96 lg:max-w-md">
          <FileUpload onParsed={handleParsed} />
          <RunForm
            content={content}
            onResult={handleResult}
            disabled={!parseResult?.valid}
          />
          <CreateDataFile />
        </aside>

        {/* Right panel: result + layout */}
        <section className="min-w-0 flex-1 space-y-4">
          <ResultSummary result={runResult} />
          {runResult &&
            parseResult?.valid &&
            typeof parseResult.stockWidth === 'number' &&
            runResult.placements.length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-lg font-semibold text-slate-800">Packing layout</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Strip width {parseResult.stockWidth}, height {runResult.packingHeight.toFixed(2)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Download image (SVG)
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPng}
                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Download image (PNG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSequenceExcel(runResult)}
                    className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Download sequence (Excel CSV)
                  </button>
                </div>
                <div ref={packingSvgRef} className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  <PackingSvg
                    stockWidth={parseResult.stockWidth}
                    packingHeight={runResult.packingHeight}
                    placements={runResult.placements}
                    maxWidth={520}
                    maxHeight={400}
                  />
                </div>
              </div>
            )}
        </section>
      </main>
    </div>
  );
}

export default App;
