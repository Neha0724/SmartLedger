import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviewQueue, submitReview } from '@/api/review';
import { getBatches } from '@/api/batches';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { ConfidenceIndicator } from '@/components/domain/ConfidenceIndicator';
import { DataQualityBadge } from '@/components/domain/DataQualityBadge';
import { VoucherChip } from '@/components/domain/VoucherChip';
import { VoucherSelect } from '@/components/domain/VoucherSelect';
import { EvidenceFlow } from '@/components/domain/EvidenceFlow';
import { ModelComparisonCard } from '@/components/domain/ModelComparisonCard';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { authEnabled } from '@/config/features';
import { formatINR, formatDate } from '@/utils/format';
import { Search, CheckCircle2, AlertTriangle, Sparkles, Check, } from 'lucide-react';
export const ReviewQueue = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { success, error: toastError } = useToast();
    const batchId = searchParams.get('batch_id') || '';
    const reason = searchParams.get('reason') || '';
    const search = searchParams.get('search') || '';
    // Selected transaction for review drawer / inspector
    const [selectedTx, setSelectedTx] = useState(null);
    const [correctedCategory, setCorrectedCategory] = useState('');
    const [isCorrecting, setIsCorrecting] = useState(false);
    const [reviewNote, setReviewNote] = useState('');
    const [reviewedSessionCount, setReviewedSessionCount] = useState(0);
    const { data: batches = [] } = useQuery({
        queryKey: ['batches'],
        queryFn: () => getBatches(),
    });
    const { data: queue = [], isLoading } = useQuery({
        queryKey: ['reviewQueue', batchId, reason, search],
        queryFn: () => getReviewQueue({
            batch_id: batchId || undefined,
            reason: reason || undefined,
            search: search || undefined,
        }),
    });
    // Automatically open first item if none selected and queue has items
    useEffect(() => {
        if (queue.length > 0 && !selectedTx) {
            setSelectedTx(queue[0]);
        }
        else if (queue.length === 0) {
            setSelectedTx(null);
        }
    }, [queue, selectedTx]);
    // Submit review mutation with optimistic updates
    const reviewMutation = useMutation({
        mutationFn: ({ txId, action, category, note, }) => submitReview(txId, {
            action,
            corrected_voucher: category,
            note,
            reviewer: authEnabled && user?.name ? user.name : 'Local Reviewer',
        }),
        onMutate: async ({ txId }) => {
            // Snapshot previous query data for rollback
            await queryClient.cancelQueries({ queryKey: ['reviewQueue'] });
            const previousQueue = queryClient.getQueryData([
                'reviewQueue',
                batchId,
                reason,
                search,
            ]);
            // Optimistically remove reviewed item from current list
            queryClient.setQueryData(['reviewQueue', batchId, reason, search], (old) => (old ? old.filter((t) => t.id !== txId) : []));
            return { previousQueue };
        },
        onError: (err, _, context) => {
            // Rollback on error
            if (context?.previousQueue) {
                queryClient.setQueryData(['reviewQueue', batchId, reason, search], context.previousQueue);
            }
            toastError('Failed to save review', err.message);
        },
        onSuccess: (_, variables) => {
            success(variables.action === 'confirm' ? 'Voucher Confirmed' : 'Voucher Corrected', `Transaction review recorded.`);
            setReviewedSessionCount((prev) => prev + 1);
            // Advance to next record in list
            const currentIndex = queue.findIndex((t) => t.id === variables.txId);
            const nextTx = queue[currentIndex + 1] || queue[0] || null;
            setSelectedTx(nextTx && nextTx.id !== variables.txId ? nextTx : null);
            setIsCorrecting(false);
            setCorrectedCategory('');
            setReviewNote('');
            queryClient.invalidateQueries({ queryKey: ['reviewQueueCount'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['batches'] });
        },
    });
    const handleConfirm = () => {
        if (!selectedTx)
            return;
        reviewMutation.mutate({
            txId: selectedTx.id,
            action: 'confirm',
            note: reviewNote,
        });
    };
    const handleCorrect = () => {
        if (!selectedTx || !correctedCategory)
            return;
        reviewMutation.mutate({
            txId: selectedTx.id,
            action: 'correct',
            category: correctedCategory,
            note: reviewNote,
        });
    };
    // Keyboard navigation shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement) {
                return;
            }
            if (e.key === 'c' || e.key === 'C') {
                // Quick Confirm shortcut
                if (selectedTx && !isCorrecting) {
                    handleConfirm();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedTx, isCorrecting]);
    const updateParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value)
            next.delete(key);
        else
            next.set(key, value);
        setSearchParams(next, { replace: true });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h1", { className: "text-headline-xl text-text-primary", children: "Human Review Queue" }), _jsxs(Badge, { variant: "warning", pill: true, className: "font-semibold tabular-nums text-label-sm", children: [queue.length, " pending"] })] }), _jsx("p", { className: "text-body-md text-text-secondary mt-1", children: "Validate transactions flagged for low confidence, model conflicts, or missing fields." })] }), _jsxs("div", { className: "flex items-center gap-3 bg-card px-4 py-2 rounded border border-border", children: [_jsx("span", { className: "text-body-sm text-text-secondary", children: "Session Progress:" }), _jsx("span", { className: "text-headline-sm font-semibold text-text-primary tabular-nums", children: reviewedSessionCount }), _jsx("span", { className: "text-body-sm text-text-secondary", children: "reviewed" })] })] }), _jsxs("div", { className: "bg-card p-3 rounded border border-border flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "relative flex-1 min-w-[200px] max-w-sm", children: [_jsx(Search, { className: "w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", placeholder: "Search invoice or party...", value: search, onChange: (e) => updateParam('search', e.target.value), className: "w-full h-9 pl-9 pr-3 text-body-sm bg-surface-secondary rounded border border-border text-text-primary focus:outline-none focus:border-accent" })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsxs(Select, { sizeVariant: "compact", value: reason, onChange: (e) => updateParam('reason', e.target.value || null), className: "w-48", children: [_jsx("option", { value: "", children: "All Flagged Reasons" }), _jsx("option", { value: "missing party", children: "Missing Party Info" }), _jsx("option", { value: "goods", children: "Weak Goods Documentation" }), _jsx("option", { value: "conflict", children: "ML / Qwen Disagreement" }), _jsx("option", { value: "quality", children: "Low Data Quality" }), _jsx("option", { value: "insufficient", children: "Insufficient Evidence" })] }), _jsxs(Select, { sizeVariant: "compact", value: batchId, onChange: (e) => updateParam('batch_id', e.target.value || null), className: "w-48", children: [_jsx("option", { value: "", children: "All Batches" }), batches.map((b) => (_jsx("option", { value: b.id, children: b.filename }, b.id)))] })] })] }), queue.length === 0 && !isLoading ? (_jsxs(Card, { className: "text-center py-16", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto mb-3", children: _jsx(Check, { className: "w-6 h-6 stroke-[3]" }) }), _jsx("h3", { className: "text-headline-md font-semibold text-text-primary", children: "Review Queue is Clear!" }), _jsx("p", { className: "text-body-md text-text-secondary mt-1 max-w-md mx-auto", children: "All pending transactions have been validated or automatically classified with high evidence." })] })) : (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start", children: [_jsxs("div", { className: "lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1", children: [_jsx("div", { className: "text-label-sm text-text-secondary font-semibold uppercase px-1", children: "Sorted by Lowest Confidence First" }), queue.map((tx) => {
                                const isSelected = selectedTx?.id === tx.id;
                                return (_jsxs("div", { onClick: () => {
                                        setSelectedTx(tx);
                                        setIsCorrecting(false);
                                        setCorrectedCategory('');
                                    }, className: `p-3.5 rounded border transition-all cursor-pointer select-none ${isSelected
                                        ? 'bg-accent-subtle/80 border-accent shadow-sm'
                                        : 'bg-card border-border hover:bg-surface-secondary'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("span", { className: "font-semibold text-text-primary tabular-nums text-body-md", children: tx.invoice_number }), _jsx("span", { className: "font-semibold text-text-primary tabular-nums text-body-md", children: formatINR(tx.amount) })] }), _jsx("div", { className: "text-body-sm text-text-secondary truncate mb-2", children: tx.party }), _jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(VoucherChip, { voucher: tx.voucher_type, size: "sm" }), _jsx(ConfidenceIndicator, { confidence: tx.confidence, level: tx.confidence_level, showBar: false })] }), _jsx("span", { className: "text-label-sm text-text-secondary tabular-nums", children: formatDate(tx.date) })] }), tx.review_reasons.length > 0 && (_jsxs("div", { className: "mt-2.5 pt-2 border-t border-border/60 text-label-sm text-warning flex items-center gap-1.5", children: [_jsx(AlertTriangle, { className: "w-3.5 h-3.5 shrink-0" }), _jsx("span", { className: "truncate", children: tx.review_reasons[0] })] }))] }, tx.id));
                            })] }), _jsx("div", { className: "lg:col-span-7", children: selectedTx ? (_jsx(Card, { header: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-accent" }), _jsxs("span", { children: ["Reviewing: ", selectedTx.invoice_number] })] }), _jsx("span", { className: "text-headline-sm font-semibold text-text-primary tabular-nums", children: formatINR(selectedTx.amount, true) })] }), className: "shadow-sm", children: _jsxs("div", { className: "space-y-5", children: [_jsxs("div", { className: "p-3 bg-warning/10 border border-warning/20 rounded", children: [_jsxs("div", { className: "flex items-center gap-2 text-label-sm font-semibold text-warning uppercase mb-1", children: [_jsx(AlertTriangle, { className: "w-4 h-4 shrink-0" }), _jsx("span", { children: "Why SmartLedger Flagged This Record" })] }), _jsx("p", { className: "text-body-md text-text-primary font-medium", children: selectedTx.review_reasons.join(' • ') || selectedTx.explanation })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded border border-border bg-surface-secondary/40 text-body-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary block", children: "Party" }), _jsx("strong", { className: "text-text-primary", children: selectedTx.party })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary block", children: "Date" }), _jsx("span", { className: "text-text-primary tabular-nums", children: formatDate(selectedTx.date) })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm text-text-secondary block", children: "Data Quality" }), _jsx(DataQualityBadge, { quality: selectedTx.data_quality })] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-label-sm font-semibold text-text-secondary uppercase block mb-1", children: "Derived Intent Profile" }), _jsxs("p", { className: "text-body-md text-text-primary font-medium mb-3 italic", children: ["\"", selectedTx.intent, "\""] }), _jsx(EvidenceFlow, { evidence: selectedTx.evidence })] }), _jsx(ModelComparisonCard, { mlPrediction: selectedTx.ml_prediction, llmPrediction: selectedTx.llm_prediction, agreement: selectedTx.agreement }), _jsx("div", { className: "pt-4 border-t border-border space-y-4", children: isCorrecting ? (_jsxs("div", { className: "p-4 rounded border border-border bg-card space-y-3", children: [_jsx("span", { className: "text-label-sm font-semibold text-text-primary block", children: "Select Corrected Voucher Category" }), _jsx("div", { className: "max-w-md", children: _jsx(VoucherSelect, { value: correctedCategory, onChange: (v) => setCorrectedCategory(v), placeholder: "Pick from 27 voucher categories..." }) }), _jsxs("div", { children: [_jsx("label", { className: "text-label-sm font-medium text-text-secondary block mb-1", children: "Accountant Justification / Audit Note (Optional)" }), _jsx(Textarea, { placeholder: "e.g. Verified with bank statement narration...", value: reviewNote, onChange: (e) => setReviewNote(e.target.value), rows: 2 })] }), _jsxs("div", { className: "flex items-center gap-2 pt-2", children: [_jsx(Button, { variant: "primary", disabled: !correctedCategory || reviewMutation.isPending, isLoading: reviewMutation.isPending, onClick: handleCorrect, children: "Submit Correction" }), _jsx(Button, { variant: "ghost", onClick: () => setIsCorrecting(false), children: "Cancel" })] })] })) : (_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsxs(Button, { variant: "primary", leftIcon: _jsx(CheckCircle2, { className: "w-4 h-4" }), onClick: handleConfirm, isLoading: reviewMutation.isPending, title: "Shortcut: Press 'C'", children: ["Confirm [", selectedTx.voucher_type, "] (C)"] }), _jsx(Button, { variant: "secondary", onClick: () => {
                                                                setCorrectedCategory(selectedTx.voucher_type);
                                                                setIsCorrecting(true);
                                                            }, children: "Correct Category" })] }), _jsx("span", { className: "text-body-sm text-text-secondary", children: "Auto-advances to next item on submit" })] })) })] }) })) : (_jsx(Card, { className: "text-center py-12 text-text-secondary", children: "Select a transaction from the queue to inspect and review." })) })] }))] }));
};
