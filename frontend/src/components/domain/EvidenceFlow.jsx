import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { ArrowRight, Users, Package, Banknote, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
function formatFlowDirection(flowStr) {
    if (!flowStr)
        return { from: 'Unknown', to: 'Unknown' };
    const parts = flowStr.split('_to_');
    if (parts.length === 2) {
        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        return {
            from: capitalize(parts[0]),
            to: capitalize(parts[1]),
        };
    }
    return { from: flowStr, to: '' };
}
export const EvidenceFlow = ({ evidence, className }) => {
    const partyFlow = formatFlowDirection(evidence.party_flow);
    const goodsFlow = formatFlowDirection(evidence.goods_flow);
    const moneyFlow = formatFlowDirection(evidence.money_flow);
    const flows = [
        {
            label: 'Party Flow',
            icon: _jsx(Users, { className: "w-4 h-4 text-accent" }),
            ...partyFlow,
        },
        {
            label: 'Goods / Service Flow',
            icon: _jsx(Package, { className: "w-4 h-4 text-accent" }),
            ...goodsFlow,
        },
        {
            label: 'Money Flow',
            icon: _jsx(Banknote, { className: "w-4 h-4 text-accent" }),
            ...moneyFlow,
        },
    ];
    return (_jsxs("div", { className: cn('flex flex-col gap-2.5', className), children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2.5", children: flows.map((item) => (_jsxs("div", { className: "flex flex-col p-3 rounded border border-border bg-card shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-label-sm text-text-secondary mb-2", children: [item.icon, _jsx("span", { children: item.label })] }), _jsxs("div", { className: "flex items-center justify-between text-body-sm font-medium text-text-primary bg-surface-secondary px-2.5 py-1.5 rounded border border-border/40", children: [_jsx("span", { className: "truncate", children: item.from }), item.to ? (_jsxs(_Fragment, { children: [_jsx(ArrowRight, { className: "w-3.5 h-3.5 text-accent shrink-0 mx-1.5" }), _jsx("span", { className: "truncate", children: item.to })] })) : null] })] }, item.label))) }), evidence.tax_evidence && (_jsxs("div", { className: "flex items-center gap-2 p-2.5 rounded border border-border bg-surface-secondary text-body-sm text-text-secondary", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-success shrink-0" }), _jsxs("span", { children: [_jsx("strong", { className: "text-text-primary font-medium", children: "Tax Evidence:" }), ' ', evidence.tax_evidence] })] }))] }));
};
