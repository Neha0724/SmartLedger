import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const Skeleton = ({ className, variant = 'rect', ...props }) => {
    const variantClasses = {
        text: 'h-4 w-full rounded-[4px]',
        rect: 'rounded',
        circle: 'rounded-full',
    };
    return (_jsx("div", { className: cn('animate-pulse bg-surface-secondary/70 border border-border/40', variantClasses[variant], className), ...props }));
};
