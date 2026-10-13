import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';
export const Select = React.forwardRef(({ className, options, children, hasError = false, sizeVariant = 'default', disabled, ...props }, ref) => {
    const heightClass = sizeVariant === 'compact' ? 'h-9 text-body-sm' : 'h-10 text-body-md';
    return (_jsxs("div", { className: "relative w-full", children: [_jsx("select", { ref: ref, disabled: disabled, className: cn('w-full appearance-none bg-card text-text-primary rounded border border-border px-3 pr-8 transition-colors cursor-pointer', heightClass, 'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle focus:ring-offset-0', hasError && 'border-error focus:border-error focus:ring-error/20', disabled && 'opacity-60 bg-surface-secondary cursor-not-allowed', className), ...props, children: options
                    ? options.map((opt) => (_jsx("option", { value: opt.value, disabled: opt.disabled, children: opt.label }, opt.value)))
                    : children }), _jsx(ChevronDown, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-text-secondary" })] }));
});
Select.displayName = 'Select';
