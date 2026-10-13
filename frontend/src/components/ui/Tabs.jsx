import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const Tabs = ({ tabs, activeTab, onChange, className }) => {
    return (_jsx("div", { className: cn('border-b border-border flex items-center gap-1', className), children: tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (_jsxs("button", { type: "button", disabled: tab.disabled, onClick: () => !tab.disabled && onChange(tab.id), className: cn('group relative flex items-center gap-2 px-3.5 py-2.5 text-body-md font-medium transition-colors cursor-pointer select-none', isActive
                    ? 'text-accent border-b-2 border-accent -mb-px font-semibold'
                    : 'text-text-secondary hover:text-text-primary hover:bg-accent-subtle/50 rounded-t', tab.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'), children: [tab.icon && _jsx("span", { className: "w-4 h-4 shrink-0", children: tab.icon }), _jsx("span", { children: tab.label }), tab.badge && _jsx("span", { className: "shrink-0", children: tab.badge })] }, tab.id));
        }) }));
};
