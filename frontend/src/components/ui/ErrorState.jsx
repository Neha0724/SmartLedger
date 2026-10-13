import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';
export const ErrorState = ({ title = 'An error occurred', message = 'Failed to load data. Please check your connection and try again.', onRetry, className, }) => {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center text-center p-8 rounded bg-card border border-error/30', className), children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error mb-3", children: _jsx(AlertTriangle, { className: "w-6 h-6" }) }), _jsx("h3", { className: "text-headline-sm font-semibold text-text-primary", children: title }), _jsx("p", { className: "text-body-md text-text-secondary mt-1 max-w-sm", children: message }), onRetry && (_jsx(Button, { variant: "secondary", size: "sm", leftIcon: _jsx(RotateCcw, { className: "w-3.5 h-3.5" }), onClick: onRetry, className: "mt-4", children: "Retry" }))] }));
};
