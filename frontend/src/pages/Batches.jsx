import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBatches } from '@/api/batches';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatPercentage } from '@/utils/format';
import { UploadCloud, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
export const Batches = () => {
    const navigate = useNavigate();
    const { data: batches = [], isLoading } = useQuery({
        queryKey: ['batches'],
        queryFn: () => getBatches(),
    });
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (_jsxs(Badge, { variant: "success", children: [_jsx(CheckCircle2, { className: "w-3 h-3 mr-1" }), "Completed"] }));
            case 'processing':
                return (_jsxs(Badge, { variant: "accent", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Processing"] }));
            case 'queued':
                return (_jsxs(Badge, { variant: "neutral", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Queued"] }));
            case 'failed':
                return (_jsxs(Badge, { variant: "error", children: [_jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), "Failed"] }));
        }
    };
    const columns = [
        {
            id: 'filename',
            header: 'Batch Source File',
            accessorKey: 'filename',
            sortable: true,
            cell: (b) => (_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "font-semibold text-text-primary hover:text-accent transition-colors", children: b.filename }), _jsxs("span", { className: "text-label-sm text-text-secondary tabular-nums", children: ["ID: ", b.id] })] })),
        },
        {
            id: 'uploaded_at',
            header: 'Uploaded Date',
            accessorKey: 'uploaded_at',
            sortable: true,
            cell: (b) => (_jsx("span", { className: "tabular-nums text-text-secondary", children: formatDate(b.uploaded_at, true) })),
        },
        {
            id: 'total_rows',
            header: 'Records',
            accessorKey: 'total_rows',
            sortable: true,
            align: 'right',
            cell: (b) => (_jsx("span", { className: "font-semibold text-text-primary tabular-nums", children: b.total_rows })),
        },
        {
            id: 'status',
            header: 'Status',
            accessorKey: 'status',
            sortable: true,
            cell: (b) => getStatusBadge(b.status),
        },
        {
            id: 'auto_classified_pct',
            header: 'Auto Classified',
            accessorKey: 'auto_classified_pct',
            sortable: true,
            align: 'right',
            cell: (b) => (_jsxs("div", { className: "flex flex-col items-end", children: [_jsx("span", { className: "font-semibold text-success tabular-nums", children: formatPercentage(b.auto_classified_pct, 1) }), _jsxs("span", { className: "text-label-sm text-text-secondary tabular-nums", children: [b.auto_classified_count, " rows"] })] })),
        },
        {
            id: 'review_count',
            header: 'In Review Queue',
            accessorKey: 'review_count',
            sortable: true,
            align: 'right',
            cell: (b) => (_jsx("span", { className: `tabular-nums font-semibold ${b.review_count > 0 ? 'text-warning' : 'text-text-secondary'}`, children: b.review_count })),
        },
        {
            id: 'action',
            header: '',
            align: 'right',
            cell: (b) => (_jsx(Button, { variant: "ghost", size: "sm", rightIcon: _jsx(ArrowRight, { className: "w-3.5 h-3.5" }), onClick: (e) => {
                    e.stopPropagation();
                    navigate(`/batches/${b.id}`);
                }, children: "View Pipeline" })),
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-headline-xl text-text-primary", children: "Classification Batches" }), _jsx("p", { className: "text-body-md text-text-secondary mt-1", children: "Historical transaction batches, pipeline states, and automated classification ratios." })] }), _jsx(Link, { to: "/upload", children: _jsx(Button, { variant: "primary", leftIcon: _jsx(UploadCloud, { className: "w-4 h-4" }), children: "Upload New Batch" }) })] }), _jsx(DataTable, { data: batches, columns: columns, keyExtractor: (b) => b.id, isLoading: isLoading, onRowClick: (b) => navigate(`/batches/${b.id}`) })] }));
};
