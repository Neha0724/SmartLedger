import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '@/api/transactions';
import { getBatches } from '@/api/batches';
import { getReviewQueue } from '@/api/review';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { SingleTestCase } from '@/components/domain/SingleTestCase';
import { formatINR, formatPercentage, formatDate } from '@/utils/format';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, PieChart, Pie, Cell, CartesianGrid, LabelList, } from 'recharts';
import { Receipt, CheckCircle2, AlertTriangle, Sparkles, ArrowRight, UploadCloud, Layers, CheckSquare, } from 'lucide-react';
export const Dashboard = () => {
    const navigate = useNavigate();
    const [hoveredOutcomeIndex, setHoveredOutcomeIndex] = useState(null);
    const { data: txData } = useQuery({
        queryKey: ['dashboardTransactions'],
        queryFn: () => getTransactions({ limit: 300 }),
    });
    const { data: batches = [] } = useQuery({
        queryKey: ['batches'],
        queryFn: () => getBatches(),
    });
    const { data: reviewItems = [] } = useQuery({
        queryKey: ['dashboardReviewQueue'],
        queryFn: () => getReviewQueue(),
    });
    const transactions = txData?.items || [];
    const totalProcessed = txData?.total || 0;
    // Compute metrics
    const autoClassifiedCount = transactions.filter((t) => t.status === 'auto_classified').length;
    const autoClassifiedPct = totalProcessed > 0 ? (autoClassifiedCount / totalProcessed) * 100 : 0;
    const pendingReviewCount = reviewItems.length;
    const avgConfidence = transactions.length > 0
        ? transactions.reduce((acc, t) => acc + t.confidence, 0) / transactions.length
        : 0;
    const lastBatch = batches[0];
    // Voucher distribution chart data (top categories) - sorted descending
    const voucherCounts = {};
    transactions.forEach((t) => {
        voucherCounts[t.voucher_type] = (voucherCounts[t.voucher_type] || 0) + 1;
    });
    const topVouchersData = Object.entries(voucherCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, count]) => ({
        name,
        count,
    }));
    // Outcome breakdown chart data per specifications:
    // Auto-Classified = var(--color-status-success)
    // Reviewed & Confirmed = var(--color-status-info)
    // Conflict Resolved = var(--chart-4) (violet)
    // Pending Review = var(--color-status-warning)
    const outcomeData = [
        {
            name: 'Auto-Classified',
            value: autoClassifiedCount,
            color: 'var(--color-status-success)',
        },
        {
            name: 'Reviewed & Confirmed',
            value: transactions.filter((t) => t.status === 'reviewed_confirmed').length,
            color: 'var(--color-status-info)',
        },
        {
            name: 'Conflict Resolved',
            value: transactions.filter((t) => t.status === 'conflict_resolved').length,
            color: 'var(--chart-4)',
        },
        {
            name: 'Pending Review',
            value: pendingReviewCount,
            color: 'var(--color-status-warning)',
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(SingleTestCase, {}), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-headline-xl text-text-primary", children: "Financial Intelligence Dashboard" }), _jsx("p", { className: "text-body-md text-text-secondary mt-1", children: "Automating confident accounting decisions and routing low-evidence records for human review." })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Link, { to: "/upload", children: _jsx(Button, { variant: "primary", leftIcon: _jsx(UploadCloud, { className: "w-4 h-4" }), children: "Upload Ledger" }) }), _jsx(Link, { to: "/review", children: _jsxs(Button, { variant: "secondary", leftIcon: _jsx(CheckSquare, { className: "w-4 h-4 text-warning" }), children: ["Review Queue (", pendingReviewCount, ")"] }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", children: [_jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between text-text-secondary", children: [_jsx("span", { className: "text-label-sm uppercase font-semibold", children: "Total Processed" }), _jsx(Receipt, { className: "w-4 h-4 text-accent" })] }), _jsxs("div", { className: "my-2", children: [_jsx("span", { className: "text-headline-lg font-semibold text-text-primary tabular-nums", children: totalProcessed }), _jsx("span", { className: "text-body-sm text-text-secondary ml-1.5", children: "records" })] }), _jsx("span", { className: "text-label-sm text-text-secondary tabular-nums", children: "Across 3 active batches" })] }), _jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between text-text-secondary", children: [_jsx("span", { className: "text-label-sm uppercase font-semibold", children: "Auto-Classified" }), _jsx(CheckCircle2, { className: "w-4 h-4 text-success" })] }), _jsx("div", { className: "my-2", children: _jsx("span", { className: "text-headline-lg font-semibold text-success tabular-nums", children: formatPercentage(autoClassifiedPct, 1) }) }), _jsxs("span", { className: "text-label-sm text-text-secondary", children: [autoClassifiedCount, " records automated"] })] }), _jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between text-text-secondary", children: [_jsx("span", { className: "text-label-sm uppercase font-semibold", children: "Pending Review" }), _jsx(AlertTriangle, { className: "w-4 h-4 text-warning" })] }), _jsxs("div", { className: "my-2", children: [_jsx("span", { className: "text-headline-lg font-semibold text-warning tabular-nums", children: pendingReviewCount }), _jsx("span", { className: "text-body-sm text-text-secondary ml-1.5", children: "flagged" })] }), _jsx(Link, { to: "/review", className: "text-label-sm text-warning hover:underline font-medium", children: "Open queue \u2192" })] }), _jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between text-text-secondary", children: [_jsx("span", { className: "text-label-sm uppercase font-semibold", children: "Mean Confidence" }), _jsx(Sparkles, { className: "w-4 h-4 text-accent" })] }), _jsx("div", { className: "my-2", children: _jsx("span", { className: "text-headline-lg font-semibold text-text-primary tabular-nums", children: avgConfidence.toFixed(2) }) }), _jsx("span", { className: "text-label-sm text-text-secondary", children: "System threshold: 0.85" })] }), _jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between text-text-secondary", children: [_jsx("span", { className: "text-label-sm uppercase font-semibold", children: "Last Batch Status" }), _jsx(Layers, { className: "w-4 h-4 text-accent" })] }), _jsxs("div", { className: "my-2", children: [_jsx("span", { className: "text-headline-sm font-semibold text-text-primary truncate block", title: lastBatch?.filename, children: lastBatch ? lastBatch.filename.replace('.xlsx', '').replace('.csv', '') : 'None' }), _jsxs("span", { className: "text-body-sm text-success font-medium flex items-center gap-1 mt-0.5", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " 100% Completed"] })] }), _jsxs("span", { className: "text-label-sm text-text-secondary tabular-nums", children: [lastBatch?.total_rows || 0, " rows processed"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [_jsx("div", { className: "lg:col-span-7", children: _jsx(Card, { title: "Transactions by Voucher Category", subtitle: "Top categories ordered descending by frequency", headerAction: _jsx("span", { className: "text-label-sm text-text-secondary tabular-nums font-medium bg-surface-secondary px-2.5 py-1 rounded border border-border", children: "Top 7 Classes" }), children: _jsx("div", { className: "h-80 w-full pt-1", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { layout: "vertical", data: topVouchersData, margin: { top: 10, right: 45, left: 10, bottom: 10 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", horizontal: false, vertical: true, stroke: "var(--color-border)", opacity: 0.6 }), _jsx(XAxis, { type: "number", stroke: "var(--color-text-secondary)", fontSize: 11, tickLine: false, axisLine: false }), _jsx(YAxis, { type: "category", dataKey: "name", width: 150, stroke: "var(--color-text-secondary)", fontSize: 12, tickLine: false, axisLine: false }), _jsx(RechartsTooltip, { cursor: { fill: 'var(--color-accent-subtle)', opacity: 0.35 }, content: ({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const item = payload[0].payload;
                                                        const share = totalProcessed > 0
                                                            ? ((item.count / totalProcessed) * 100).toFixed(1)
                                                            : 0;
                                                        return (_jsxs("div", { className: "bg-card border border-border shadow-dropdown rounded p-2.5 text-body-sm", children: [_jsx("p", { className: "font-semibold text-text-primary mb-1", children: item.name }), _jsxs("p", { className: "text-text-secondary", children: ["Count:", ' ', _jsx("strong", { className: "text-text-primary tabular-nums", children: item.count })] }), _jsxs("p", { className: "text-text-secondary", children: ["Share of total:", ' ', _jsxs("strong", { className: "text-accent tabular-nums", children: [share, "%"] })] })] }));
                                                    }
                                                    return null;
                                                } }), _jsx(Bar, { dataKey: "count", fill: "var(--chart-1)", barSize: 20, radius: [0, 4, 4, 0], className: "transition-colors hover:brightness-90", children: _jsx(LabelList, { dataKey: "count", position: "right", className: "tabular-nums font-semibold", fill: "var(--color-text-primary)", fontSize: 11, offset: 10 }) })] }) }) }) }) }), _jsx("div", { className: "lg:col-span-5", children: _jsxs(Card, { title: "Routing Outcome Breakdown", subtitle: "Automated consensus vs human review distribution", children: [_jsxs("div", { className: "relative h-56 w-full flex items-center justify-center", children: [_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsx(Pie, { data: outcomeData, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", innerRadius: 65, outerRadius: 88, paddingAngle: 2, cornerRadius: 3, children: outcomeData.map((entry, index) => (_jsx(Cell, { fill: entry.color, opacity: hoveredOutcomeIndex === null || hoveredOutcomeIndex === index
                                                                ? 1
                                                                : 0.35, stroke: "transparent" }, `cell-${index}`))) }), _jsx(RechartsTooltip, { content: ({ active, payload }) => {
                                                            if (active && payload && payload.length) {
                                                                const item = payload[0];
                                                                const pct = totalProcessed > 0
                                                                    ? ((item.value / totalProcessed) * 100).toFixed(1)
                                                                    : 0;
                                                                return (_jsxs("div", { className: "bg-card border border-border shadow-dropdown rounded p-2 text-body-sm", children: [_jsx("span", { className: "font-semibold text-text-primary block", children: item.name }), _jsxs("span", { className: "text-text-secondary tabular-nums", children: [item.value, " records (", pct, "%)"] })] }));
                                                            }
                                                            return null;
                                                        } })] }) }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none", children: [_jsx("span", { className: "text-headline-lg font-bold text-text-primary tabular-nums leading-none", children: totalProcessed }), _jsx("span", { className: "text-label-sm font-semibold uppercase tracking-wider text-text-secondary mt-1", children: "Total" })] })] }), _jsx("div", { className: "flex flex-col gap-1.5 mt-2 pt-3 border-t border-border", children: outcomeData.map((item, idx) => {
                                        const pct = totalProcessed > 0
                                            ? ((item.value / totalProcessed) * 100).toFixed(1)
                                            : '0';
                                        const isHovered = hoveredOutcomeIndex === idx;
                                        return (_jsxs("div", { onMouseEnter: () => setHoveredOutcomeIndex(idx), onMouseLeave: () => setHoveredOutcomeIndex(null), className: `flex items-center justify-between px-2.5 py-1.5 rounded transition-colors cursor-pointer select-none ${isHovered ? 'bg-surface-secondary' : 'hover:bg-surface-secondary/50'}`, children: [_jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [_jsx("span", { className: "w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform", style: {
                                                                backgroundColor: item.color,
                                                                transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                                                            } }), _jsx("span", { className: "text-body-sm text-text-primary font-medium truncate", children: item.name })] }), _jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [_jsx("span", { className: "font-semibold text-text-primary tabular-nums text-body-sm", children: item.value }), _jsxs("span", { className: "text-body-sm text-text-secondary tabular-nums w-12 text-right", children: [pct, "%"] })] })] }, item.name));
                                    }) })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [_jsx("div", { className: "lg:col-span-7", children: _jsx(Card, { title: "Recent Classification Batches", subtitle: "Recently uploaded spreadsheets and completion status", headerAction: _jsx(Link, { to: "/batches", className: "text-label-sm text-accent hover:underline font-medium", children: "View all \u2192" }), noPadding: true, children: _jsx("div", { className: "divide-y divide-border", children: batches.slice(0, 3).map((b) => (_jsxs("div", { onClick: () => navigate(`/batches/${b.id}`), className: "p-3.5 flex items-center justify-between hover:bg-surface-secondary/40 transition-colors cursor-pointer", children: [_jsxs("div", { className: "space-y-0.5", children: [_jsx("span", { className: "text-body-md font-semibold text-text-primary block hover:text-accent", children: b.filename }), _jsxs("span", { className: "text-label-sm text-text-secondary tabular-nums", children: [formatDate(b.uploaded_at, true), " \u2022 ", b.total_rows, " records"] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-body-sm font-semibold text-success tabular-nums block", children: formatPercentage(b.auto_classified_pct, 1) }), _jsx("span", { className: "text-label-sm text-text-secondary", children: "automated" })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-text-secondary" })] })] }, b.id))) }) }) }), _jsx("div", { className: "lg:col-span-5", children: _jsx(Card, { header: _jsxs("div", { className: "flex items-center justify-between w-full text-warning font-semibold", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-warning" }), _jsx("span", { children: "Needs Your Attention" })] }), _jsx(Badge, { variant: "warning", pill: true, children: pendingReviewCount })] }), className: "border-warning/30", children: _jsxs("div", { className: "space-y-3", children: [_jsx("p", { className: "text-body-sm text-text-secondary", children: "These transactions lack sufficient party or goods signals and require an accountant's confirmation or correction before general ledger posting." }), _jsx("div", { className: "space-y-2", children: reviewItems.slice(0, 3).map((item) => (_jsxs("div", { onClick: () => navigate(`/transactions/${item.id}`), className: "p-2.5 rounded border border-border bg-surface-secondary/50 hover:bg-surface-secondary transition-colors cursor-pointer flex items-center justify-between gap-3", children: [_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-text-primary tabular-nums text-body-sm", children: item.invoice_number }), _jsx(VoucherChip, { voucher: item.voucher_type, size: "sm" })] }), _jsx("p", { className: "text-label-sm text-text-secondary truncate mt-0.5", children: item.party })] }), _jsxs("div", { className: "text-right shrink-0", children: [_jsx("span", { className: "font-semibold text-text-primary tabular-nums text-body-sm block", children: formatINR(item.amount) }), _jsx(ConfidenceIndicator, { confidence: item.confidence, level: item.confidence_level, showBar: false })] })] }, item.id))) }), _jsx("div", { className: "pt-2", children: _jsx(Link, { to: "/review", children: _jsx(Button, { variant: "primary", className: "w-full", rightIcon: _jsx(ArrowRight, { className: "w-4 h-4" }), children: "Enter Review Queue" }) }) })] }) }) })] })] }));
};
