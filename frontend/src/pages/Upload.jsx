import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { uploadBatch } from '@/api/batches';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowRight, } from 'lucide-react';
export const Upload = () => {
    const navigate = useNavigate();
    const { success, error: toastError } = useToast();
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewRows, setPreviewRows] = useState([]);
    const [validation, setValidation] = useState(null);
    const [runQwen, setRunQwen] = useState(true);
    const [autoRoute, setAutoRoute] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Parse and validate file client-side
    const processFile = (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
            toastError('Invalid file type', 'Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.');
            return;
        }
        if (file.size > 25 * 1024 * 1024) {
            toastError('File too large', 'Maximum upload size is 25MB.');
            return;
        }
        setSelectedFile(file);
        if (ext === 'csv') {
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    validateAndSetData(results.data);
                },
                error: (err) => {
                    toastError('Parsing error', err.message);
                },
            });
        }
        else {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                    validateAndSetData(json);
                }
                catch (err) {
                    toastError('Excel parse failed', err.message || 'Unable to parse spreadsheet');
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };
    const validateAndSetData = (rows) => {
        if (!rows || rows.length === 0) {
            setValidation({
                isValid: false,
                totalRows: 0,
                detectedColumns: [],
                requiredColumnsFound: [],
                missingRequiredColumns: ['Date', 'Party/Description', 'Amount'],
                missingValuesRowCount: 0,
                warnings: [],
                errors: ['The uploaded file contains no data rows.'],
            });
            setPreviewRows([]);
            return;
        }
        const detectedColumns = Object.keys(rows[0]);
        const lowerCols = detectedColumns.map((c) => c.toLowerCase());
        // Schema matching
        const hasDate = lowerCols.some((c) => c.includes('date'));
        const hasParty = lowerCols.some((c) => c.includes('party') || c.includes('name') || c.includes('desc') || c.includes('particular'));
        const hasAmount = lowerCols.some((c) => c.includes('amount') || c.includes('total') || c.includes('value'));
        const hasGST = lowerCols.some((c) => c.includes('gst') || c.includes('tax'));
        const hasInvoiceNo = lowerCols.some((c) => c.includes('inv') || c.includes('bill') || c.includes('ref') || c.includes('number'));
        const requiredFound = [];
        const missingRequired = [];
        if (hasDate)
            requiredFound.push('Transaction Date');
        else
            missingRequired.push('Transaction Date');
        if (hasParty)
            requiredFound.push('Party / Description');
        else
            missingRequired.push('Party / Counterparty');
        if (hasAmount)
            requiredFound.push('Amount / Total');
        else
            missingRequired.push('Amount / Total');
        const warnings = [];
        const errors = [];
        if (!hasGST) {
            warnings.push('No GST / Tax column detected. Tax evidence inference will be downgraded.');
        }
        if (!hasInvoiceNo) {
            warnings.push('No Invoice Number or Reference ID detected. Unique voucher IDs will be auto-generated.');
        }
        if (missingRequired.length > 0) {
            errors.push(`Missing mandatory columns: ${missingRequired.join(', ')}`);
        }
        // Count rows with null or empty values
        let missingValuesRowCount = 0;
        rows.forEach((r) => {
            const hasEmpty = Object.values(r).some((val) => val === '' || val === null || val === undefined);
            if (hasEmpty)
                missingValuesRowCount++;
        });
        if (missingValuesRowCount > 0) {
            warnings.push(`${missingValuesRowCount} of ${rows.length} rows contain blank or unparsed cells.`);
        }
        setPreviewRows(rows.slice(0, 10));
        setValidation({
            isValid: errors.length === 0,
            totalRows: rows.length,
            detectedColumns,
            requiredColumnsFound: requiredFound,
            missingRequiredColumns: missingRequired,
            missingValuesRowCount,
            warnings,
            errors,
        });
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleSubmit = async () => {
        if (!selectedFile || !validation || !validation.isValid)
            return;
        try {
            setIsSubmitting(true);
            const newBatch = await uploadBatch({
                file: selectedFile,
                runQwenReasoning: runQwen,
                autoRouteToReview: autoRoute,
                rowCount: validation.totalRows,
            });
            success('Batch created successfully', `Queued ${validation.totalRows} transactions for classification.`);
            navigate(`/batches/${newBatch.id}`);
        }
        catch (err) {
            toastError('Submission failed', err.message || 'Could not create batch');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-headline-xl text-text-primary", children: "Upload Financial Transactions" }), _jsx("p", { className: "text-body-md text-text-secondary mt-1", children: "Upload an unclassified Excel or CSV ledger. SmartLedger validates the schema, derives intent, runs ML + Qwen LLM reasoning, and classifies each voucher." })] }), _jsx(Card, { noPadding: true, children: _jsxs("div", { onDrop: handleDrop, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onClick: () => fileInputRef.current?.click(), className: `p-10 border-2 border-dashed rounded text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center ${isDragging
                        ? 'border-accent bg-accent-subtle/50'
                        : selectedFile
                            ? 'border-border bg-surface-secondary/30 hover:border-accent'
                            : 'border-border hover:border-accent hover:bg-surface-secondary/20'}`, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".csv, .xlsx, .xls", className: "hidden", onChange: (e) => e.target.files?.[0] && processFile(e.target.files[0]) }), _jsx("div", { className: "w-14 h-14 rounded-full bg-accent-subtle text-accent flex items-center justify-center mb-4 shadow-sm", children: _jsx(UploadCloud, { className: "w-7 h-7" }) }), selectedFile ? (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2 text-headline-sm font-semibold text-text-primary", children: [_jsx(FileSpreadsheet, { className: "w-5 h-5 text-accent" }), _jsx("span", { children: selectedFile.name })] }), _jsxs("p", { className: "text-body-sm text-text-secondary", children: [(selectedFile.size / 1024).toFixed(1), " KB \u2022 Click or drop another file to replace"] })] })) : (_jsxs("div", { className: "space-y-2", children: [_jsx("p", { className: "text-headline-sm font-semibold text-text-primary", children: "Drag and drop your Excel (.xlsx) or CSV file here" }), _jsx("p", { className: "text-body-sm text-text-secondary", children: "Supports Tally extracts, SAP ledgers, Zoho, and bank statement spreadsheets up to 25MB" }), _jsx(Button, { size: "sm", variant: "secondary", className: "mt-3 pointer-events-none", children: "Browse Local Files" })] }))] }) }), validation && (_jsxs("div", { className: "space-y-6 animate-in fade-in-50 duration-200", children: [_jsx(Card, { header: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { children: "Schema Validation & Completeness Check" }), validation.isValid ? (_jsxs(Badge, { variant: "success", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 mr-1" }), "Schema Valid (", validation.totalRows, " Rows)"] })) : (_jsxs(Badge, { variant: "error", children: [_jsx(XCircle, { className: "w-3.5 h-3.5 mr-1" }), "Schema Incomplete"] }))] }), children: _jsxs("div", { className: "space-y-4", children: [validation.errors.length > 0 && (_jsxs("div", { className: "p-3.5 rounded bg-error/10 border border-error/20 space-y-1.5", children: [_jsxs("div", { className: "flex items-center gap-2 text-label-md font-semibold text-error", children: [_jsx(XCircle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: "Blocking Schema Errors (Cannot Proceed)" })] }), validation.errors.map((err, idx) => (_jsxs("p", { className: "text-body-sm text-error pl-6", children: ["\u2022 ", err] }, `err-${idx}`)))] })), validation.warnings.length > 0 && (_jsxs("div", { className: "p-3.5 rounded bg-warning/10 border border-warning/20 space-y-1.5", children: [_jsxs("div", { className: "flex items-center gap-2 text-label-md font-semibold text-warning", children: [_jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: "Non-Blocking Warnings" })] }), validation.warnings.map((warn, idx) => (_jsxs("p", { className: "text-body-sm text-warning pl-6", children: ["\u2022 ", warn] }, `warn-${idx}`)))] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2", children: [_jsxs("div", { className: "p-3 rounded border border-border bg-surface-secondary/40", children: [_jsx("span", { className: "text-label-sm font-semibold text-text-secondary block mb-2 uppercase", children: "Mandatory Columns Found" }), _jsxs("div", { className: "flex flex-wrap gap-1.5", children: [validation.requiredColumnsFound.map((col) => (_jsxs(Badge, { variant: "success", children: [_jsx(CheckCircle2, { className: "w-3 h-3 mr-1" }), col] }, col))), validation.missingRequiredColumns.map((col) => (_jsxs(Badge, { variant: "error", children: [_jsx(XCircle, { className: "w-3 h-3 mr-1" }), "Missing ", col] }, col)))] })] }), _jsxs("div", { className: "p-3 rounded border border-border bg-surface-secondary/40", children: [_jsxs("span", { className: "text-label-sm font-semibold text-text-secondary block mb-2 uppercase", children: ["Detected Ledger Headers (", validation.detectedColumns.length, ")"] }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: validation.detectedColumns.map((col) => (_jsx("span", { className: "px-2 py-0.5 rounded text-label-sm bg-card border border-border text-text-primary", children: col }, col))) })] })] })] }) }), _jsx(Card, { header: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { children: "Client-Side Data Preview (First 10 Rows)" }), _jsx("span", { className: "text-label-sm text-text-secondary", children: "Parsed locally via SheetJS & PapaParse" })] }), noPadding: true, children: _jsx("div", { className: "overflow-x-auto max-h-80", children: _jsxs("table", { className: "w-full text-left border-collapse text-body-sm", children: [_jsx("thead", { className: "bg-surface-secondary text-text-secondary border-b border-border sticky top-0", children: _jsxs("tr", { children: [_jsx("th", { className: "px-3 py-2 text-label-sm w-12", children: "#" }), validation.detectedColumns.map((col) => (_jsx("th", { className: "px-3 py-2 text-label-sm font-medium whitespace-nowrap", children: col }, col)))] }) }), _jsx("tbody", { className: "divide-y divide-border bg-card", children: previewRows.map((row, rIdx) => (_jsxs("tr", { className: "hover:bg-accent-subtle/30", children: [_jsx("td", { className: "px-3 py-2 text-text-secondary tabular-nums", children: rIdx + 1 }), validation.detectedColumns.map((col) => (_jsx("td", { className: "px-3 py-2 text-text-primary whitespace-nowrap truncate max-w-xs", children: String(row[col] ?? '—') }, `${rIdx}-${col}`)))] }, `prev-${rIdx}`))) })] }) }) }), _jsx(Card, { header: "Inference Pipeline Settings", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "flex items-center justify-between p-3 rounded border border-border bg-surface-secondary/40", children: [_jsxs("div", { children: [_jsx("span", { className: "text-body-md font-medium text-text-primary block", children: "Run Qwen LLM Reasoning" }), _jsx("span", { className: "text-body-sm text-text-secondary", children: "Deep contextual intent analysis via Qwen2.5-3B-Instruct" })] }), _jsx(Toggle, { checked: runQwen, onChange: setRunQwen })] }), _jsxs("div", { className: "flex items-center justify-between p-3 rounded border border-border bg-surface-secondary/40", children: [_jsxs("div", { children: [_jsx("span", { className: "text-body-md font-medium text-text-primary block", children: "Auto-Route Low-Confidence" }), _jsx("span", { className: "text-body-sm text-text-secondary", children: "Automatically route ambiguous or conflicting items to human review" })] }), _jsx(Toggle, { checked: autoRoute, onChange: setAutoRoute })] })] }), _jsxs("div", { className: "pt-4 border-t border-border flex items-center justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => {
                                                setSelectedFile(null);
                                                setValidation(null);
                                                setPreviewRows([]);
                                            }, children: "Discard" }), _jsx(Button, { variant: "primary", size: "lg", disabled: !validation.isValid || isSubmitting, isLoading: isSubmitting, rightIcon: _jsx(ArrowRight, { className: "w-4 h-4" }), onClick: handleSubmit, children: "Start Pipeline Processing" })] })] }) })] }))] }));
};
