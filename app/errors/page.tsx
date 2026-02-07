import connectToDatabase from '@/lib/mongodb';
import ErrorModel from '@/lib/models/Error';
import Link from 'next/link';
import { BadgeAlert, Search, AlertCircle, ArrowUpDown } from 'lucide-react';

async function getErrors(status = 'UNPUBLISHED') {
    await connectToDatabase();
    const errors = await ErrorModel.find({ status })
        .sort({ createdAt: -1 })
        .limit(50) // Pagination limit
        .lean();

    return JSON.parse(JSON.stringify(errors));
}

export default async function ErrorsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const { status = 'UNPUBLISHED' } = await searchParams;
    const errors = await getErrors(status);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Error Queue</h1>
                    <p className="text-slate-400">Manage and review submitted errors</p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href="/errors?status=UNPUBLISHED"
                        className={`px-4 py-2 rounded text-sm font-medium ${status === 'UNPUBLISHED' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                        Pending
                    </Link>
                    <Link
                        href="/errors?status=PUBLISHED"
                        className={`px-4 py-2 rounded text-sm font-medium ${status === 'PUBLISHED' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                        Published
                    </Link>
                    <Link
                        href="/errors?status=REJECTED"
                        className={`px-4 py-2 rounded text-sm font-medium ${status === 'REJECTED' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                        Rejected
                    </Link>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium w-24">Language</th>
                            <th className="p-4 font-medium">Error Preview</th>
                            <th className="p-4 font-medium w-40">Date</th>
                            <th className="p-4 font-medium text-right w-24">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                        {errors.map((err: any) => (
                            <tr key={err._id} className="hover:bg-slate-800/50 transition">
                                <td className="p-4">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs uppercase font-mono text-slate-400">
                                        {err.language || 'text'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="font-mono text-xs text-slate-300 line-clamp-2">
                                        {err.rawError}
                                    </div>
                                    {err.aiSolution?.title && (
                                        <div className="mt-1 text-slate-500 text-xs">
                                            {err.aiSolution.title}
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-slate-500">
                                    {new Date(err.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/errors/${err._id}`}
                                        className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                                    >
                                        Review
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {errors.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                        <p>No errors found in this category.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
