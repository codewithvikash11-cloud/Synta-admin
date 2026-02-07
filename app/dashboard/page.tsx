import connectToDatabase from '@/lib/mongodb';
import ErrorModel from '@/lib/models/Error';
import Link from 'next/link';
import {
    Activity,
    CheckCircle,
    Clock,
    FileText,
    AlertTriangle
} from 'lucide-react';

async function getStats() {
    await connectToDatabase();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
        totalErrors,
        pendingErrors,
        publishedErrors,
        todayErrors,
        recentActivity
    ] = await Promise.all([
        ErrorModel.countDocuments(),
        ErrorModel.countDocuments({ status: 'UNPUBLISHED' }),
        ErrorModel.countDocuments({ status: 'PUBLISHED' }),
        ErrorModel.countDocuments({ createdAt: { $gte: todayStart } }),
        ErrorModel.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    return {
        totalErrors,
        pendingErrors,
        publishedErrors,
        todayErrors,
        recentActivity: JSON.parse(JSON.stringify(recentActivity))
    };
}

export default async function DashboardPage() {
    const stats = await getStats();

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
                <Link
                    href="/errors"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors"
                >
                    View Queue
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatsCard
                    title="Submitted Today"
                    value={stats.todayErrors}
                    icon={<Clock className="text-blue-500" />}
                />
                <StatsCard
                    title="Pending Review"
                    value={stats.pendingErrors}
                    icon={<AlertTriangle className="text-yellow-500" />}
                />
                <StatsCard
                    title="Published"
                    value={stats.publishedErrors}
                    icon={<CheckCircle className="text-green-500" />}
                />
                <StatsCard
                    title="Total Errors"
                    value={stats.totalErrors}
                    icon={<FileText className="text-slate-500" />}
                />
            </div>

            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                Recent Activity
            </h2>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/50 text-slate-400 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium">Error Preview</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Date</th>
                            <th className="p-4 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                        {stats.recentActivity.map((err: any) => (
                            <tr key={err._id} className="hover:bg-slate-800/50 transition">
                                <td className="p-4 font-mono truncate max-w-md text-xs">
                                    {err.rawError.substring(0, 80)}...
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={err.status} />
                                </td>
                                <td className="p-4 text-slate-500">
                                    {new Date(err.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/errors/${err._id}`}
                                        className="text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        Review
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {stats.recentActivity.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">No activity yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon }: any) {
    return (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg flex items-start justify-between">
            <div>
                <p className="text-slate-400 text-sm mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
            <div className="p-3 bg-slate-800 rounded-md">
                {icon}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        PUBLISHED: 'bg-green-500/10 text-green-400 border-green-500/20',
        UNPUBLISHED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
    } as const;

    const style = styles[status as keyof typeof styles] || styles.UNPUBLISHED;

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style}`}>
            {status}
        </span>
    );
}
