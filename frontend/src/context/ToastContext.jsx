import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const addToast = useCallback(({ type, title, description, duration = 4000 }) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, title, description, duration }]);
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);
    const success = useCallback((title, description) => {
        addToast({ type: 'success', title, description });
    }, [addToast]);
    const warning = useCallback((title, description) => {
        addToast({ type: 'warning', title, description });
    }, [addToast]);
    const error = useCallback((title, description) => {
        addToast({ type: 'error', title, description });
    }, [addToast]);
    const info = useCallback((title, description) => {
        addToast({ type: 'info', title, description });
    }, [addToast]);
    const icons = {
        success: _jsx(CheckCircle2, { className: "w-4 h-4 text-success shrink-0" }),
        warning: _jsx(AlertCircle, { className: "w-4 h-4 text-warning shrink-0" }),
        error: _jsx(XCircle, { className: "w-4 h-4 text-error shrink-0" }),
        info: _jsx(Info, { className: "w-4 h-4 text-accent shrink-0" }),
    };
    const borders = {
        success: 'border-l-4 border-l-success',
        warning: 'border-l-4 border-l-warning',
        error: 'border-l-4 border-l-error',
        info: 'border-l-4 border-l-accent',
    };
    return (_jsxs(ToastContext.Provider, { value: { toast: addToast, success, warning, error, info }, children: [children, _jsx("div", { className: "fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none", children: toasts.map((t) => (_jsxs("div", { className: cn('pointer-events-auto flex items-start gap-3 p-3.5 bg-card border border-border rounded shadow-modal text-left transition-all animate-in slide-in-from-bottom-5', borders[t.type]), children: [_jsx("div", { className: "mt-0.5", children: icons[t.type] }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h4", { className: "text-body-md font-semibold text-text-primary", children: t.title }), t.description && (_jsx("p", { className: "text-body-sm text-text-secondary mt-0.5", children: t.description }))] }), _jsx("button", { onClick: () => removeToast(t.id), className: "text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors", "aria-label": "Dismiss", children: _jsx(X, { className: "w-3.5 h-3.5" }) })] }, t.id))) })] }));
};
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
