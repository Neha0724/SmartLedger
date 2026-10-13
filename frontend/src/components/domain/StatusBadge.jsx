import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, AlertCircle, Sparkles, CheckCheck, RefreshCw, XCircle } from 'lucide-react';
export const StatusBadge = ({ status, className, showIcon = true, }) => {
    switch (status) {
        case 'auto_classified':
            return (_jsxs(Badge, { variant: "success", className: className, children: [showIcon && _jsx(CheckCircle2, { className: "w-3 h-3 shrink-0" }), "Auto Classified"] }));
        case 'needs_review':
            return (_jsxs(Badge, { variant: "warning", className: className, children: [showIcon && _jsx(AlertCircle, { className: "w-3 h-3 shrink-0" }), "Needs Review"] }));
        case 'conflict_resolved':
            return (_jsxs(Badge, { variant: "violet", className: className, children: [showIcon && _jsx(Sparkles, { className: "w-3 h-3 shrink-0" }), "Conflict Resolved"] }));
        case 'reviewed_confirmed':
            return (_jsxs(Badge, { variant: "info", className: className, children: [showIcon && _jsx(CheckCheck, { className: "w-3 h-3 shrink-0" }), "Reviewed (Confirmed)"] }));
        case 'reviewed_corrected':
            return (_jsxs(Badge, { variant: "accent", className: className, children: [showIcon && _jsx(RefreshCw, { className: "w-3 h-3 shrink-0" }), "Reviewed (Corrected)"] }));
        case 'failed':
            return (_jsxs(Badge, { variant: "error", className: className, children: [showIcon && _jsx(XCircle, { className: "w-3 h-3 shrink-0" }), "Failed"] }));
        default:
            return (_jsx(Badge, { variant: "neutral", className: className, children: status }));
    }
};
