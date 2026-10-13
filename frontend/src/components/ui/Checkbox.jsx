import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';
export const Checkbox = React.forwardRef(({ className, label, description, checked, disabled, id, onChange, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    return (_jsxs("label", { htmlFor: inputId, className: cn('inline-flex items-start gap-2.5 cursor-pointer select-none', disabled && 'cursor-not-allowed opacity-60', className), children: [_jsxs("div", { className: "relative flex items-center justify-center mt-0.5", children: [_jsx("input", { ref: ref, id: inputId, type: "checkbox", checked: checked, disabled: disabled, onChange: onChange, className: "sr-only peer", ...props }), _jsx("div", { className: cn('w-4 h-4 rounded-[4px] border border-border bg-card transition-all flex items-center justify-center', 'peer-checked:bg-accent peer-checked:border-accent', 'peer-focus-visible:ring-2 peer-focus-visible:ring-accent-subtle peer-focus-visible:border-accent'), children: _jsx(Check, { className: "w-3 h-3 text-white dark:text-[#111722] opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" }) })] }), (label || description) && (_jsxs("div", { className: "flex flex-col text-left", children: [label && _jsx("span", { className: "text-body-md text-text-primary font-medium", children: label }), description && _jsx("span", { className: "text-body-sm text-text-secondary", children: description })] }))] }));
});
Checkbox.displayName = 'Checkbox';
