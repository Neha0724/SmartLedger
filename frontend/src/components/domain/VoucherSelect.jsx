import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef, useEffect } from 'react';
import { VOUCHER_GROUPS } from '@/types';
import { cn } from '@/utils/cn';
import { ChevronDown, Search, Check } from 'lucide-react';
export const VoucherSelect = ({ value, onChange, placeholder = 'Select voucher category...', disabled = false, className, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
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
    // Filter grouped categories
    const filteredGroups = Object.entries(VOUCHER_GROUPS).reduce((acc, [groupName, categories]) => {
        const matches = categories.filter((cat) => cat.toLowerCase().includes(search.toLowerCase()));
        if (matches.length > 0) {
            acc[groupName] = matches;
        }
        return acc;
    }, {});
    const handleSelect = (category) => {
        onChange(category);
        setIsOpen(false);
        setSearch('');
    };
    return (_jsxs("div", { className: cn('relative w-full text-left', className), ref: containerRef, children: [_jsxs("button", { type: "button", disabled: disabled, onClick: () => !disabled && setIsOpen(!isOpen), className: cn('w-full h-10 px-3 bg-card border border-border rounded flex items-center justify-between text-body-md text-text-primary transition-colors cursor-pointer', 'focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-subtle', disabled && 'opacity-50 cursor-not-allowed bg-surface-secondary'), children: [_jsx("span", { className: cn('truncate', !value && 'text-text-secondary'), children: value || placeholder }), _jsx(ChevronDown, { className: "w-4 h-4 text-text-secondary shrink-0 ml-2" })] }), isOpen && (_jsxs("div", { className: "absolute z-50 left-0 right-0 mt-1 bg-card border border-border rounded shadow-dropdown max-h-72 flex flex-col overflow-hidden animate-in fade-in-50", children: [_jsx("div", { className: "p-2 border-b border-border bg-surface-secondary/50", children: _jsxs("div", { className: "relative flex items-center", children: [_jsx(Search, { className: "w-4 h-4 text-text-secondary absolute left-2.5 pointer-events-none" }), _jsx("input", { type: "text", autoFocus: true, placeholder: "Search 27 voucher categories...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full h-8 pl-8 pr-3 text-body-sm bg-card rounded border border-border text-text-primary focus:outline-none focus:border-accent" })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto p-1 divide-y divide-border/40", children: Object.keys(filteredGroups).length === 0 ? (_jsx("div", { className: "p-4 text-center text-body-sm text-text-secondary", children: "No matching voucher categories" })) : (Object.entries(filteredGroups).map(([groupName, categories]) => (_jsxs("div", { className: "py-1", children: [_jsx("div", { className: "px-2.5 py-1 text-label-sm font-semibold text-text-secondary tracking-wider uppercase", children: groupName }), categories.map((cat) => {
                                    const isSelected = value === cat;
                                    return (_jsxs("button", { type: "button", onClick: () => handleSelect(cat), className: cn('w-full flex items-center justify-between px-2.5 py-1.5 text-body-sm rounded text-left transition-colors cursor-pointer', isSelected
                                            ? 'bg-accent-subtle text-accent font-semibold'
                                            : 'text-text-primary hover:bg-surface-secondary'), children: [_jsx("span", { className: "truncate", children: cat }), isSelected && _jsx(Check, { className: "w-4 h-4 text-accent shrink-0 ml-2" })] }, cat));
                                })] }, groupName)))) })] }))] }));
};
