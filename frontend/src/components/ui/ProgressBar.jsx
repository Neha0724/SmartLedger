import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const ProgressBar = ({ value, max = 100, variant = 'accent', size = 'md', showLabel = false, className, }) => {
    // normalize
    const normalizedValue = max === 1 ? value * 100 : (value / max) * 100;
    const clamped = Math.min(Math.max(normalizedValue, 0), 100);
    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };
    const fillClasses = {
        accent: 'bg-accent',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
    };
    return (_jsxs("div", { className: cn('w-full flex items-center gap-3', className), children: [_jsx("div", { className: cn('w-full bg-surface-secondary rounded-full overflow-hidden border border-border/40', sizeClasses[size]), children: _jsx("div", { className: cn('h-full transition-all duration-300 rounded-full', fillClasses[variant]), style: { width: `${clamped}%` } }) }), showLabel && (_jsxs("span", { className: "text-label-sm text-text-secondary tabular-nums font-medium min-w-[3rem] text-right", children: [Math.round(clamped), "%"] }))] }));
};
