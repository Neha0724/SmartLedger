import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, UploadCloud, Layers, Receipt, CheckSquare, BarChart3, Settings, Sparkles, } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { getFeatureFlags } from '@/config/features';
export const Sidebar = ({ reviewCount = 0, onNavigate, className }) => {
    const features = getFeatureFlags();
    const navItems = [
        { label: 'Dashboard', to: '/dashboard', icon: _jsx(LayoutDashboard, { className: "w-4 h-4" }) },
        { label: 'Upload Ledger', to: '/upload', icon: _jsx(UploadCloud, { className: "w-4 h-4" }) },
        { label: 'Batches', to: '/batches', icon: _jsx(Layers, { className: "w-4 h-4" }) },
        { label: 'Transactions', to: '/transactions', icon: _jsx(Receipt, { className: "w-4 h-4" }) },
        ...(features.humanReview
            ? [
                {
                    label: 'Review Queue',
                    to: '/review',
                    icon: _jsx(CheckSquare, { className: "w-4 h-4" }),
                    badge: reviewCount > 0 ? reviewCount : undefined,
                },
            ]
            : []),
        ...(features.analytics
            ? [{ label: 'Analytics', to: '/analytics', icon: _jsx(BarChart3, { className: "w-4 h-4" }) }]
            : []),
        { label: 'Settings', to: '/settings', icon: _jsx(Settings, { className: "w-4 h-4" }) },
    ];
    return (_jsxs("aside", { className: cn('w-64 bg-card border-r border-border flex flex-col h-full select-none shrink-0', className), children: [_jsxs("div", { className: "h-16 px-5 border-b border-border flex items-center gap-3", children: [_jsx("div", { className: "w-8 h-8 rounded bg-accent flex items-center justify-center text-white dark:text-[#111722] shadow-sm", children: _jsx(Sparkles, { className: "w-4 h-4 fill-current" }) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-headline-sm font-semibold text-text-primary tracking-tight", children: "SmartLedger" }), _jsx("span", { className: "text-label-sm text-text-secondary leading-none", children: "Financial AI Platform" })] })] }), _jsxs("nav", { className: "flex-1 p-3 space-y-1 overflow-y-auto", children: [_jsx("div", { className: "px-3 py-1.5 text-label-sm uppercase text-text-secondary font-semibold tracking-wider", children: "Workspace" }), navItems.map((item) => (_jsxs(NavLink, { to: item.to, onClick: onNavigate, className: ({ isActive }) => cn('flex items-center justify-between px-3 py-2 text-body-md rounded font-medium transition-colors duration-150', isActive
                            ? 'bg-accent text-white dark:text-[#111722] shadow-sm'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'), children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("span", { className: "shrink-0", children: item.icon }), _jsx("span", { children: item.label })] }), item.badge !== undefined && (_jsx(Badge, { variant: "warning", pill: true, className: "text-label-sm px-2 py-0 border-none font-semibold", children: item.badge }))] }, item.to)))] }), _jsx("div", { className: "p-3 border-t border-border bg-surface-secondary/50", children: _jsxs("div", { className: "flex items-center gap-2 px-2 py-1.5 rounded text-label-sm text-text-secondary", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-success shrink-0" }), _jsx("span", { className: "font-medium text-text-primary truncate", children: "Qwen 2.5-3B Engine" }), _jsx("span", { className: "ml-auto text-[10px] text-text-secondary", children: "Online" })] }) })] }));
};
