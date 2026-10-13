import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
export const AuditTrail = ({ steps, className }) => {
    const getIcon = (status) => {
        switch (status) {
            case 'passed':
                return _jsx(CheckCircle2, { className: "w-4 h-4 text-success shrink-0" });
            case 'warning':
                return _jsx(AlertCircle, { className: "w-4 h-4 text-warning shrink-0" });
            case 'info':
            default:
                return _jsx(Info, { className: "w-4 h-4 text-accent shrink-0" });
        }
    };
    return (_jsx("div", { className: cn('relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border', className), children: steps.map((step, idx) => (_jsxs("div", { className: "relative flex items-start gap-3 group", children: [_jsx("div", { className: "absolute -left-6 top-0.5 bg-card rounded-full p-0.5 border border-border", children: getIcon(step.status) }), _jsxs("div", { className: "flex-1 bg-surface-secondary/50 p-3 rounded border border-border/60", children: [_jsxs("div", { className: "flex items-center justify-between gap-2 mb-1", children: [_jsx("span", { className: "text-label-md font-semibold text-text-primary", children: step.step }), _jsx("span", { className: "text-label-sm text-text-secondary tabular-nums", children: step.timestamp })] }), _jsx("p", { className: "text-body-sm text-text-secondary leading-relaxed", children: step.detail })] })] }, `step-${idx}`))) }));
};
