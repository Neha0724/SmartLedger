import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useQuery } from '@tanstack/react-query';
import { getReviewQueue } from '@/api/review';
import { X } from 'lucide-react';
export const AppShell = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // Poll or query review queue items to keep the count badge live
    const { data: reviewQueue } = useQuery({
        queryKey: ['reviewQueueCount'],
        queryFn: () => getReviewQueue(),
        refetchInterval: 10000,
    });
    const reviewCount = reviewQueue?.length || 0;
    return (_jsxs("div", { className: "flex h-screen w-full bg-base text-text-primary overflow-hidden font-sans", children: [_jsx("div", { className: "hidden md:block h-full", children: _jsx(Sidebar, { reviewCount: reviewCount }) }), mobileMenuOpen && (_jsxs("div", { className: "fixed inset-0 z-50 flex md:hidden", children: [_jsx("div", { className: "fixed inset-0 bg-[#111722]/50 backdrop-blur-sm transition-opacity", onClick: () => setMobileMenuOpen(false), "aria-hidden": "true" }), _jsxs("div", { className: "relative flex-1 flex flex-col max-w-xs w-full bg-card z-10 animate-in slide-in-from-left duration-200", children: [_jsx("div", { className: "absolute top-3 right-3", children: _jsx("button", { onClick: () => setMobileMenuOpen(false), className: "p-1.5 rounded text-text-secondary hover:text-text-primary hover:bg-surface-secondary", "aria-label": "Close sidebar", children: _jsx(X, { className: "w-5 h-5" }) }) }), _jsx(Sidebar, { reviewCount: reviewCount, onNavigate: () => setMobileMenuOpen(false) })] })] })), _jsxs("div", { className: "flex-1 flex flex-col h-full min-w-0 overflow-hidden", children: [_jsx(Header, { onMenuClick: () => setMobileMenuOpen(true), reviewCount: reviewCount }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "max-w-content mx-auto p-4 md:p-6 lg:p-8 w-full", children: _jsx(Outlet, {}) }) })] })] }));
};
