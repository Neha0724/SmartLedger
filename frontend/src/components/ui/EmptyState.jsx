import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { FileQuestion } from 'lucide-react';
import { Button } from './Button';
export const EmptyState = ({ icon, title, description, actionLabel, onAction, className, }) => {
    return (_jsxs("div", { className: cn('flex flex-col items-center justify-center text-center p-8 rounded bg-card border border-border border-dashed', className), children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-text-secondary mb-3", children: icon || _jsx(FileQuestion, { className: "w-6 h-6" }) }), _jsx("h3", { className: "text-headline-sm font-semibold text-text-primary", children: title }), description && (_jsx("p", { className: "text-body-md text-text-secondary mt-1 max-w-sm", children: description })), actionLabel && onAction && (_jsx(Button, { variant: "secondary", size: "sm", onClick: onAction, className: "mt-4", children: actionLabel }))] }));
};
