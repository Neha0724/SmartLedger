import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, disabled, children, ...props }, ref) => {
    const sizeClasses = {
        sm: 'h-8 px-3 text-body-sm font-medium gap-1.5',
        md: 'h-9 px-4 text-body-md font-medium gap-2',
        lg: 'h-11 px-5 text-body-md font-medium gap-2.5',
    };
    const variantClasses = {
        primary: 'bg-accent text-[var(--color-btn-primary-text)] font-semibold hover:bg-opacity-90 active:scale-[0.99] border border-transparent disabled:opacity-50',
        secondary: 'bg-card text-text-primary border border-border hover:bg-accent-subtle active:scale-[0.99] disabled:opacity-50',
        ghost: 'bg-transparent text-text-secondary border-none hover:bg-accent-subtle hover:text-text-primary active:scale-[0.99] disabled:opacity-50',
        danger: 'bg-error text-white hover:bg-opacity-90 active:scale-[0.99] border border-transparent disabled:opacity-50',
    };
    return (_jsxs("button", { ref: ref, disabled: disabled || isLoading, className: cn('inline-flex items-center justify-center rounded transition-colors duration-150 focus-ring cursor-pointer select-none font-sans disabled:cursor-not-allowed', sizeClasses[size], variantClasses[variant], className), ...props, children: [isLoading && _jsx(Loader2, { className: "w-4 h-4 animate-spin shrink-0" }), !isLoading && leftIcon && _jsx("span", { className: "shrink-0", children: leftIcon }), _jsx("span", { children: children }), !isLoading && rightIcon && _jsx("span", { className: "shrink-0", children: rightIcon })] }));
});
Button.displayName = 'Button';
