import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransaction } from '@/api/transactions';
import { submitReview } from '@/api/review';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/domain/StatusBadge';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { EvidenceFlow } from '@/components/domain/EvidenceFlow';
import { EvidenceMatrix } from '@/components/domain/EvidenceMatrix';
import { ModelComparisonCard } from '@/components/domain/ModelComparisonCard';
import { AuditTrail } from '@/components/domain/AuditTrail';
import { VoucherSelect } from '@/components/domain/VoucherSelect';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { authEnabled, getFeatureFlags } from '@/config/features';
import { formatINR, formatDate } from '@/utils/format';
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles, UserCheck, } from 'lucide-react';
export const TransactionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { success, error: toastError } = useToast();
    const features = getFeatureFlags();
    const [reviewNote, setReviewNote] = useState('');
    const [correctedVoucher, setCorrectedVoucher] = useState('');
    const [isCorrecting, setIsCorrecting] = useState(false);
    const { data: transaction, isLoading, error } = useQuery({
        queryKey: ['transaction', id],
        queryFn: () => {
            if (!id)
                throw new Error('Missing transaction ID');
            return getTransaction(id);
        },
    });
    const reviewMutation = useMutation({
        mutationFn: (action) => {
            if (!id)
                throw new Error('No transaction ID');
            return submitReview(id, {
                action,
                corrected_voucher: action === 'correct' ? correctedVoucher : undefined,
                note: reviewNote,
                reviewer: authEnabled && user?.name ? user.name : 'Local Reviewer',
            });
        },
        onSuccess: (updatedTx, action) => {
            success(action === 'confirm' ? 'Voucher Confirmed' : 'Voucher Corrected', `Transaction marked as ${action === 'confirm' ? 'Confirmed' : 'Corrected'}.`);
            queryClient.setQueryData(['transaction', id], updatedTx);
            queryClient.invalidateQueries({ queryKey: ['reviewQueueCount'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setIsCorrecting(false);
            setReviewNote('');
        },
        onError: (err) => {
            toastError('Review action failed', err.message);
        },
    });
    if (isLoading) {
        return (_jsx("div", { className: "p-12 text-center text-text-secondary", children: "Loading transaction explainability profile..." }));
    }
    if (error || !transaction) {
        return (_jsxs("div", { className: "p-12 text-center", children: [_jsx("h2", { className: "text-headline-md text-error", children: "Transaction Not Found" }), _jsxs("p", { className: "text-body-md text-text-secondary mt-2", children: ["Unable to find transaction record with ID \"", id, "\"."] }), _jsx(Link, { to: "/transactions", className: "mt-4 inline-block", children: _jsx(Button, { variant: "secondary", children: "Back to Transactions" }) })] }));
    }
    const needsReview = transaction.status === 'needs_review';
    return (_jsxs("div", { className: "space-y-6 max-w-6xl mx-auto pb-12", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-border pb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => navigate(-1), className: "p-1.5 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors", "aria-label": "Go back", children: _jsx(ArrowLeft, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 text-label-sm text-text-secondary", children: [_jsx(Link, { to: "/transactions", className: "hover:underline", children: "Transactions" }), _jsx("span", { children: "/" }), _jsx("span", { className: "tabular-nums font-medium text-text-primary", children: transaction.invoice_number })] }), _jsxs("h1", { className: "text-headline-lg text-text-primary flex items-center gap-3 mt-1", children: [_jsx("span", { children: transaction.invoice_number }), _jsxs("span", { className: "text-text-secondary text-body-md font-normal", children: ["(", transaction.party, ")"] })] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: transaction.batch_id && (_jsx(Link, { to: `/batches/${transaction.batch_id}`, children: _jsx(Button, { variant: "secondary", size: "sm", children: "View Batch" }) })) })] }), _jsx(Card, { noPadding: true, className: "p-5 bg-card", children: _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase block mb-1", children: "Total Amount" }), _jsx("div", { className: "text-headline-md font-semibold text-text-primary tabular-nums", children: formatINR(transaction.amount, true) }), _jsx("span", { className: "text-label-sm text-text-secondary tabular-nums", children: formatDate(transaction.date) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase block mb-1", children: "Final Voucher" }), _jsx(VoucherChip, { voucher: transaction.voucher_type }), _jsx("span", { className: "text-label-sm text-text-secondary block mt-1", children: transaction.status === 'reviewed_corrected' ? 'Accountant Corrected' : 'System Predicted' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase block mb-1", children: "Confidence Score" }), _jsx(ConfidenceIndicator, { confidence: transaction.confidence, level: transaction.confidence_level, showBar: true })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase block mb-1", children: "Routing Status" }), _jsx(StatusBadge, { status: transaction.status })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary uppercase block mb-1", children: "Data Quality" }), _jsx(DataQualityBadge, { quality: transaction.data_quality })] })] }) }), features.humanReview && needsReview && (_jsx(Card, { header: _jsxs("div", { className: "flex items-center gap-2 text-warning font-semibold", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-warning" }), _jsx("span", { children: "Human Review Required for This Transaction" })] }), className: "border-warning/40 bg-warning/5", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("span", { className: "text-label-sm font-semibold text-warning uppercase block mb-1", children: "Reason Flagged by SmartLedger" }), _jsx("p", { className: "text-body-md text-text-primary font-medium", children: transaction.review_reasons.join(' • ') || transaction.explanation })] }), isCorrecting ? (_jsxs("div", { className: "p-4 bg-card rounded border border-border space-y-3", children: [_jsx("span", { className: "text-label-sm font-semibold text-text-primary block", children: "Select Correct Voucher Category" }), _jsx("div", { className: "max-w-md", children: _jsx(VoucherSelect, { value: correctedVoucher, onChange: (v) => setCorrectedVoucher(v), placeholder: "Choose category from 27 options..." }) }), _jsxs("div", { children: [_jsx("label", { className: "text-label-sm font-medium text-text-secondary block mb-1", children: "Reviewer Note / Justification (Optional)" }), _jsx(Textarea, { placeholder: "e.g. Counterparty ledger verified with tax portal...", value: reviewNote, onChange: (e) => setReviewNote(e.target.value), rows: 2 })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx(Button, { variant: "primary", disabled: !correctedVoucher || reviewMutation.isPending, isLoading: reviewMutation.isPending, onClick: () => reviewMutation.mutate('correct'), children: "Submit Correction" }), _jsx(Button, { variant: "ghost", onClick: () => setIsCorrecting(false), children: "Cancel" })] })] })) : (_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 pt-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "primary", leftIcon: _jsx(CheckCircle2, { className: "w-4 h-4" }), onClick: () => reviewMutation.mutate('confirm'), isLoading: reviewMutation.isPending, children: ["Confirm Predicted [", transaction.voucher_type, "]"] }), _jsx(Button, { variant: "secondary", onClick: () => {
                                                setCorrectedVoucher(transaction.voucher_type);
                                                setIsCorrecting(true);
                                            }, children: "Correct to Different Category" })] }), _jsx("span", { className: "text-body-sm text-text-secondary italic", children: "Decision will be logged to the audit trail and labeled for continuous evaluation." })] }))] }) })), transaction.review && (_jsx(Card, { header: "Human Review Audit Record", headerSubtle: true, children: _jsxs("div", { className: "flex items-start gap-3 text-body-sm", children: [_jsx(UserCheck, { className: "w-5 h-5 text-success shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-text-primary", children: ["Reviewed by ", transaction.review.reviewer, " on ", formatDate(transaction.review.reviewed_at || '', true)] }), _jsxs("p", { className: "text-text-secondary mt-1", children: ["Outcome: ", _jsx("strong", { className: "text-text-primary", children: transaction.review.status.toUpperCase() }), transaction.review.corrected_voucher && (_jsxs("span", { children: [" (Corrected category: ", _jsx("strong", { children: transaction.review.corrected_voucher }), ")"] }))] }), transaction.review.note && (_jsxs("p", { className: "text-text-secondary mt-1 bg-surface-secondary p-2.5 rounded border border-border", children: ["Note: \"", transaction.review.note, "\""] }))] })] }) })), _jsx(Card, { header: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-accent" }), _jsx("span", { children: "Transaction Intent Profile & Flow Directions" })] }), children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-3.5 bg-surface-secondary/70 rounded border border-border", children: [_jsx("span", { className: "text-label-sm font-semibold uppercase text-text-secondary block mb-1", children: "Derived Financial Intent" }), _jsxs("p", { className: "text-headline-sm font-semibold text-text-primary", children: ["\"", transaction.intent, "\""] })] }), _jsx(EvidenceFlow, { evidence: transaction.evidence })] }) }), features.evidenceMatrix && transaction.evidence_matrix?.length > 0 && (_jsx(Card, { header: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { children: "Evidence Matrix (Signal vs Candidate Vouchers)" }), _jsx("span", { className: "text-label-sm text-text-secondary", children: "Evaluates candidate accounting categories against evidence" })] }), children: _jsx(EvidenceMatrix, { rows: transaction.evidence_matrix }) })), _jsx(ModelComparisonCard, { mlPrediction: transaction.ml_prediction, llmPrediction: transaction.llm_prediction, agreement: transaction.agreement }), _jsx(Card, { header: "System Explanation & Rationalization", children: _jsx("p", { className: "text-body-md text-text-primary leading-relaxed bg-surface-secondary/50 p-4 rounded border border-border", children: transaction.explanation }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsx(Card, { header: "Original Raw Ledger Record", headerSubtle: true, children: _jsx("div", { className: "overflow-x-auto", children: _jsx("table", { className: "w-full text-body-sm text-left border-collapse", children: _jsx("tbody", { className: "divide-y divide-border", children: Object.entries(transaction.raw_record || {}).map(([key, val]) => (_jsxs("tr", { className: "hover:bg-surface-secondary/40", children: [_jsx("td", { className: "py-2 px-3 font-semibold text-text-secondary whitespace-nowrap w-1/3", children: key }), _jsx("td", { className: "py-2 px-3 text-text-primary tabular-nums break-all", children: String(val ?? '—') })] }, key))) }) }) }) }), _jsx(Card, { header: "Data Quality & Completeness Audit", headerSubtle: true, children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-body-sm text-text-secondary", children: "Completeness Tier" }), _jsx(DataQualityBadge, { quality: transaction.data_quality })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm font-semibold text-text-secondary uppercase block mb-1.5", children: "Missing / Weak Data Fields" }), transaction.data_quality_missing_fields && transaction.data_quality_missing_fields.length > 0 ? (_jsx("ul", { className: "space-y-1", children: transaction.data_quality_missing_fields.map((f, i) => (_jsxs("li", { className: "text-body-sm text-warning flex items-center gap-1.5", children: [_jsx(AlertTriangle, { className: "w-3.5 h-3.5 shrink-0" }), _jsx("span", { children: f })] }, i))) })) : (_jsxs("p", { className: "text-body-sm text-success flex items-center gap-1.5", children: [_jsx(CheckCircle2, { className: "w-4 h-4 shrink-0" }), "All critical accounting fields and tax identifiers present."] }))] }), _jsxs("div", { className: "pt-3 border-t border-border", children: [_jsx("span", { className: "text-label-sm font-semibold text-text-secondary uppercase block mb-1", children: "Other Extracted Signals" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: transaction.evidence.other_signals?.map((sig, i) => (_jsx("span", { className: "px-2 py-0.5 rounded text-label-sm bg-surface-secondary border border-border text-text-primary", children: sig }, i))) })] })] }) })] }), features.auditTrail && transaction.audit_trail?.length > 0 && (_jsx(Card, { header: "Decision Audit Trail Timeline", children: _jsx(AuditTrail, { steps: transaction.audit_trail }) }))] }));
};
