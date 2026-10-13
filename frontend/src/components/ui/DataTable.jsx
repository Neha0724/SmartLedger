import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { cn } from '@/utils/cn';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from './Checkbox';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
export function DataTable({ data, columns, keyExtractor, isLoading = false, emptyTitle = 'No transactions found', emptyDescription = 'There are no records matching your current filter criteria.', onRowClick, selectable = false, selectedIds = [], onSelectionChange, pageSize = 15, showPagination = true, stickyHeader = false, className, }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(pageSize);
    // Sorting
    const sortedData = useMemo(() => {
        if (!sortKey)
            return data;
        const col = columns.find((c) => c.id === sortKey);
        if (!col || !col.accessorKey)
            return data;
        return [...data].sort((a, b) => {
            const aVal = a[col.accessorKey];
            const bVal = b[col.accessorKey];
            if (aVal === bVal)
                return 0;
            if (aVal === null || aVal === undefined)
                return 1;
            if (bVal === null || bVal === undefined)
                return -1;
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            const strA = String(aVal).toLowerCase();
            const strB = String(bVal).toLowerCase();
            if (strA < strB)
                return sortDir === 'asc' ? -1 : 1;
            if (strA > strB)
                return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortKey, sortDir, columns]);
    // Pagination
    const totalPages = Math.ceil(sortedData.length / perPage) || 1;
    const paginatedData = useMemo(() => {
        if (!showPagination)
            return sortedData;
        const start = (currentPage - 1) * perPage;
        return sortedData.slice(start, start + perPage);
    }, [sortedData, currentPage, perPage, showPagination]);
    const handleSort = (colId, sortable) => {
        if (!sortable)
            return;
        if (sortKey === colId) {
            if (sortDir === 'asc') {
                setSortDir('desc');
            }
            else {
                setSortKey(null);
            }
        }
        else {
            setSortKey(colId);
            setSortDir('asc');
        }
    };
    const isAllCurrentSelected = paginatedData.length > 0 &&
        paginatedData.every((row) => selectedIds.includes(keyExtractor(row)));
    const handleSelectAllCurrent = (checked) => {
        if (!onSelectionChange)
            return;
        const currentPageIds = paginatedData.map(keyExtractor);
        if (checked) {
            const combined = Array.from(new Set([...selectedIds, ...currentPageIds]));
            onSelectionChange(combined);
        }
        else {
            const filtered = selectedIds.filter((id) => !currentPageIds.includes(id));
            onSelectionChange(filtered);
        }
    };
    const handleSelectRow = (id, checked) => {
        if (!onSelectionChange)
            return;
        if (checked) {
            onSelectionChange([...selectedIds, id]);
        }
        else {
            onSelectionChange(selectedIds.filter((item) => item !== id));
        }
    };
    return (_jsxs("div", { className: cn('w-full flex flex-col rounded border border-border bg-card overflow-hidden', className), children: [_jsx("div", { className: "overflow-x-auto w-full", children: _jsxs("table", { className: "w-full text-left border-collapse border-spacing-0", children: [_jsx("thead", { className: cn('bg-surface-secondary text-text-secondary border-b border-border select-none', stickyHeader && 'sticky top-0 z-20 shadow-sm'), children: _jsxs("tr", { children: [selectable && (_jsx("th", { className: "w-10 px-4 py-3 text-center border-b border-border", children: _jsx(Checkbox, { checked: isAllCurrentSelected, onChange: (e) => handleSelectAllCurrent(e.target.checked), "aria-label": "Select all rows on current page" }) })), columns.map((col) => {
                                        const isSorted = sortKey === col.id;
                                        return (_jsx("th", { onClick: () => handleSort(col.id, col.sortable), style: { width: col.width, minWidth: col.minWidth }, className: cn('px-4 py-3 text-label-md font-medium border-b border-border transition-colors', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center', col.sortable && 'cursor-pointer hover:text-text-primary group'), children: _jsxs("div", { className: cn('inline-flex items-center gap-1.5', col.align === 'right' && 'justify-end w-full', col.align === 'center' && 'justify-center w-full'), children: [_jsx("span", { children: col.header }), col.sortable && (_jsx("span", { className: "shrink-0 text-text-secondary/60 group-hover:text-text-primary", children: isSorted ? (sortDir === 'asc' ? (_jsx(ChevronUp, { className: "w-3.5 h-3.5 text-accent" })) : (_jsx(ChevronDown, { className: "w-3.5 h-3.5 text-accent" }))) : (_jsx(ChevronsUpDown, { className: "w-3.5 h-3.5 opacity-40 group-hover:opacity-80" })) }))] }) }, col.id));
                                    })] }) }), _jsx("tbody", { className: "divide-y divide-border bg-card", children: isLoading ? (Array.from({ length: 6 }).map((_, rIdx) => (_jsxs("tr", { children: [selectable && (_jsx("td", { className: "px-4 py-3 text-center", children: _jsx(Skeleton, { className: "w-4 h-4 mx-auto" }) })), columns.map((col) => (_jsx("td", { className: "px-4 py-3", children: _jsx(Skeleton, { className: "h-4 w-3/4" }) }, `skel-${rIdx}-${col.id}`)))] }, `skel-${rIdx}`)))) : paginatedData.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: columns.length + (selectable ? 1 : 0), className: "px-4 py-12 text-center", children: _jsx(EmptyState, { title: emptyTitle, description: emptyDescription }) }) })) : (paginatedData.map((row, rIdx) => {
                                const rowKey = keyExtractor(row);
                                const isSelected = selectedIds.includes(rowKey);
                                return (_jsxs("tr", { onClick: () => onRowClick && onRowClick(row), className: cn('transition-colors duration-100 border-b border-border', onRowClick && 'cursor-pointer hover:bg-accent-subtle/60', isSelected && 'bg-accent-subtle/80'), children: [selectable && (_jsx("td", { className: "px-4 py-3 text-center", onClick: (e) => e.stopPropagation(), children: _jsx(Checkbox, { checked: isSelected, onChange: (e) => handleSelectRow(rowKey, e.target.checked), "aria-label": `Select row ${rowKey}` }) })), columns.map((col) => {
                                            const value = col.accessorKey ? row[col.accessorKey] : null;
                                            return (_jsx("td", { className: cn('px-4 py-3 text-body-md text-text-primary align-middle', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center'), children: col.cell ? col.cell(row, rIdx) : String(value ?? '—') }, `${rowKey}-${col.id}`));
                                        })] }, rowKey));
                            })) })] }) }), showPagination && !isLoading && sortedData.length > 0 && (_jsxs("div", { className: "px-4 py-3 border-t border-border bg-surface-secondary flex flex-wrap items-center justify-between gap-4 text-body-sm text-text-secondary select-none", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: "Rows per page:" }), _jsx("select", { value: perPage, onChange: (e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }, className: "bg-card text-text-primary border border-border rounded px-2 py-1 text-body-sm focus:outline-none focus:border-accent", children: [10, 15, 25, 50, 100].map((size) => (_jsx("option", { value: size, children: size }, size))) }), _jsxs("span", { className: "ml-2 tabular-nums", children: ["Showing ", (currentPage - 1) * perPage + 1, "\u2013", Math.min(currentPage * perPage, sortedData.length), " of ", sortedData.length] })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("button", { disabled: currentPage <= 1, onClick: () => setCurrentPage((p) => Math.max(p - 1, 1)), className: "p-1 rounded border border-border bg-card text-text-primary hover:bg-accent-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors", "aria-label": "Previous page", children: _jsx(ChevronLeft, { className: "w-4 h-4" }) }), _jsxs("span", { className: "px-2 tabular-nums", children: ["Page ", currentPage, " of ", totalPages] }), _jsx("button", { disabled: currentPage >= totalPages, onClick: () => setCurrentPage((p) => Math.min(p + 1, totalPages)), className: "p-1 rounded border border-border bg-card text-text-primary hover:bg-accent-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors", "aria-label": "Next page", children: _jsx(ChevronRight, { className: "w-4 h-4" }) })] })] }))] }));
}
