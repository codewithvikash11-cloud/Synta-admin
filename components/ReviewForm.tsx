'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle, XCircle, Search, ExternalLink, AlertOctagon } from 'lucide-react';
import Link from 'next/link';

export default function ReviewForm({ error, duplicate }: { error: any, duplicate?: { id: string, score: number, status: string } | null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState(error.aiSolution?.title || '');
    const [explanation, setExplanation] = useState(error.aiSolution?.explanation || '');
    const [rootCause, setRootCause] = useState(error.aiSolution?.rootCause || '');
    const [fixedCode, setFixedCode] = useState(error.aiSolution?.fixedCode || '');
    const [prevention, setPrevention] = useState(error.aiSolution?.prevention || '');
    const [status, setStatus] = useState(error.status);

    const handleSave = async (newStatus: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/errors/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: error._id,
                    title,
                    explanation,
                    rootCause,
                    fixedCode,
                    prevention,
                    status: newStatus
                })
            });

            if (res.ok) {
                setStatus(newStatus);
                if (newStatus === 'PUBLISHED') {
                    // Maybe show success toast
                }
                router.refresh();
                if (newStatus === 'PUBLISHED' || newStatus === 'REJECTED') {
                    router.push('/errors');
                }
            } else {
                alert('Failed to save');
            }
        } catch (e) {
            alert('Error saving');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">
                <div className="flex items-center gap-2">
                    <a
                        href={`https://google.com/search?q=${encodeURIComponent(error.rawError.substring(0, 100))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    >
                        <Search className="w-3 h-3" /> Research on Google
                    </a>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleSave('UNPUBLISHED')}
                        disabled={loading}
                        className="flex items-center gap-2 text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-slate-800 transition"
                    >
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                        onClick={() => handleSave('REJECTED')}
                        disabled={loading}
                        className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium px-3 py-1.5 rounded hover:bg-red-500/10 transition"
                    >
                        <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                        onClick={() => handleSave('PUBLISHED')}
                        disabled={loading}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-4 py-1.5 rounded transition shadow-lg shadow-green-900/20"
                    >
                        {loading ? 'Publishing...' : <><CheckCircle className="w-4 h-4" /> Publish</>}
                    </button>
                </div>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {duplicate && (
                    <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-md flex items-start gap-3">
                        <AlertOctagon className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-orange-300 font-bold text-sm">Potential Duplicate Detected ({duplicate.score.toFixed(1)}% Match)</h3>
                            <p className="text-orange-200/60 text-xs mt-1">
                                This error is very similar to <span className="font-mono text-orange-200">#{duplicate.id.slice(-6)}</span>
                                which is currently <strong>{duplicate.status}</strong>.
                            </p>
                            <Link href={`/errors/${duplicate.id}`} className="mt-2 text-xs font-bold text-orange-400 hover:text-orange-300 underline block">
                                Compare with existing error &rarr;
                            </Link>
                        </div>
                    </div>
                )}

                {/* SEO Title */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">SEO Title (H1)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-md px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g. How to fix 'Unexpected token' in JSON"
                    />
                    <p className="mt-1 text-xs text-slate-600">This will be the page URL slug.</p>
                </div>

                {/* Content Blocks */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Explanation</label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Root Cause</label>
                        <textarea
                            value={rootCause}
                            onChange={(e) => setRootCause(e.target.value)}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Corrected Code</label>
                        <textarea
                            value={fixedCode}
                            onChange={(e) => setFixedCode(e.target.value)}
                            rows={8}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-blue-300 font-mono text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Prevention Tips</label>
                        <textarea
                            value={prevention}
                            onChange={(e) => setPrevention(e.target.value)}
                            rows={2}
                            className="w-full bg-slate-950 border border-slate-800 rounded-md p-3 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
