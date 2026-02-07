import connectToDatabase from '@/lib/mongodb';
import ErrorModel from '@/lib/models/Error';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ReviewForm from '@/components/ReviewForm';

import { calculateSimilarity } from '@/lib/similarity';

async function getError(id: string) {
    try {
        await connectToDatabase();
        const error = await ErrorModel.findById(id).lean();
        if (!error) return null;
        return JSON.parse(JSON.stringify(error));
    } catch (e) {
        return null;
    }
}

async function findDuplicate(currentError: any) {
    try {
        // Fetch last 100 errors to compare (excluding self)
        const recentErrors = await ErrorModel.find({
            _id: { $ne: currentError._id }
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .select('rawError _id status') // Minimal fields
            .lean();

        let bestMatch = { id: '', score: 0, status: '' };

        for (const err of recentErrors) {
            const score = calculateSimilarity(currentError.rawError, (err as any).rawError);
            if (score > bestMatch.score) {
                bestMatch = {
                    id: (err as any)._id.toString(),
                    score,
                    status: (err as any).status
                };
            }
        }

        return bestMatch.score > 80 ? bestMatch : null;
    } catch (e) {
        return null;
    }
}

export default async function ErrorReviewPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const error = await getError(id);

    if (!error) {
        notFound();
    }

    const duplicate = await findDuplicate(error);

    if (!error) {
        notFound();
    }

    return (
        <div className="h-screen flex flex-col bg-slate-950">
            <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/errors" className="text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-sm font-bold text-white uppercase tracking-wider">
                        Review Error <span className="text-slate-500">#{id.slice(-6)}</span>
                    </h1>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${error.status === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' :
                        error.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                        {error.status}
                    </span>
                </div>
                <div className="text-xs text-slate-500">
                    Created {new Date(error.createdAt).toLocaleString()}
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex">
                {/* LEFT: Read-Only Original Error */}
                <div className="w-1/3 border-r border-slate-800 bg-slate-950 flex flex-col">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                        <h2 className="text-xs font-bold text-slate-400 uppercase">Original Error Log</h2>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        <pre className="text-xs font-mono text-red-300 bg-slate-900/50 p-4 rounded border border-red-500/10 whitespace-pre-wrap break-all">
                            {error.rawError}
                        </pre>
                    </div>
                </div>

                {/* RIGHT: Editable Form */}
                <div className="w-2/3 bg-slate-900 flex flex-col">
                    <ReviewForm error={error} duplicate={duplicate} />
                </div>
            </div>
        </div>
    );
}
