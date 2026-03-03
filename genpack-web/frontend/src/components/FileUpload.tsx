import { useCallback, useState } from 'react';
import type { ParseResult } from '../types/api';
import { parseFile } from '../api/client';

interface FileUploadProps {
  onParsed: (content: string, result: ParseResult) => void;
  disabled?: boolean;
}

export function FileUpload({ onParsed, disabled }: FileUploadProps) {
  const [content, setContent] = useState('');
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);
      setParseResult(null);
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result ?? '');
        setContent(text);
        setLoading(true);
        parseFile(text)
          .then((result) => {
            setParseResult(result);
            if (result.valid) onParsed(text, result);
          })
          .catch((err) => setError(err instanceof Error ? err.message : 'Parse failed'))
          .finally(() => setLoading(false));
      };
      reader.readAsText(file);
    },
    [onParsed]
  );

  const handleValidatePasted = useCallback(() => {
    if (!content.trim()) return;
    setError(null);
    setLoading(true);
    parseFile(content)
      .then((result) => {
        setParseResult(result);
        if (result.valid) onParsed(content, result);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Parse failed'))
      .finally(() => setLoading(false));
  }, [content, onParsed]);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h2 className="text-lg font-semibold text-slate-800">Input file</h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload a GENPACK1 file or paste content below and click Validate.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:opacity-50">
          <input
            type="file"
            className="hidden"
            accept=".txt,.TXT,text/plain"
            onChange={handleFileChange}
            disabled={disabled}
          />
          Choose file
        </label>
      </div>
      <div className="mt-3">
        <label className="block text-sm font-medium text-slate-700">
          Or paste GENPACK1 content
        </label>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setParseResult(null);
            setError(null);
          }}
          placeholder={'GENPACK1\n3\n10\n5 3\n4 2\n3 2'}
          rows={5}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 font-mono text-sm text-slate-800"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleValidatePasted}
          disabled={disabled || loading || !content.trim()}
          className="mt-2 rounded bg-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 disabled:opacity-50"
        >
          {loading ? 'Validating…' : 'Validate'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {parseResult && (
        <div className="mt-3 text-sm">
          {parseResult.valid ? (
            <p className="text-green-700">
              Valid: <strong>{parseResult.itemCount}</strong> items, stock width{' '}
              <strong>{parseResult.stockWidth}</strong>
            </p>
          ) : (
            <p className="text-red-600">{parseResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
