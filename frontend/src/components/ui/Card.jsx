import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const Card = React.forwardRef(({ className, children, title, subtitle, header, headerAction, headerSubtle = false, footer, noPadding = false, ...props }, ref) => {
    const hasHeader = title || subtitle || header;
    return (_jsxs("div", { ref: ref, className: cn('bg-card rounded border border-border overflow-hidden transition-colors', className), ...props, children: [hasHeader && (_jsxs("div", { className: cn('px-4 py-3 border-b border-border flex items-center justify-between gap-4', headerSubtle ? 'bg-surface-secondary' : 'bg-card'), children: [title || subtitle ? (_jsxs("div", { className: "flex flex-col text-left min-w-0", children: [title && (_jsx("h3", { className: "font-semibold text-headline-sm text-text-primary truncate", children: title })), subtitle && (_jsx("p", { className: "text-body-sm text-text-secondary mt-0.5 font-normal", children: subtitle }))] })) : (_jsx("div", { className: "w-full flex items-center justify-between gap-4 min-w-0", children: header })), headerAction && _jsx("div", { className: "shrink-0", children: headerAction })] })), _jsx("div", { className: cn(!noPadding && 'p-4'), children: children }), footer && (_jsx("div", { className: "px-4 py-3 border-t border-border bg-surface-secondary flex items-center justify-between text-body-sm text-text-secondary", children: footer }))] }));
});
Card.displayName = 'Card';
