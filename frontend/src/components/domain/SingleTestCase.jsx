
import { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Code2,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { API_BASE_URL } from '@/api/client';

const sampleTransaction = {
  'JWOO Ref': 'JWOO-TEST-001',
  'Service Charge': 250,
  'Agreement Terms': 'Processing and return of materials',
};

export function SingleTestCase() {
  const [transactionText, setTransactionText] = useState(
    JSON.stringify(sampleTransaction, null, 2)
  );
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setError('');
    setPrediction(null);

    let transaction;

    try {
      transaction = JSON.parse(transactionText);

      if (
        !transaction ||
        Array.isArray(transaction) ||
        typeof transaction !== 'object' ||
        !Object.keys(transaction).length
      ) {
        throw new Error(
          'Enter a non-empty JSON object for one transaction.'
        );
      }
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? 'Invalid JSON. Check commas, quotes, and braces.'
          : err.message
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ transaction }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail =
          body.detail ||
          body.message ||
          `Request failed (${response.status})`;

        throw new Error(
          typeof detail === 'string'
            ? detail
            : JSON.stringify(detail)
        );
      }

      // Preserve the original response for debugging.
      const result = body.prediction || body.result || body;

      const category =
        result.category ||
        result.predicted_category ||
        result.voucher_category;

      if (!category) {
        throw new Error(
          'No voucher category found in the API response. ' +
          'Expand the browser console or inspect the backend response.'
        );
      }

      // Always display the final category returned by the backend.
      // model_category is the original model prediction.
      setPrediction({
        ...result,
        category,
        rawResponse: body,
      });
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to SmartLedger API. Check that the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const resetSample = () => {
    setTransactionText(
      JSON.stringify(sampleTransaction, null, 2)
    );
    setPrediction(null);
    setError('');
  };

  const evidence = prediction?.evidence;

  const evidenceCandidates = Array.isArray(evidence)
    ? evidence
    : Array.isArray(evidence?.candidates)
      ? evidence.candidates
      : [];

  const reviewReasons = prediction?.review_reasons;
  const reviewReasonItems = Array.isArray(reviewReasons)
    ? reviewReasons
    : reviewReasons && typeof reviewReasons === 'object'
      ? Object.entries(reviewReasons)
          .filter(([, value]) => value === true)
          .map(([key]) => key)
      : [];

  const rawResponse =
    prediction?.rawResponse || prediction;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-accent-subtle p-2 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">
                Single Test Case
              </h2>

              <span className="rounded-full border border-border bg-surface-secondary px-2 py-0.5 text-xs text-text-secondary">
                Live Qwen demo
              </span>
            </div>

            <p className="mt-1 text-sm text-text-secondary">
              Run one structured voucher through the real SmartLedger API.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={resetSample}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border px-3 py-2 text-sm font-medium text-text-primary transition hover:bg-surface-secondary disabled:opacity-50 sm:self-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Reset sample
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 xl:grid-cols-2">
        <div className="min-w-0">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="test-transaction"
              className="text-sm font-medium text-text-primary"
            >
              Transaction fields (JSON)
            </label>

            <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
              <Code2 className="h-3.5 w-3.5" />
              Editable sample
            </span>
          </div>

          <textarea
            id="test-transaction"
            value={transactionText}
            onChange={(event) =>
              setTransactionText(event.target.value)
            }
            spellCheck={false}
            className="min-h-64 w-full resize-y rounded-lg border border-border bg-base px-3 py-3 font-mono text-xs leading-5 text-text-primary outline-none transition focus:border-accent"
            aria-label="Transaction JSON input"
          />

          <button
            type="button"
            onClick={runTest}
            disabled={loading}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? (
              <Activity className="h-4 w-4 animate-pulse" />
            ) : (
              <Play className="h-4 w-4" />
            )}

            {loading ? 'Classifying with Qwen…' : 'Run Test Case'}
          </button>

          <p className="mt-2 text-xs text-text-secondary">
            Inference runs on your configured backend. CPU inference may take a little time.
          </p>
        </div>

        <div className="min-w-0 rounded-lg border border-border bg-base p-4">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">
              Prediction result
            </h3>
          </div>

          {loading && (
            <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
              <p className="text-sm text-text-secondary">
                Analysing transaction evidence…
              </p>
              <p className="text-xs text-text-secondary">
                Please keep this page open.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 p-3 text-sm text-error">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />

              <div>
                <p className="font-semibold">Test case failed</p>
                <p className="mt-1 break-words">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && !prediction && (
            <div className="flex min-h-44 flex-col items-center justify-center text-center">
              <div className="rounded-full border border-border p-3 text-text-secondary">
                <Play className="h-5 w-5" />
              </div>

              <p className="mt-3 text-sm font-medium text-text-primary">
                Ready to test
              </p>

              <p className="mt-1 max-w-xs text-xs leading-5 text-text-secondary">
                Run the sample or edit the JSON to demonstrate a different voucher.
              </p>
            </div>
          )}

          {!loading && prediction && (
            <div className="space-y-4">
              <div className="rounded-lg border border-success/25 bg-success/5 p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Predicted voucher category
                </div>

                <p className="mt-2 break-words text-2xl font-semibold text-text-primary">
                  {prediction.category}
                </p>

                {prediction.model_category &&
                  prediction.model_category !== prediction.category && (
                    <p className="mt-2 text-xs text-text-secondary">
                      Qwen originally predicted:{' '}
                      <span className="font-semibold text-text-primary">
                        {prediction.model_category}
                      </span>
                    </p>
                  )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-text-secondary">
                    Decision source
                  </p>

                  <p className="mt-1 break-words text-sm font-semibold text-text-primary">
                    {prediction.decision_source || 'Not provided'}
                  </p>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-text-secondary">
                    Review status
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      prediction.needs_review
                        ? 'text-warning'
                        : 'text-success'
                    }`}
                  >
                    {prediction.needs_review
                      ? 'Needs human review'
                      : 'No review flagged'}
                  </p>
                </div>
              </div>

              {prediction.reasoning && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Reasoning
                  </p>

                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-text-primary">
                    {prediction.reasoning}
                  </p>
                </div>
              )}

              {prediction.override_reason && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <p className="text-xs font-semibold text-warning">
                    Evidence validation note
                  </p>

                  <p className="mt-1 text-sm text-text-primary">
                    {prediction.override_reason}
                  </p>
                </div>
              )}

              {reviewReasonItems.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Review reasons
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {reviewReasonItems.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full border border-border bg-surface-secondary px-2 py-1 text-xs text-text-secondary"
                      >
                        {String(reason).replaceAll('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {evidenceCandidates.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Evidence candidates
                  </p>

                  <div className="space-y-2">
                    {evidenceCandidates.slice(0, 3).map((item, index) => (
                      <div
                        key={`${item.category || item.name || 'candidate'}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                      >
                        <span className="text-text-primary">
                          {item.category || item.name || item.label || `Candidate ${index + 1}`}
                        </span>

                        <span className="shrink-0 text-xs tabular-nums text-text-secondary">
                          {item.score ?? item.confidence ?? ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <details className="rounded-lg border border-border">
                <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-text-secondary">
                  View full API response
                </summary>

                <pre className="max-h-64 overflow-auto border-t border-border p-3 text-xs leading-5 text-text-primary">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}