import React, { useState, useMemo } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { JournalEntry, JournalLine } from '../types/accounting';
import {
  Plus,
  Search,
  BookOpen,
  Scale,
  ShieldCheck,
  AlertCircle,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface JournalViewProps {
  isOpenCreateModal: boolean;
  onCloseCreateModal: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  isOpenCreateModal,
  onCloseCreateModal,
}) => {
  const {
    journalEntries,
    accounts,
    addJournalEntry,
    deleteJournalEntry,
    isTrialBalanceBalanced,
    totalTrialDebits,
    totalTrialCredits,
    trialBalanceDifference,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  // Manual Journal Entry Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [lines, setLines] = useState<Omit<JournalLine, 'id'>[]>([
    { accountId: 'acc-1010', debit: 1000, credit: 0, memo: '' },
    { accountId: 'acc-4010', debit: 0, credit: 1000, memo: '' },
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    journalEntries.forEach((je) => (all[je.id] = true));
    setExpandedEntries(all);
  };

  const collapseAll = () => {
    setExpandedEntries({});
  };

  // Form line manipulation
  const updateLine = (index: number, field: string, val: any) => {
    setLines((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: val };

      // If user typed debit, clear credit or vice-versa to avoid debit and credit on same row
      if (field === 'debit' && Number(val) > 0) {
        current.credit = 0;
      } else if (field === 'credit' && Number(val) > 0) {
        current.debit = 0;
      }

      updated[index] = current;
      return updated;
    });
    setValidationError(null);
  };

  const addLine = () => {
    setLines((prev) => [...prev, { accountId: accounts[0]?.id || 'acc-1010', debit: 0, credit: 0, memo: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      setValidationError('Double-entry bookkeeping requires at least 2 lines.');
      return;
    }
    setLines((prev) => prev.filter((_, i) => i !== index));
    setValidationError(null);
  };

  // Live balance check for form
  const formDebits = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const formCredits = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const formDiff = Math.abs(formDebits - formCredits);
  const isFormBalanced = formDiff < 0.01 && formDebits > 0;

  const handleCreateJournalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setValidationError('Please provide a journal entry description.');
      return;
    }
    if (!isFormBalanced) {
      setValidationError(`Entry is out of balance. Debits ($${formDebits.toFixed(2)}) must equal Credits ($${formCredits.toFixed(2)}).`);
      return;
    }

    const cleanedLines: JournalLine[] = lines.map((l, idx) => ({
      ...l,
      id: `jl-${Date.now()}-${idx}`,
      debit: Number(l.debit) || 0,
      credit: Number(l.credit) || 0,
    }));

    const result = addJournalEntry({
      date: entryDate,
      description: description.trim(),
      reference: reference.trim(),
      source: 'MANUAL',
      lines: cleanedLines,
    });

    if (!result.success) {
      setValidationError(result.error || 'Failed to post journal entry.');
      return;
    }

    // Reset and close
    setDescription('');
    setReference('');
    setValidationError(null);
    onCloseCreateModal();
  };

  // Filter journal entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter((je) => {
      const matchesSearch =
        je.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        je.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (je.reference && je.reference.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesAccount =
        selectedAccountId === 'ALL' ||
        je.lines.some((l) => l.accountId === selectedAccountId);

      return matchesSearch && matchesAccount;
    });
  }, [journalEntries, searchQuery, selectedAccountId]);

  // Account ledger specific running balance calculation
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            General Ledger & Journal Entries
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Full audit log of immutable double-entry postings with debit and credit balance parity.
          </p>
        </div>

        <button
          onClick={onCloseCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Journal Entry
        </button>
      </div>

      {/* Audit Balance Parity Strip */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isTrialBalanceBalanced
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {isTrialBalanceBalanced ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">
                Double-Entry Parity Invariant
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isTrialBalanceBalanced ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isTrialBalanceBalanced ? 'VERIFIED (Debits == Credits)' : 'OUT OF BALANCE'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Every financial transaction records paired debit and credit legs to maintain mathematical equilibrium.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-sans">Total Debits</span>
            <span className="font-bold text-stone-900 tabular-nums">${totalTrialDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <span className="text-stone-300 font-bold">=</span>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase font-sans">Total Credits</span>
            <span className="font-bold text-stone-900 tabular-nums">${totalTrialCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          {trialBalanceDifference > 0 && (
            <div className="pl-3 border-l border-stone-200 text-rose-600">
              <span className="block text-[10px] uppercase font-sans">Discrepancy</span>
              <span className="font-bold tabular-nums">${trialBalanceDifference.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Drilldown Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200/90 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search entries or memo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#059669]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 max-w-xs focus:outline-none"
            >
              <option value="ALL">All General Ledger Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={expandAll}
            className="px-3 py-1 font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50"
          >
            Expand All Lines
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 font-medium text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg hover:bg-stone-50"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Account Specific Banner if filtered */}
      {selectedAccount && selectedAccountId !== 'ALL' && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 font-mono">{selectedAccount.code}</span>
            <span className="mx-2 text-slate-400">·</span>
            <span className="font-semibold text-slate-800">{selectedAccount.name}</span>
            <span className="mx-2 text-slate-400">·</span>
            <span className="text-slate-500">{selectedAccount.subType}</span>
          </div>
          <div className="font-mono text-xs">
            <span className="text-slate-500">Current Ledger Balance: </span>
            <strong className="text-slate-900 tabular-nums">
              ${selectedAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      )}

      {/* Journal Entries List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-400 text-xs">
            No journal entries found matching criteria.
          </div>
        ) : (
          filteredEntries.map((je) => {
            const isExpanded = expandedEntries[je.id] !== false; // default expanded
            const totalDebit = je.lines.reduce((s, l) => s + l.debit, 0);
            const totalCredit = je.lines.reduce((s, l) => s + l.credit, 0);

            return (
              <div
                key={je.id}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs transition-shadow"
              >
                {/* Entry Header */}
                <div
                  onClick={() => toggleExpand(je.id)}
                  className="px-4 py-3 bg-slate-50/70 hover:bg-slate-100/60 transition-colors flex items-center justify-between cursor-pointer border-b border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-slate-400 hover:text-slate-600 p-0.5">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <span className="font-mono font-bold text-slate-900">
                      {je.entryNumber}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-mono tabular-nums">{je.date}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-900">{je.description}</span>
                    {je.reference && (
                      <span className="text-slate-600 font-mono text-[11px]">
                        Ref: {je.reference}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Source: {je.source}
                    </span>
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      ${totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {je.source === 'MANUAL' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete manual entry ${je.entryNumber}?`)) {
                            deleteJournalEntry(je.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Journal Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Entry Lines (Expanded) */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="text-slate-600 border-b border-slate-100 font-semibold bg-white text-[11px]">
                          <th className="py-2 px-4 w-28">Account Code</th>
                          <th className="py-2 px-4">Account Name & Subtype</th>
                          <th className="py-2 px-4">Line Memo</th>
                          <th className="py-2 px-4 text-right w-32">Debit ($)</th>
                          <th className="py-2 px-4 text-right w-32">Credit ($)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {je.lines.map((line) => {
                          const acc = accounts.find((a) => a.id === line.accountId);
                          const isFilteredHighlight = selectedAccountId !== 'ALL' && line.accountId === selectedAccountId;

                          return (
                            <tr
                              key={line.id}
                              className={`hover:bg-slate-50/50 ${
                                isFilteredHighlight ? 'bg-emerald-50/50 font-semibold' : ''
                              }`}
                            >
                              <td className="py-2 px-4 text-slate-900 font-bold">
                                {acc?.code || '—'}
                              </td>
                              <td className="py-2 px-4 font-sans text-slate-800">
                                <div>{acc?.name || line.accountId}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{acc?.type}</div>
                              </td>
                              <td className="py-2 px-4 font-sans text-slate-500 text-[11px]">
                                {line.memo || '—'}
                              </td>
                              <td className="py-2 px-4 text-right tabular-nums text-slate-900">
                                {line.debit > 0
                                  ? `$${line.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                  : '—'}
                              </td>
                              <td className="py-2 px-4 text-right tabular-nums text-slate-900">
                                {line.credit > 0
                                  ? `$${line.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                  : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50/50 border-t border-slate-200 font-mono font-semibold text-[11px]">
                          <td colSpan={3} className="py-2 px-4 text-right font-sans text-slate-500">
                            Line Totals:
                          </td>
                          <td className="py-2 px-4 text-right text-slate-900 tabular-nums">
                            ${totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-4 text-right text-slate-900 tabular-nums">
                            ${totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CREATE MANUAL JOURNAL ENTRY MODAL */}
      {isOpenCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  New Double-Entry Journal Entry
                </h2>
                <p className="text-xs text-slate-500">
                  Manually adjust accounts or record capital investments, depreciation, and tax allocations.
                </p>
              </div>
              <button
                onClick={onCloseCreateModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJournalSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Date & Ref */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description / Explanation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly depreciation on server cluster or tax reserve adjustment"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              {/* Lines Table */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    Journal Lines (Min. 2 lines)
                  </span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    + Add Account Line
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md items-center text-xs"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <select
                          value={line.accountId}
                          onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-medium text-slate-800"
                        >
                          {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name} ({acc.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Line Memo (optional)"
                          value={line.memo || ''}
                          onChange={(e) => updateLine(idx, 'memo', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-slate-700"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Debit ($)"
                          value={line.debit || ''}
                          onChange={(e) => updateLine(idx, 'debit', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-mono"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Credit ($)"
                            value={line.credit || ''}
                            onChange={(e) => updateLine(idx, 'credit', e.target.value)}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-right font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => removeLine(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                            disabled={lines.length <= 2}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Parity Bar */}
              <div className="p-3 bg-slate-100 rounded-md flex flex-wrap items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4">
                  <span>Debits: <strong className="text-slate-900">${formDebits.toFixed(2)}</strong></span>
                  <span>Credits: <strong className="text-slate-900">${formCredits.toFixed(2)}</strong></span>
                  <span>
                    Diff:{' '}
                    <strong className={formDiff > 0.009 ? 'text-rose-600' : 'text-emerald-700'}>
                      ${formDiff.toFixed(2)}
                    </strong>
                  </span>
                </div>
                <div>
                  {isFormBalanced ? (
                    <span className="text-emerald-700 font-semibold font-sans inline-flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" /> Balanced & Ready
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold font-sans inline-flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Out of balance
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseCreateModal}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormBalanced}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] disabled:opacity-40 rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
                >
                  Post Journal Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
