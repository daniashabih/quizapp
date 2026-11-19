import { useState, useEffect, useCallback } from 'react';
import {
    Cpu,
    ShieldCheck,
    AlertTriangle,
    RefreshCw,
    Play,
    Sparkles,
    Database,
    Trash2,
    CheckCircle2,
    Activity,
    BookOpen,
    Loader2,
    Clock,
    Layers
} from 'lucide-react';
import { toast } from '../../../services/notificationService';
import aiVerificationService from '../../../services/aiVerificationService';

const TEST_MODES = [
    {
        id: 'chat',
        label: 'Chat Completion',
        hint: 'Runs a diagnostic prompt against the configured server chat model'
    },
    {
        id: 'models',
        label: 'Available Models',
        hint: 'Retrieves live active models from Groq models endpoint and validates GROQ_MODEL'
    },
    {
        id: 'embedding',
        label: 'Embedding Vector',
        hint: 'Generates a normalized vector using the configured embedding model'
    },
    {
        id: 'verification',
        label: 'Book RAG Verification',
        hint: 'Searches MongoDB Atlas Vector Search & verifies against uploaded books'
    }
];

export default function AdminAiControls({ standalone = false }) {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [clearingCache, setClearingCache] = useState(false);

    // Interactive Test Runner State
    const [testMode, setTestMode] = useState('verification');
    const [promptText, setPromptText] = useState('Explain the HTML <section> tag in 3 concise lines.');
    const [ragQuestion, setRagQuestion] = useState('Which HTML tag defines an independent, self-contained section in a document?');
    const [ragOptions, setRagOptions] = useState('<section>, <div>, <span>, <font>');
    const [ragCorrectAnswer, setRagCorrectAnswer] = useState('<section>');
    const [ragTechnology, setRagTechnology] = useState('HTML');
    const [runningTest, setRunningTest] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [testError, setTestError] = useState('');

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const res = await aiVerificationService.getAiStatus();
            if (res?.success) {
                setStatusData(res);
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load AI status & usage.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const handleClearCache = async () => {
        setClearingCache(true);
        try {
            const res = await aiVerificationService.clearAiCache();
            toast.success(res?.message || 'Cleared in-memory AI caches.');
            fetchStatus();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to clear cache.');
        } finally {
            setClearingCache(false);
        }
    };

    const handleRunTest = async (e) => {
        e.preventDefault();
        setRunningTest(true);
        setTestResult(null);
        setTestError('');

        try {
            let payload;
            if (testMode === 'verification') {
                const parsedOpts = ragOptions
                    .split(',')
                    .map(s => s.trim())
                    .filter(Boolean);
                payload = {
                    mode: 'verification',
                    questionText: ragQuestion.trim(),
                    options: parsedOpts,
                    correctAnswer: ragCorrectAnswer.trim(),
                    technology: ragTechnology.trim() || 'HTML',
                    bypassCache: true
                };
            } else if (testMode === 'models') {
                payload = { mode: 'models' };
            } else {
                payload = {
                    mode: testMode,
                    prompt: promptText.trim()
                };
            }

            const res = await aiVerificationService.testAiModel(payload);
            setTestResult(res);
            fetchStatus();
        } catch (err) {
            setTestError(err?.response?.data?.message || err?.message || 'Diagnostic request failed.');
        } finally {
            setRunningTest(false);
        }
    };

    const aiProvider = statusData?.aiProvider || {};
    const providers = statusData?.providers || {};
    const modelValidation = statusData?.modelValidation || null;
    const config = statusData?.config || {};
    const vectorIndex = statusData?.vectorIndex || {};
    const usage = statusData?.usage || {};
    const totals = usage?.totals || {};
    const persistent = usage?.persistentDbStats || {};
    const cache = statusData?.cache || {};
    const isConfigured = Boolean(aiProvider.configured);

    return (
        <div className={`space-y-6 ${standalone ? 'animate-fade-up max-w-7xl mx-auto' : ''}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F3E5C5] dark:bg-[#D19A45]/20 text-[#193D35] dark:text-[#F3E5C5] border border-[#E2D0A6] dark:border-[#D19A45]/40 mb-2">
                        <Cpu size={12} /> Hangbug AI Engine
                    </div>
                    <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--foreground)]">
                        AI Models & Usage
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--foreground-muted)] mt-0.5">
                        Inspect active server AI configuration, MongoDB Atlas Vector Search status, cache metrics, and run verification diagnostics.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={handleClearCache}
                        disabled={clearingCache}
                        className="btn-secondary text-xs py-2 px-3 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        {clearingCache ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        <span>Clear Memory Cache</span>
                    </button>
                    <button
                        type="button"
                        onClick={fetchStatus}
                        disabled={loading}
                        className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Security & Readiness Banner */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                isConfigured
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
            }`}>
                {isConfigured ? (
                    <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                    <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="text-xs space-y-1 flex-1 min-w-0">
                    <p className="font-bold text-[var(--foreground)]">
                        {isConfigured
                            ? `Active Provider: ${String(providers.chatProvider || aiProvider.provider || '').toUpperCase()}${providers.embeddingProvider && providers.embeddingProvider !== (providers.chatProvider || aiProvider.provider) ? ` (Chat) · ${String(providers.embeddingProvider).toUpperCase()} (Embeddings)` : ''} — Credentials Secured Server-Side`
                            : 'No Active AI Provider Configured on Server'}
                    </p>
                    <p className="text-[var(--foreground-muted)]">
                        {isConfigured
                            ? 'API credentials stay strictly in server environment variables and are never sent to browser or mobile clients.'
                            : 'Existing uploaded books, vector chunks, and saved verification reports remain intact. Configure a server AI provider in Vercel environment variables when ready to run live inference.'}
                    </p>
                    {modelValidation && (
                        <p className={`text-[11px] font-semibold ${modelValidation.valid ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'}`}>
                            {modelValidation.valid
                                ? `Model "${modelValidation.resolvedModel}" validated (${modelValidation.availableChatModelsCount || 0} chat models available).`
                                : `Model validation warning: ${modelValidation.error}`}
                        </p>
                    )}
                </div>
            </div>

            {/* Vector Dimension Mismatch Warning if Applicable */}
            {vectorIndex.dimensionMismatchCount > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
                    <Database size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                        <p className="font-bold">
                            Vector Dimension Mismatch Detected ({vectorIndex.dimensionMismatchCount} book(s))
                        </p>
                        <p>
                            Configured vector index dimension is <strong>{vectorIndex.dimensions}</strong>, while {vectorIndex.dimensionMismatchCount} indexed book(s) use a different dimension. Review or re-index in <strong>AI Knowledge Base</strong> if needed.
                        </p>
                    </div>
                </div>
            )}

            {/* Configuration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="card p-4 rounded-2xl border border-[var(--card-border)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Verification / Chat Model</span>
                    <p className="text-xs font-mono font-bold text-[var(--foreground)] break-all">
                        {config.chatModel || 'Not Configured'}
                    </p>
                    <p className="text-[11px] text-[var(--foreground-muted)]">Used for RAG verification & question tools</p>
                </div>

                <div className="card p-4 rounded-2xl border border-[var(--card-border)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Book Embedding Model</span>
                    <p className="text-xs font-mono font-bold text-[var(--foreground)] break-all">
                        {config.embeddingModel || 'Text Fallback (Existing Books)'}
                    </p>
                    <p className="text-[11px] text-[var(--foreground-muted)]">
                        {config.embeddingModel ? `${config.embeddingDimensions || 1536} dimensions` : 'No embedding key; existing chunks remain searchable'}
                    </p>
                </div>

                <div className="card p-4 rounded-2xl border border-[var(--card-border)] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">Atlas Vector Index</span>
                    <p className="text-xs font-mono font-bold text-[var(--foreground)] break-all">
                        {vectorIndex.name || 'book_chunks_vector_index'}
                    </p>
                    <p className="text-[11px] text-[var(--foreground-muted)]">
                        {vectorIndex.collection || 'knowledge_book_chunks'} · {vectorIndex.dimensions || 1536}d cosine
                    </p>
                </div>
            </div>

            {/* Usage & Cache KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                    { label: 'Session Requests', value: totals.totalRequests ?? 0, icon: Activity, color: 'text-[#193D35] dark:text-emerald-400' },
                    { label: 'Cache Hit Rate', value: `${totals.cacheHitRatePercent ?? 0}%`, icon: Layers, color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Total Tokens', value: (totals.totalTokens ?? 0).toLocaleString(), icon: Sparkles, color: 'text-[#D19A45]' },
                    { label: 'DB Cached Reports', value: persistent.cachedVerificationsCount ?? 0, icon: BookOpen, color: 'text-sky-600 dark:text-sky-400' },
                    { label: 'Indexed Chunks', value: (persistent.totalIndexedChunks ?? 0).toLocaleString(), icon: Database, color: 'text-[#193D35] dark:text-[#F3E5C5]' },
                    { label: 'Errors', value: totals.errors ?? 0, icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400' }
                ].map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className="card p-3.5 rounded-2xl border border-[var(--card-border)]">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground-muted)]">{item.label}</span>
                                <Icon size={14} className={item.color} />
                            </div>
                            <p className="text-lg font-display font-extrabold text-[var(--foreground)]">{item.value}</p>
                        </div>
                    );
                })}
            </div>

            {/* Guardrails & Memory Cache Details */}
            <div className="card p-4 rounded-2xl border border-[var(--card-border)] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--foreground-muted)]">
                <span>Timeout: <strong className="text-[var(--foreground)]">{config.timeoutMs || 25000} ms</strong></span>
                <span>Retries: <strong className="text-[var(--foreground)]">{config.maxRetries || 3}x</strong></span>
                <span>Verify Rate Limit: <strong className="text-[var(--foreground)]">{config.verifyRateLimitMax || 40}/15m</strong></span>
                <span>Memory Cache: <strong className="text-[var(--foreground)]">{cache.embeddingEntries || 0} embeddings · {cache.chatEntries || 0} chats</strong></span>
                <span>Total DB Verification Hits: <strong className="text-[var(--foreground)]">{persistent.totalVerificationRequests || 0}</strong></span>
            </div>

            {/* Interactive Diagnostic Tester */}
            <div className="card p-5 sm:p-6 rounded-2xl border border-[var(--card-border)] space-y-4">
                <div>
                    <h3 className="text-base font-display font-bold text-[var(--foreground)]">
                        AI & Book RAG Diagnostic Tester
                    </h3>
                    <p className="text-xs text-[var(--foreground-muted)]">
                        Verify configured chat/embedding readiness or run a book-grounded verification check (never alters saved quiz answers).
                    </p>
                </div>

                {/* Mode Tabs */}
                <div className="flex flex-wrap gap-2">
                    {TEST_MODES.map(m => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                                setTestMode(m.id);
                                setTestResult(null);
                                setTestError('');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                testMode === m.id
                                    ? 'bg-[#193D35] text-white border-[#193D35]'
                                    : 'bg-[var(--muted-bg)] text-[var(--foreground-muted)] border-[var(--card-border)] hover:text-[var(--foreground)]'
                            }`}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>

                <p className="text-[11px] text-[var(--foreground-muted)]">
                    {TEST_MODES.find(m => m.id === testMode)?.hint}
                </p>

                <form onSubmit={handleRunTest} className="space-y-4">
                    {testMode === 'verification' ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1">Technology</label>
                                    <input
                                        type="text"
                                        value={ragTechnology}
                                        onChange={(e) => setRagTechnology(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1">Stored Correct Answer</label>
                                    <input
                                        type="text"
                                        value={ragCorrectAnswer}
                                        onChange={(e) => setRagCorrectAnswer(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1">Programming Question</label>
                                <input
                                    type="text"
                                    value={ragQuestion}
                                    onChange={(e) => setRagQuestion(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1">Options (comma-separated)</label>
                                <input
                                    type="text"
                                    value={ragOptions}
                                    onChange={(e) => setRagOptions(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                    required
                                />
                            </div>
                        </div>
                    ) : testMode === 'models' ? (
                        <div className="p-3 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground-muted)]">
                            Fetches active models from Groq&apos;s <code className="font-mono">/models</code> endpoint and validates <code className="font-mono">GROQ_MODEL</code>.
                        </div>
                    ) : (
                        <div>
                            <label className="block text-[11px] font-bold uppercase text-[var(--foreground-muted)] mb-1">Test Prompt / Input Text</label>
                            <textarea
                                rows={3}
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[var(--muted-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)]"
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={runningTest || (!isConfigured && testMode !== 'verification')}
                        className="btn-primary text-xs py-2.5 px-5 inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        {runningTest ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                        <span>{runningTest ? 'Running Test...' : 'Run Diagnostic Test'}</span>
                    </button>
                </form>

                {testError && (
                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                        <span className="break-words">{testError}</span>
                    </div>
                )}

                {testResult && (
                    <div className="p-4 rounded-2xl bg-[var(--muted-bg)]/70 border border-[var(--card-border)] space-y-3 text-xs">
                        {testMode === 'verification' && testResult.verification ? (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 font-bold text-[#193D35] dark:text-emerald-300">
                                        <CheckCircle2 size={14} />
                                        Status: {testResult.verification.verification_status}
                                    </span>
                                    <span className="font-mono text-[11px] text-[var(--foreground-muted)]">
                                        searchMode={testResult.searchMode} · {testResult.latencyMs || 0}ms
                                    </span>
                                </div>
                                {testResult.verification.verified_correct_answer && (
                                    <p>
                                        <strong>Verified Answer:</strong> {testResult.verification.verified_correct_answer}
                                    </p>
                                )}
                                <p className="whitespace-pre-line leading-relaxed text-[var(--foreground)]">
                                    {testResult.verification.explanation}
                                </p>
                                {testResult.verification.source_book && (
                                    <p className="text-[11px] text-[var(--foreground-muted)]">
                                        Source: <strong>{testResult.verification.source_book}</strong> · {testResult.verification.source_chapter} · Page {testResult.verification.source_page}
                                    </p>
                                )}
                            </>
                        ) : testResult.result ? (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                                        <CheckCircle2 size={14} />
                                        {testResult.result.provider} · {testResult.result.model}
                                    </span>
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[var(--foreground-muted)]">
                                        <Clock size={12} /> {testResult.result.latencyMs}ms
                                    </span>
                                </div>
                                {testResult.result.mode === 'embedding' ? (
                                    <div className="space-y-1 font-mono text-[11px]">
                                        <p>Dimensions: <strong>{testResult.result.dimensions}</strong> (expected {testResult.result.expectedDimensions}) · L2 Norm: {testResult.result.vectorNorm}</p>
                                        <p className="text-[var(--foreground-muted)] truncate">
                                            Sample[0..5]: [{(testResult.result.sampleValues || []).join(', ')}]
                                        </p>
                                    </div>
                                ) : testResult.result.mode === 'models' ? (
                                    <div className="space-y-2 text-[11px]">
                                        <p>
                                            Resolved Model: <strong className="font-mono">{testResult.result.resolvedModel || testResult.result.configuredModel}</strong>
                                            {testResult.result.validated ? ' (Validated)' : ''}
                                        </p>
                                        {Array.isArray(testResult.result.chatModels) && testResult.result.chatModels.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {testResult.result.chatModels.map(m => (
                                                    <span key={m} className="px-2 py-0.5 rounded-md bg-[var(--card-bg)] border border-[var(--card-border)] font-mono text-[10px]">
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <p className="whitespace-pre-line leading-relaxed text-[var(--foreground)]">
                                            {testResult.result.responseText}
                                        </p>
                                        {testResult.result.usage && (
                                            <p className="font-mono text-[11px] text-[var(--foreground-muted)]">
                                                Tokens: prompt={testResult.result.usage.promptTokens}, completion={testResult.result.usage.completionTokens}, total={testResult.result.usage.totalTokens}
                                            </p>
                                        )}
                                    </>
                                )}
                            </>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Recent AI Events Log */}
            {Array.isArray(usage.recentEvents) && usage.recentEvents.length > 0 && (
                <div className="card p-5 rounded-2xl border border-[var(--card-border)] space-y-3">
                    <h3 className="text-sm font-display font-bold text-[var(--foreground)]">
                        Recent Server AI Events (Sanitized)
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-[var(--card-border)] text-[10px] uppercase text-[var(--foreground-muted)]">
                                    <th className="py-2 pr-3">Time</th>
                                    <th className="py-2 pr-3">Operation</th>
                                    <th className="py-2 pr-3">Model</th>
                                    <th className="py-2 pr-3">Mode</th>
                                    <th className="py-2 pr-3">Tokens</th>
                                    <th className="py-2 pr-3">Latency</th>
                                    <th className="py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--card-border)]/60">
                                {usage.recentEvents.slice(0, 12).map((evt, idx) => (
                                    <tr key={`${evt.timestamp}-${idx}`}>
                                        <td className="py-2 pr-3 font-mono text-[11px] text-[var(--foreground-muted)]">
                                            {new Date(evt.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="py-2 pr-3 font-semibold">{evt.operation}</td>
                                        <td className="py-2 pr-3 font-mono text-[11px] max-w-[220px] truncate">{evt.model || evt.provider}</td>
                                        <td className="py-2 pr-3">
                                            {evt.cached ? `cache (${evt.cacheLayer || 'hit'})` : 'live'}
                                        </td>
                                        <td className="py-2 pr-3 font-mono">{evt.totalTokens || 0}</td>
                                        <td className="py-2 pr-3 font-mono">{evt.latencyMs || 0}ms</td>
                                        <td className={`py-2 font-bold ${evt.status === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                                            {evt.status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
