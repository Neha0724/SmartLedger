import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Sparkles, Sun, Moon, Lock, Mail, AlertCircle } from 'lucide-react';
const loginSchema = z.object({
    email: z.string().email('Please enter a valid business email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [loginError, setLoginError] = useState(null);
    const { register, handleSubmit, formState: { errors, isSubmitting }, } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: 'chetan@smartledger.ai',
            password: 'password123',
        },
    });
    const onSubmit = async (data) => {
        try {
            setLoginError(null);
            await login(data);
            navigate('/dashboard');
        }
        catch (err) {
            setLoginError(err.message || 'Authentication failed. Please check credentials.');
        }
    };
    return (_jsxs("div", { className: "min-h-screen w-full bg-base flex flex-col justify-between p-4 md:p-8", children: [_jsxs("div", { className: "flex items-center justify-between max-w-5xl mx-auto w-full", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded bg-accent flex items-center justify-center text-white dark:text-[#111722] shadow-sm", children: _jsx(Sparkles, { className: "w-4 h-4 fill-current" }) }), _jsx("span", { className: "text-headline-sm font-semibold text-text-primary tracking-tight", children: "SmartLedger" })] }), _jsx("button", { onClick: toggleTheme, className: "p-2 rounded text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors", title: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`, "aria-label": "Toggle theme", children: theme === 'light' ? _jsx(Moon, { className: "w-4 h-4" }) : _jsx(Sun, { className: "w-4 h-4 text-warning" }) })] }), _jsx("div", { className: "max-w-md w-full mx-auto my-auto", children: _jsxs(Card, { className: "shadow-modal", children: [_jsxs("div", { className: "text-left mb-6", children: [_jsx("h1", { className: "text-headline-md font-semibold text-text-primary", children: "Accountant Sign In" }), _jsx("p", { className: "text-body-sm text-text-secondary mt-1", children: "Access the intelligent voucher classification workspace and review queue." })] }), loginError && (_jsxs("div", { className: "mb-5 p-3 rounded bg-error/10 border border-error/20 flex items-start gap-2.5 text-error text-body-sm", children: [_jsx(AlertCircle, { className: "w-4 h-4 mt-0.5 shrink-0" }), _jsx("span", { children: loginError })] })), _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsx(FormField, { label: "Work Email", htmlFor: "email", error: errors.email?.message, required: true, children: _jsx(Input, { id: "email", type: "email", leftElement: _jsx(Mail, { className: "w-4 h-4" }), placeholder: "name@company.com", hasError: !!errors.email, ...register('email') }) }), _jsx(FormField, { label: "Password", htmlFor: "password", error: errors.password?.message, required: true, children: _jsx(Input, { id: "password", type: "password", leftElement: _jsx(Lock, { className: "w-4 h-4" }), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", hasError: !!errors.password, ...register('password') }) }), _jsx("div", { className: "pt-2", children: _jsx(Button, { type: "submit", variant: "primary", className: "w-full", isLoading: isSubmitting, children: "Sign In to Workspace" }) })] }), _jsx("div", { className: "mt-6 pt-4 border-t border-border text-center", children: _jsx("p", { className: "text-body-sm text-text-secondary", children: "Demo credentials pre-filled. Uses stateful mock engine or live FastAPI backend." }) })] }) }), _jsx("div", { className: "text-center text-label-sm text-text-secondary py-4", children: "SmartLedger \u2014 Open-Source AI Hackathon Qualifier \u2022 Powered by Qwen 2.5-3B" })] }));
};
