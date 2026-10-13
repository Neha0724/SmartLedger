import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, bulkReviewTransactions } from '@/api/transactions';
import { getBatches } from '@/api/batches';
import { exportTransactions } from '@/api/exports';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { VoucherSelect } from '@/components/domain/VoucherSelect';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Dropdown } from '@/components/ui/Dropdown';
import { useToast } from '@/context/ToastContext';
import { formatINR, formatDate } from '@/utils/format';
import { Search, Filter, Download, CheckSquare, X, FileSpreadsheet, FileText, FileCode, } from 'lucide-react';
export const Transactions = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();
    // URL sync state
    const search = searchParams.get('search') || '';
    const batchId = searchParams.get('batch_id') || '';
    const status = searchParams.get('status') || '';
    const confidenceLevel = searchParams.get('confidence_level') || '';
    const dataQuality = searchParams.get('data_quality') || '';
    const voucherType = searchParams.getAll('voucher_type');
    const [selectedIds, setSelectedIds] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    // Queries
    const { data: batches = [] } = useQuery({
        queryKey: ['batches'],
        queryFn: () => getBatches(),
    });
    const { data, isLoading } = useQuery({
        queryKey: [
            'transactions',
            batchId,
            status,
            confidenceLevel,
            dataQuality,
            voucherType,
            search,
        ],
        queryFn: () => getTransactions({
            batch_id: batchId || undefined,
            status: status || undefined,
            confidence_level: confidenceLevel || undefined,
            data_quality: dataQuality || undefined,
            voucher_type: voucherType.length > 0 ? voucherType : undefined,
            search: search || undefined,
            limit: 500, // Client paginate with memoization or backend pagination
        }),
    });
    const transactions = data?.items || [];
    // Filter setters syncing to URL
    const updateParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value) {
            next.delete(key);
        }
        else {
            next.set(key, value);
        }
        setSearchParams(next, { replace: true });
    };
    const handleVoucherFilterChange = (category) => {
        const next = new URLSearchParams(searchParams);
        const existing = next.getAll('voucher_type');
        if (!existing.includes(category)) {
            next.append('voucher_type', category);
        }
        setSearchParams(next, { replace: true });
    };
    const removeVoucherFilter = (category) => {
        const next = new URLSearchParams(searchParams);
        const updated = next.getAll('voucher_type').filter((v) => v !== category);
        next.delete('voucher_type');
        updated.forEach((v) => next.append('voucher_type', v));
        setSearchParams(next, { replace: true });
    };
    const clearAllFilters = () => {
        setSearchParams(new URLSearchParams(), { replace: true });
    };
    // Bulk actions
    const bulkMutation = useMutation({
        mutationFn: (action) => bulkReviewTransactions(selectedIds, action),
        onSuccess: () => {
            success('Bulk action completed', `Updated ${selectedIds.length} transactions.`);
            setSelectedIds([]);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['reviewQueueCount'] });
        },
        onError: (err) => {
            toastError('Bulk action failed', err.message);
        },
    });
    const handleExport = (format) => {
        const toExport = selectedIds.length > 0
            ? transactions.filter((t) => selectedIds.includes(t.id))
            : transactions;
        if (toExport.length === 0) {
            toastError('Nothing to export', 'No transactions found.');
            return;
        }
        exportTransactions(toExport, format, 'transactions_export');
        success('Export generated', `Exported ${toExport.length} transactions as ${format.toUpperCase()}.`);
    };
    const columns = [
        {
            id: 'invoice_number',
            header: 'Invoice / ID',
            accessorKey: 'invoice_number',
            sortable: true,
            minWidth: '140px',
            cell: (t) => (_jsx("span", { className: "font-semibold text-text-primary tabular-nums hover:text-accent transition-colors", children: t.invoice_number })),
        },
        {
            id: 'date',
            header: 'Date',
            accessorKey: 'date',
            sortable: true,
            minWidth: '110px',
            cell: (t) => (_jsx("span", { className: "text-text-secondary tabular-nums text-body-sm", children: formatDate(t.date) })),
        },
        {
            id: 'party',
            header: 'Party / Counterparty',
            accessorKey: 'party',
            sortable: true,
            minWidth: '180px',
            cell: (t) => (_jsx("span", { className: "font-medium text-text-primary truncate block max-w-xs", title: t.party, children: t.party })),
        },
        {
            id: 'amount',
            header: 'Amount (INR)',
            accessorKey: 'amount',
            sortable: true,
            align: 'right',
            minWidth: '120px',
            cell: (t) => (_jsx("span", { className: "font-semibold tabular-nums text-text-primary", children: formatINR(t.amount) })),
        },
        {
            id: 'voucher_type',
            header: 'Predicted Voucher',
            accessorKey: 'voucher_type',
            sortable: true,
            minWidth: '150px',
            cell: (t) => _jsx(VoucherChip, { voucher: t.voucher_type, size: "sm" }),
        },
        {
            id: 'confidence',
            header: 'Confidence',
            accessorKey: 'confidence',
            sortable: true,
            minWidth: '120px',
            cell: (t) => (_jsx(ConfidenceIndicator, { confidence: t.confidence, level: t.confidence_level, showBar: false })),
        },
        {
            id: 'data_quality',
            header: 'Data Quality',
            accessorKey: 'data_quality',
            sortable: true,
            minWidth: '120px',
            cell: (t) => _jsx(DataQualityBadge, { quality: t.data_quality }),
        },
        {
            id: 'status',
            header: 'Routing Status',
            accessorKey: 'status',
            sortable: true,
            minWidth: '150px',
            cell: (t) => _jsx(StatusBadge, { status: t.status, showIcon: false }),
        },
    ];
    const hasActiveFilters = !!batchId || !!status || !!confidenceLevel || !!dataQuality || voucherType.length > 0 || !!search;
    return (_jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-headline-xl text-text-primary", children: "Transaction Results" }), _jsx("p", { className: "text-body-md text-text-secondary mt-1", children: "Complete classified financial ledger with confidence scoring, evidence intent, and routing states." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [selectedIds.length > 0 && (_jsxs(Button, { variant: "secondary", size: "sm", leftIcon: _jsx(CheckSquare, { className: "w-4 h-4 text-warning" }), onClick: () => bulkMutation.mutate('send_to_review'), isLoading: bulkMutation.isPending, children: ["Route Selected to Review (", selectedIds.length, ")"] })), _jsx(Dropdown, { trigger: _jsxs(Button, { variant: "secondary", leftIcon: _jsx(Download, { className: "w-4 h-4" }), children: ["Export ", selectedIds.length > 0 ? `(${selectedIds.length})` : 'All'] }), items: [
                                    {
                                        id: 'xlsx',
                                        label: 'Export Excel (.xlsx)',
                                        icon: _jsx(FileSpreadsheet, { className: "w-4 h-4" }),
                                        onClick: () => handleExport('xlsx'),
                                    },
                                    {
                                        id: 'csv',
                                        label: 'Export CSV (.csv)',
                                        icon: _jsx(FileText, { className: "w-4 h-4" }),
                                        onClick: () => handleExport('csv'),
                                    },
                                    {
                                        id: 'json',
                                        label: 'Export JSON',
                                        icon: _jsx(FileCode, { className: "w-4 h-4" }),
                                        onClick: () => handleExport('json'),
                                    },
                                ] })] })] }), _jsxs("div", { className: "bg-card p-3 rounded border border-border space-y-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "relative flex-1 min-w-[240px] max-w-md", children: [_jsx(Search, { className: "w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Filter by invoice, party, or amount...", value: search, onChange: (e) => updateParam('search', e.target.value), className: "w-full h-9 pl-9 pr-3 text-body-sm bg-surface-secondary rounded border border-border text-text-primary focus:outline-none focus:border-accent" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: showFilters ? 'primary' : 'secondary', size: "sm", leftIcon: _jsx(Filter, { className: "w-4 h-4" }), onClick: () => setShowFilters(!showFilters), children: showFilters ? 'Hide Filters' : 'Advanced Filters' }), hasActiveFilters && (_jsx(Button, { variant: "ghost", size: "sm", onClick: clearAllFilters, children: "Clear All" }))] })] }), showFilters && (_jsxs("div", { className: "pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in-50 duration-150", children: [_jsxs("div", { children: [_jsx("label", { className: "text-label-sm font-medium text-text-secondary block mb-1", children: "Batch" }), _jsxs(Select, { sizeVariant: "compact", value: batchId, onChange: (e) => updateParam('batch_id', e.target.value || null), children: [_jsx("option", { value: "", children: "All Batches" }), batches.map((b) => (_jsx("option", { value: b.id, children: b.filename }, b.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-label-sm font-medium text-text-secondary block mb-1", children: "Status" }), _jsxs(Select, { sizeVariant: "compact", value: status, onChange: (e) => updateParam('status', e.target.value || null), children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "auto_classified", children: "Auto Classified" }), _jsx("option", { value: "needs_review", children: "Needs Review" }), _jsx("option", { value: "conflict_resolved", children: "Conflict Resolved" }), _jsx("option", { value: "reviewed_confirmed", children: "Reviewed (Confirmed)" }), _jsx("option", { value: "reviewed_corrected", children: "Reviewed (Corrected)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-label-sm font-medium text-text-secondary block mb-1", children: "Confidence" }), _jsxs(Select, { sizeVariant: "compact", value: confidenceLevel, onChange: (e) => updateParam('confidence_level', e.target.value || null), children: [_jsx("option", { value: "", children: "All Confidence Levels" }), _jsx("option", { value: "High", children: "High (\u2265 0.85)" }), _jsx("option", { value: "Medium", children: "Medium (0.65 \u2013 0.84)" }), _jsx("option", { value: "Low", children: "Low (< 0.65)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-label-sm font-medium text-text-secondary block mb-1", children: "Data Quality" }), _jsxs(Select, { sizeVariant: "compact", value: dataQuality, onChange: (e) => updateParam('data_quality', e.target.value || null), children: [_jsx("option", { value: "", children: "All Quality Tiers" }), _jsx("option", { value: "High", children: "High Quality" }), _jsx("option", { value: "Medium", children: "Medium Quality" }), _jsx("option", { value: "Low", children: "Low Quality" })] })] }), _jsxs("div", { className: "sm:col-span-2 md:col-span-4", children: [_jsx("label", { className: "text-label-sm font-medium text-text-secondary block mb-1", children: "Filter by Voucher Categories (Multi-select across 27)" }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("div", { className: "w-72", children: _jsx(VoucherSelect, { value: "", placeholder: "Add voucher category filter...", onChange: (cat) => handleVoucherFilterChange(cat) }) }), voucherType.map((v) => (_jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent-subtle text-accent text-body-sm font-medium border border-accent/20", children: [_jsx("span", { children: v }), _jsx("button", { onClick: () => removeVoucherFilter(v), className: "hover:text-error", "aria-label": `Remove filter ${v}`, children: _jsx(X, { className: "w-3.5 h-3.5" }) })] }, v)))] })] })] }))] }), _jsx(DataTable, { data: transactions, columns: columns, keyExtractor: (t) => t.id, isLoading: isLoading, selectable: true, selectedIds: selectedIds, onSelectionChange: setSelectedIds, onRowClick: (t) => navigate(`/transactions/${t.id}`) })] }));
};
