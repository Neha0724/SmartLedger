import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '@/api/auth';
import { authEnabled } from '@/config/features';
const DEFAULT_LOCAL_USER = {
    id: 'usr-local',
    name: 'SmartLedger User',
    email: 'local@smartledger.internal',
    role: 'Financial Auditor',
};
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authEnabled ? null : DEFAULT_LOCAL_USER);
    const [isLoading, setIsLoading] = useState(authEnabled);
    useEffect(() => {
        // When auth is disabled, do not call any auth endpoints (me, login, logout) on app start
        if (!authEnabled) {
            setIsLoading(false);
            return;
        }
        async function checkAuth() {
            try {
                const u = await authApi.getCurrentUser();
                setUser(u);
            }
            catch {
                setUser(null);
            }
            finally {
                setIsLoading(false);
            }
        }
        checkAuth();
    }, []);
    const login = async (credentials) => {
        const res = await authApi.login(credentials);
        setUser(res.user);
    };
    const logout = async () => {
        await authApi.logout();
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
        }, children: children }));
};
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
