import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
export const Tooltip = ({ content, children, position = 'top', className, }) => {
    const [isVisible, setIsVisible] = useState(false);
    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
        left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
        right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
    };
    return (_jsxs("div", { className: "relative inline-flex", onMouseEnter: () => setIsVisible(true), onMouseLeave: () => setIsVisible(false), onFocus: () => setIsVisible(true), onBlur: () => setIsVisible(false), children: [children, isVisible && (_jsx("div", { role: "tooltip", className: cn('absolute z-50 whitespace-nowrap rounded-[4px] bg-[#111722] text-[#E8EDF5] dark:bg-[#192231] dark:border dark:border-border px-2 py-1 text-label-sm shadow-dropdown pointer-events-none transition-opacity duration-150', positionClasses[position], className), children: content }))] }));
};
