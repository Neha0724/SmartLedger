import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
export const Drawer = ({ isOpen, onClose, title, subtitle, children, footer, width = 'lg', className, }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);
    if (!isOpen)
        return null;
    const widthClasses = {
        md: 'max-w-md',
        lg: 'max-w-xl',
        xl: 'max-w-2xl',
        '2xl': 'max-w-3xl',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 overflow-hidden", children: [_jsx("div", { className: "fixed inset-0 bg-[#111722]/50 backdrop-blur-sm transition-opacity", onClick: onClose, "aria-hidden": "true" }), _jsx("div", { className: "fixed inset-y-0 right-0 flex pl-10 max-w-full", children: _jsxs("div", { role: "dialog", "aria-modal": "true", className: cn('w-screen bg-card border-l border-border shadow-modal flex flex-col z-10 animate-in slide-in-from-right duration-200', widthClasses[width], className), children: [_jsxs("div", { className: "px-5 py-4 border-b border-border flex items-start justify-between gap-4 bg-card shrink-0", children: [_jsxs("div", { children: [title && _jsx("h3", { className: "text-headline-sm font-semibold text-text-primary", children: title }), subtitle && _jsx("p", { className: "text-body-sm text-text-secondary mt-0.5", children: subtitle })] }), _jsx("button", { onClick: onClose, className: "text-text-secondary hover:text-text-primary p-1 rounded hover:bg-accent-subtle transition-colors", "aria-label": "Close drawer", children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-5", children: children }), footer && (_jsx("div", { className: "px-5 py-3 border-t border-border bg-surface-secondary flex items-center justify-between gap-3 shrink-0", children: footer }))] }) })] }));
};
