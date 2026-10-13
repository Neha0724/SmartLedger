import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
export const Modal = ({ isOpen, onClose, title, description, children, footer, maxWidth = 'md', className, }) => {
    const modalRef = useRef(null);
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
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "fixed inset-0 bg-[#111722]/50 backdrop-blur-sm transition-opacity", onClick: onClose, "aria-hidden": "true" }), _jsxs("div", { ref: modalRef, role: "dialog", "aria-modal": "true", className: cn('relative w-full bg-card rounded-modal border border-border shadow-modal overflow-hidden z-10 transition-all', maxWidthClasses[maxWidth], className), children: [(title || description) && (_jsxs("div", { className: "px-5 py-4 border-b border-border flex items-start justify-between gap-4 bg-card", children: [_jsxs("div", { children: [title && _jsx("h3", { className: "text-headline-sm font-semibold text-text-primary", children: title }), description && _jsx("p", { className: "text-body-sm text-text-secondary mt-0.5", children: description })] }), _jsx("button", { onClick: onClose, className: "text-text-secondary hover:text-text-primary p-1 rounded hover:bg-accent-subtle transition-colors", "aria-label": "Close modal", children: _jsx(X, { className: "w-4 h-4" }) })] })), _jsx("div", { className: "p-5", children: children }), footer && (_jsx("div", { className: "px-5 py-3 border-t border-border bg-surface-secondary flex items-center justify-end gap-2.5", children: footer }))] })] }));
};
