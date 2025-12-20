export const dynamic = 'force-dynamic';

import { pipelineClient } from '@/lib/pipeline-client';
import { ArrowUpRight, MessageCircle, MoreHorizontal, ShoppingCart, RefreshCw, Smartphone } from 'lucide-react';
import Link from 'next/link';

// --- Server Data Fetching ---
async function getAnalyticsData() {
    // 1. Total Counts by Channel
    const { data: counts, error: countErr } = await pipelineClient
        .from('analytics_events')
        .select('channel, event_type');

    if (countErr) {
        console.error("Analytics Fetch Error:", countErr);
        return { total: 0, whatsapp: 0, sms: 0, feed: [] };
    }

    const whatsapp = counts.filter(c => c.channel === 'whatsapp').length;
    const sms = counts.filter(c => c.channel === 'sms').length;
    const total = whatsapp + sms; // Simplified for now

    // 2. Latest Feed (Last 15)
    const { data: feed } = await pipelineClient
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

    return { total, whatsapp, sms, feed: feed || [] };
}

// --- Components ---

function StatCard({ title, value, sub, icon: Icon, colorClass }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                {sub && <p className={`text-sm mt-1 ${colorClass}`}>{sub}</p>}
            </div>
            <div className={`p-3 rounded-xl ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
        </div>
    );
}

function FeedItem({ item }) {
    const isWhatsapp = item.channel === 'whatsapp';
    const date = new Date(item.created_at).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', month: 'short', day: 'numeric' });
    const sku = item.metadata?.sku || 'Unknown SKU';

    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWhatsapp ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                    {isWhatsapp ? <MessageCircle size={20} /> : <Smartphone size={20} />}
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                        {isWhatsapp ? 'WhatsApp Order' : 'SMS Inquiry'}
                    </h4>
                    <p className="text-xs text-gray-500 font-mono">{item.entity_id}</p>
                </div>
            </div>
            <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-1">
                    {sku}
                </span>
                <p className="text-xs text-gray-400">{date}</p>
            </div>
        </div>
    );
}

// --- Main Page ---
export default async function AnalyticsPage() {
    const data = await getAnalyticsData();

    // Calculate Percentages for Bar
    const total = data.total || 1;
    const waPercent = Math.round((data.whatsapp / total) * 100);
    const smsPercent = Math.round((data.sms / total) * 100);

    return (
        <div className="min-h-screen bg-gray-50/50 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
                        <p className="text-gray-500 mt-1">Real-time monitoring of marketplace conversions.</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Simple refresh via link replacement (cheap auto-refresh) */}
                        <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all" title="Refresh Data">
                            <RefreshCw size={20} />
                        </Link>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Conversions"
                        value={data.total}
                        sub="+100% vs yesterday" // Mock metric for now
                        icon={ShoppingCart}
                        colorClass="text-indigo-600"
                    />
                    <StatCard
                        title="WhatsApp Leads"
                        value={data.whatsapp}
                        sub={`${waPercent}% of traffic`}
                        icon={MessageCircle}
                        colorClass="text-green-600"
                    />
                    <StatCard
                        title="SMS Leads"
                        value={data.sms}
                        sub={`${smsPercent}% of traffic`}
                        icon={Smartphone}
                        colorClass="text-blue-600"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Visual Chart Area */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Channel Distribution</h2>
                            <MoreHorizontal className="text-gray-400" size={20} />
                        </div>

                        {/* Custom CSS Bar Chart */}
                        <div className="space-y-6">

                            {/* WhatsApp Bar */}
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="flex items-center gap-2 text-gray-700">
                                        <MessageCircle size={16} className="text-green-500" /> WhatsApp
                                    </span>
                                    <span className="text-gray-900">{data.whatsapp} ({waPercent}%)</span>
                                </div>
                                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div style={{ width: `${waPercent}%` }} className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-sm transition-all duration-1000 ease-out"></div>
                                </div>
                            </div>

                            {/* SMS Bar */}
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="flex items-center gap-2 text-gray-700">
                                        <Smartphone size={16} className="text-blue-500" /> SMS
                                    </span>
                                    <span className="text-gray-900">{data.sms} ({smsPercent}%)</span>
                                </div>
                                <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div style={{ width: `${smsPercent}%` }} className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-sm transition-all duration-1000 ease-out"></div>
                                </div>
                            </div>

                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Insight</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                WhatsApp is performing significantly better than SMS, accounting for <strong className="text-gray-900">{waPercent}%</strong> of all conversion clicks.
                                Consider optimizing the WhatsApp message copy to further increase granular conversion.
                            </p>
                        </div>
                    </div>

                    {/* Live Feed */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                Live Activity
                            </h2>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {data.feed.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">No activity recorded yet.</div>
                            ) : (
                                data.feed.map(item => (
                                    <FeedItem key={item.id} item={item} />
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 text-center">
                            <Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1">
                                View Full History <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
