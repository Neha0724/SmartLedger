import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const Badge = React.forwardRef(({ className, variant = 'neutral', pill = false, leftDot = false, children, ...props }, ref) => {
    // 12% opacity tint with solid text token via CSS color-mix
    const variantClasses = {
        neutral: 'badge-neutral',
        success: 'badge-success',
        warning: 'badge-warning',
        error: 'badge-error',
        accent: 'badge-accent',
        info: 'badge-info',
        violet: 'badge-violet',
    };
    const dotColors = {
        neutral: 'bg-text-secondary',
        success: 'bg-success',
        warning: 'bg-warning',
        error: 'bg-error',
        accent: 'bg-accent',
        info: 'bg-info',
        violet: 'bg-chart-4',
    };
    return (_jsxs("span", { ref: ref, className: cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-label-sm border font-medium tabular-nums', pill ? 'rounded-full' : 'rounded-sm', variantClasses[variant], className), ...props, children: [leftDot && _jsx("span", { className: cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant]) }), _jsx("span", { children: children })] }));
});
Badge.displayName = 'Badge';
