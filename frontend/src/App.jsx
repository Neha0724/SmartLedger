import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { authEnabled, getFeatureFlags } from '@/config/features';
// Pages
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Upload } from '@/pages/Upload';
import { Batches } from '@/pages/Batches';
import { BatchDetail } from '@/pages/BatchDetail';
import { Transactions } from '@/pages/Transactions';
import { TransactionDetail } from '@/pages/TransactionDetail';
import { ReviewQueue } from '@/pages/ReviewQueue';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';
import { Styleguide } from '@/pages/Styleguide';
// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    // If auth is disabled, render children directly with zero redirect or delay
    if (!authEnabled) {
        return _jsx(_Fragment, { children: children });
    }
    if (isLoading) {
        return (_jsx("div", { className: "h-screen w-full flex items-center justify-center bg-base text-text-secondary", children: "Initializing SmartLedger..." }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
export const App = () => {
    const features = getFeatureFlags();
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: authEnabled ? _jsx(Login, {}) : _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/styleguide", element: _jsx(Styleguide, {}) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(AppShell, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "upload", element: _jsx(Upload, {}) }), _jsx(Route, { path: "batches", element: _jsx(Batches, {}) }), _jsx(Route, { path: "batches/:id", element: _jsx(BatchDetail, {}) }), _jsx(Route, { path: "transactions", element: _jsx(Transactions, {}) }), _jsx(Route, { path: "transactions/:id", element: _jsx(TransactionDetail, {}) }), features.humanReview && _jsx(Route, { path: "review", element: _jsx(ReviewQueue, {}) }), features.analytics && _jsx(Route, { path: "analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "settings", element: _jsx(Settings, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/dashboard", replace: true }) })] }));
};
