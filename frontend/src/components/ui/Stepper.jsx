import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
import { Check, Loader2, AlertCircle } from 'lucide-react';
export const Stepper = ({ steps, currentStepIndex = 0, className }) => {
    return (_jsx("div", { className: cn('w-full', className), children: _jsx("div", { className: "flex items-center justify-between relative", children: steps.map((step, idx) => {
                const isCompleted = step.status === 'completed' || idx < currentStepIndex;
                const isRunning = step.status === 'running' || (step.status !== 'failed' && idx === currentStepIndex);
                const isFailed = step.status === 'failed';
                return (_jsxs(React.Fragment, { children: [idx > 0 && (_jsx("div", { className: cn('flex-1 h-0.5 mx-2 transition-colors duration-200', isCompleted || isRunning ? 'bg-accent' : 'bg-border') })), _jsxs("div", { className: "flex flex-col items-center group relative text-center min-w-[70px]", children: [_jsx("div", { className: cn('w-7 h-7 rounded-full flex items-center justify-center text-label-sm font-semibold border transition-all duration-200', isCompleted && 'bg-success text-white border-success', isRunning && !isCompleted && 'bg-accent text-white border-accent ring-4 ring-accent-subtle', isFailed && 'bg-error text-white border-error', !isCompleted && !isRunning && !isFailed && 'bg-surface-secondary text-text-secondary border-border'), children: isCompleted ? (_jsx(Check, { className: "w-3.5 h-3.5 stroke-[3]" })) : isRunning ? (_jsx(Loader2, { className: "w-3.5 h-3.5 animate-spin" })) : isFailed ? (_jsx(AlertCircle, { className: "w-3.5 h-3.5" })) : (_jsx("span", { children: idx + 1 })) }), _jsx("span", { className: cn('text-label-sm mt-1.5 font-medium transition-colors max-w-[100px] leading-tight', isRunning ? 'text-accent font-semibold' : isCompleted ? 'text-text-primary' : 'text-text-secondary'), children: step.name })] })] }, step.id));
            }) }) }));
};
