import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Badge } from '@/components/ui/Badge';
export const DataQualityBadge = ({ quality, className }) => {
    switch (quality) {
        case 'High':
            return (_jsx(Badge, { variant: "success", leftDot: true, className: className, children: "High Quality" }));
        case 'Medium':
            return (_jsx(Badge, { variant: "warning", leftDot: true, className: className, children: "Medium Quality" }));
        case 'Low':
            return (_jsx(Badge, { variant: "error", leftDot: true, className: className, children: "Low Quality" }));
        default:
            return (_jsx(Badge, { variant: "neutral", className: className, children: quality }));
    }
};
