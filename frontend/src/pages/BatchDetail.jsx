import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBatch, pollBatchProgress } from '@/api/batches';
import { getTransactions } from '@/api/transactions';
import { exportTransactions } from '@/api/exports';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { useToast } from '@/context/ToastContext';
import { formatPercentage } from '@/utils/format';
import { Clock, CheckCircle2, Download, ArrowRight, FileSpreadsheet, Sparkles, CheckSquare, } from 'lucide-react';
export const BatchDetail = () => {
    const { id } = useParams();
    const { success } = useToast();
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    // Poll batch status if still processing
    const { data: batch, isLoading } = useQuery({
        queryKey: ['batch', id],
        queryFn: async () => {
            if (!id)
                throw new Error('Missing batch ID');
            // If batch is processing, trigger next step in mock store
            const current = await getBatch(id);
            if (current.status === 'processing') {
                return await pollBatchProgress(id);
            }
            return current;
        },
        refetchInterval: (query) => {
            const data = query.state.data;
            return data?.status === 'processing' ? 1200 : false;
        },
    });
    // Fetch transactions for this batch once completed
    const { data: transactionsData } = useQuery({
        queryKey: ['batchTransactions', id],
        queryFn: () => getTransactions({ batch_id: id, limit: 100 }),
        enabled: !!id && batch?.status === 'completed',
    });
    // Timer for elapsed time
    useEffect(() => {
        if (batch?.status === 'processing') {
            const timer = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [batch?.status]);
    if (isLoading || !batch) {
        return (_jsx("div", { className: "p-8 text-center text-text-secondary", children: "Loading batch pipeline execution..." }));
    }
    const pipelineSteps = batch.pipeline_stages || [
        { id: '1', name: 'Validation & Cleaning', status: 'completed' },
        { id: '2', name: 'Evidence & Intent', status: 'completed' },
        { id: '3', name: 'ML Prediction', status: 'completed' },
        { id: '4', name: 'Qwen Reasoning', status: 'completed' },
        { id: '5', name: 'Fusion & Conflicts', status: 'completed' },
        { id: '6', name: 'Routing', status: 'completed' },
    ];
    const currentStep = batch.current_stage_index ?? pipelineSteps.length;
    const progressPct = batch.status === 'completed'
        ? 100
        : Math.round((currentStep / pipelineSteps.length) * 100);
    const handleExport = (format) => {
        if (transactionsData?.items) {
            exportTransactions(transactionsData.items, format, `batch_${batch.id}_classified`);
            success('Export initiated', `Downloading batch as ${format.toUpperCase()}`);
        }
    };
    return (_jsxs("div", { className: "space-y-6 max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Link, { to: "/batches", className: "text-body-sm text-text-secondary hover:text-text-primary transition-colors", children: "Batches" }), _jsx("span", { className: "text-text-secondary", children: "/" }), _jsx("span", { className: "text-body-sm font-semibold text-text-primary tabular-nums", children: batch.id })] }), _jsxs("h1", { className: "text-headline-lg font-semibold text-text-primary flex items-center gap-3", children: [_jsx("span", { children: batch.filename }), batch.status === 'completed' ? (_jsxs(Badge, { variant: "success", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1" }), " Completed"] })) : (_jsxs(Badge, { variant: "accent", children: [_jsx(Clock, { className: "w-3.5 h-3.5 mr-1" }), " Processing"] }))] })] }), _jsx("div", { className: "flex items-center gap-2.5", children: batch.status === 'completed' && (_jsxs(_Fragment, { children: [_jsx(Dropdown, { trigger: _jsx(Button, { variant: "secondary", leftIcon: _jsx(Download, { className: "w-4 h-4" }), children: "Export Classified Batch" }), items: [
                                        {
                                            id: 'xlsx',
                                            label: 'Export Excel (.xlsx)',
                                            icon: _jsx(FileSpreadsheet, { className: "w-4 h-4" }),
                                            onClick: () => handleExport('xlsx'),
                                        },
                                        {
                                            id: 'csv',
                                            label: 'Export CSV (.csv)',
                                            onClick: () => handleExport('csv'),
                                        },
                                        {
                                            id: 'json',
                                            label: 'Export Machine JSON',
                                            onClick: () => handleExport('json'),
                                        },
                                    ] }), _jsx(Link, { to: `/transactions?batch_id=${batch.id}`, children: _jsx(Button, { variant: "primary", rightIcon: _jsx(ArrowRight, { className: "w-4 h-4" }), children: "View All Records" }) })] })) })] }), _jsx(Card, { header: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-accent" }), _jsx("span", { children: "SmartLedger Pipeline Execution" })] }), _jsxs("div", { className: "flex items-center gap-3 text-label-sm tabular-nums text-text-secondary", children: [_jsxs("span", { children: ["Elapsed: ", elapsedSeconds, "s"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Total Records: ", batch.total_rows] })] })] }), children: _jsxs("div", { className: "space-y-6 py-2", children: [_jsx(Stepper, { steps: pipelineSteps, currentStepIndex: currentStep }), _jsxs("div", { className: "pt-4 border-t border-border", children: [_jsxs("div", { className: "flex items-center justify-between text-label-sm text-text-secondary mb-2", children: [_jsx("span", { children: batch.status === 'completed'
                                                ? 'All pipeline stages finished successfully'
                                                : `Executing Stage ${currentStep + 1} of ${pipelineSteps.length}: ${pipelineSteps[currentStep]?.name || 'Finalizing'}` }), _jsxs("span", { className: "tabular-nums font-semibold", children: [progressPct, "%"] })] }), _jsx(ProgressBar, { value: progressPct, variant: batch.status === 'completed' ? 'success' : 'accent' })] })] }) }), batch.status === 'completed' && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in-50 duration-200", children: [_jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase font-semibold", children: "Auto Classified" }), _jsxs("div", { className: "my-2", children: [_jsx("div", { className: "text-headline-md font-semibold text-success tabular-nums", children: formatPercentage(batch.auto_classified_pct, 1) }), _jsxs("p", { className: "text-body-sm text-text-secondary", children: [batch.auto_classified_count, " of ", batch.total_rows, " records"] })] }), _jsxs("div", { className: "text-label-sm text-success flex items-center gap-1 font-medium", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5" }), " High evidence consensus"] })] }), _jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase font-semibold", children: "Pending Human Review" }), _jsxs("div", { className: "my-2", children: [_jsx("div", { className: "text-headline-md font-semibold text-warning tabular-nums", children: batch.review_count }), _jsxs("p", { className: "text-body-sm text-text-secondary", children: [((batch.review_count / batch.total_rows) * 100).toFixed(1), "% of total"] })] }), _jsxs(Link, { to: `/review?batch_id=${batch.id}`, className: "text-label-sm text-warning hover:underline flex items-center gap-1 font-medium", children: [_jsx(CheckSquare, { className: "w-3.5 h-3.5" }), " Open review queue \u2192"] })] }), _jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase font-semibold", children: "Mean System Confidence" }), _jsxs("div", { className: "my-2", children: [_jsx("div", { className: "text-headline-md font-semibold text-text-primary tabular-nums", children: batch.average_confidence.toFixed(2) }), _jsx("p", { className: "text-body-sm text-text-secondary", children: "Across ML & Qwen fusion" })] }), _jsx("div", { className: "text-label-sm text-text-secondary", children: "Threshold set at 0.85" })] }), _jsxs(Card, { className: "p-4 flex flex-col justify-between", children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase font-semibold", children: "Average Data Quality" }), _jsxs("div", { className: "my-2", children: [_jsx(DataQualityBadge, { quality: batch.average_data_quality }), _jsx("p", { className: "text-body-sm text-text-secondary mt-1", children: "Completeness & tax signals" })] }), _jsx("div", { className: "text-label-sm text-text-secondary", children: "98% fields populated" })] })] })), batch.status === 'completed' && batch.voucher_distribution && (_jsx(Card, { header: "Voucher Category Breakdown in this Batch", children: _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3", children: Object.entries(batch.voucher_distribution).map(([vName, count]) => (_jsxs("div", { className: "p-3 rounded border border-border bg-surface-secondary/40 flex flex-col", children: [_jsx("span", { className: "text-label-sm text-text-secondary truncate", children: vName }), _jsx("span", { className: "text-headline-sm font-semibold text-text-primary tabular-nums mt-1", children: count }), _jsxs("span", { className: "text-label-sm text-text-secondary tabular-nums", children: [((count / batch.total_rows) * 100).toFixed(0), "%"] })] }, vName))) }) }))] }));
};
