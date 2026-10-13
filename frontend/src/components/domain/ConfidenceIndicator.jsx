import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const ConfidenceIndicator = ({ confidence, level, showBar = true, className, }) => {
    // Derive level if not provided
    const derivedLevel = level || (confidence >= 0.85 ? 'High' : confidence >= 0.65 ? 'Medium' : 'Low');
    const badgeClasses = {
        High: 'badge-success',
        Medium: 'badge-warning',
        Low: 'badge-error',
    };
    const barClasses = {
        High: 'bg-success',
        Medium: 'bg-warning',
        Low: 'bg-error',
    };
    const pct = Math.min(Math.max(confidence <= 1 ? confidence * 100 : confidence, 0), 100);
    return (_jsxs("div", { className: cn('inline-flex flex-col gap-1', className), children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: cn('inline-flex items-center px-1.5 py-0.5 rounded-sm text-label-sm font-semibold border', badgeClasses[derivedLevel]), children: derivedLevel }), _jsx("span", { className: "text-body-sm text-text-secondary tabular-nums font-medium", children: confidence.toFixed(2) })] }), showBar && (_jsx("div", { className: "w-16 h-1 bg-surface-secondary rounded-full overflow-hidden border border-border/30", children: _jsx("div", { className: cn('h-full transition-all rounded-full', barClasses[derivedLevel]), style: { width: `${pct}%` } }) }))] }));
};
