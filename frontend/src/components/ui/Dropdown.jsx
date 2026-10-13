import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
export const Dropdown = ({ trigger, items, children, align = 'right', className, width = 'w-48', }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);
    return (_jsxs("div", { className: "relative inline-block text-left", ref: dropdownRef, children: [_jsx("div", { onClick: () => setIsOpen(!isOpen), className: "cursor-pointer inline-flex items-center", children: trigger }), isOpen && (_jsx("div", { className: cn('absolute z-50 mt-1.5 rounded bg-card border border-border shadow-dropdown p-1 focus:outline-none animate-in fade-in-50 zoom-in-95', align === 'right' ? 'right-0' : 'left-0', width, className), children: items
                    ? items.map((item, idx) => {
                        if (item.divider) {
                            return _jsx("div", { className: "my-1 border-t border-border" }, `div-${idx}`);
                        }
                        return (_jsxs("button", { disabled: item.disabled, onClick: () => {
                                if (!item.disabled && item.onClick) {
                                    item.onClick();
                                    setIsOpen(false);
                                }
                            }, className: cn('w-full flex items-center gap-2 px-2.5 py-1.5 text-body-sm rounded text-left transition-colors cursor-pointer', item.danger
                                ? 'text-error hover:bg-error/10'
                                : 'text-text-primary hover:bg-accent-subtle', item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'), children: [item.icon && _jsx("span", { className: "w-4 h-4 shrink-0 text-text-secondary", children: item.icon }), _jsx("span", { className: "truncate", children: item.label })] }, item.id));
                    })
                    : children }))] }));
};
