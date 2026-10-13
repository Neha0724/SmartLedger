import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { cn } from '@/utils/cn';
export const VoucherChip = ({ voucher, size = 'md', className, }) => {
    return (_jsx("span", { className: cn('inline-flex items-center rounded border border-border bg-surface-secondary text-text-primary font-medium select-none truncate', size === 'sm' ? 'px-2 py-0.5 text-label-sm' : 'px-2.5 py-1 text-label-md', className), title: voucher, children: voucher }));
};
