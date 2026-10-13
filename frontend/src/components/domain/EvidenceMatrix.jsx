import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { Check, HelpCircle, Minus } from 'lucide-react';
export const EvidenceMatrix = ({ rows, className }) => {
    const renderCell = (val) => {
        switch (val) {
            case 'yes':
                return (_jsxs("span", { className: "inline-flex items-center gap-1 text-success text-body-sm font-semibold", children: [_jsx(Check, { className: "w-4 h-4 stroke-[2.5]" }), _jsx("span", { children: "Supported" })] }));
            case 'possible':
                return (_jsxs("span", { className: "inline-flex items-center gap-1 text-warning text-body-sm font-medium", children: [_jsx(HelpCircle, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Possible" })] }));
            case 'no':
            default:
                return (_jsx("span", { className: "inline-flex items-center text-text-secondary/50", children: _jsx(Minus, { className: "w-3.5 h-3.5" }) }));
        }
    };
    return (_jsx("div", { className: cn('w-full overflow-x-auto rounded border border-border bg-card', className), children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { className: "bg-surface-secondary text-text-secondary border-b border-border text-label-md", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 font-semibold", children: "Evidence Signal" }), _jsx("th", { className: "px-4 py-3 font-semibold text-center w-28", children: "Purchase" }), _jsx("th", { className: "px-4 py-3 font-semibold text-center w-28", children: "Sales" }), _jsx("th", { className: "px-4 py-3 font-semibold text-center w-28", children: "Payment" }), _jsx("th", { className: "px-4 py-3 font-semibold text-center w-28", children: "Receipt" })] }) }), _jsx("tbody", { className: "divide-y divide-border", children: rows.map((row, idx) => (_jsxs("tr", { className: "hover:bg-accent-subtle/40 transition-colors", children: [_jsx("td", { className: "px-4 py-2.5 text-body-md text-text-primary font-medium", children: row.signal }), _jsx("td", { className: "px-4 py-2.5 text-center", children: renderCell(row.purchase) }), _jsx("td", { className: "px-4 py-2.5 text-center", children: renderCell(row.sales) }), _jsx("td", { className: "px-4 py-2.5 text-center", children: renderCell(row.payment) }), _jsx("td", { className: "px-4 py-2.5 text-center", children: renderCell(row.receipt) })] }, `matrix-${idx}`))) })] }) }));
};
