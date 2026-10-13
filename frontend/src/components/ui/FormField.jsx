import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const FormField = ({ label, htmlFor, error, helperText, required = false, children, className, }) => {
    return (_jsxs("div", { className: cn('flex flex-col gap-1.5 text-left w-full', className), children: [label && (_jsx("label", { htmlFor: htmlFor, className: "text-body-sm font-medium text-text-primary flex items-center justify-between", children: _jsxs("span", { children: [label, required && _jsx("span", { className: "text-error ml-1", children: "*" })] }) })), children, error ? (_jsx("p", { className: "text-label-sm text-error font-medium", children: error })) : helperText ? (_jsx("p", { className: "text-body-sm text-text-secondary", children: helperText })) : null] }));
};
