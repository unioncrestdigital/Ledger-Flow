import React from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Plus, Download, RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  activeView: string;
  onOpenQuickAdd: (type: 'invoice' | 'expense' | 'journal') => void;
  onOpenBackupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onOpenQuickAdd,
  onOpenBackupModal,
}) => {
  const { isTrialBalanceBalanced, companyProfile, resetToSampleData } = useAccounting();

  const viewTitles: Record<string, string> = {
    dashboard: 'Financial Dashboard',
    invoices: 'Invoices & Receivables',
    expenses: 'Expenses & Accounts Payable',
    journal: 'General Ledger',
    taxes: 'Automated Tax Center',
    reports: 'Reports & Statements',
    accounts: 'Chart of Accounts',
    rea: 'REA Accounting Model',
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-8 px-6 py-3 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      {/* Zone 1: Monarch-Style Brand Mark & Workspace */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Brand Logo with Interactive Style Selector */}
          <BrandLogo size="md" showSelector={true} />
          <div className="flex flex-col">
            <span className="text-[17px] font-bold tracking-tight text-stone-900 font-serif leading-none">
              LedgerFlow
            </span>
            <span className="text-[11px] text-stone-500 font-medium mt-0.5">
              {companyProfile.name}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-stone-200 text-xs text-stone-600">
          <span className="font-medium text-stone-900">{viewTitles[activeView] || 'Overview'}</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span>FY 2026</span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="inline-flex items-center gap-1.5">
            {isTrialBalanceBalanced ? (
              <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Ledger Balanced
              </span>
            ) : (
              <span className="text-amber-700 font-medium inline-flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Audit Required
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Utilities */}
      <div className="hidden lg:flex items-center gap-2 text-xs text-stone-600">
        <button
          onClick={onOpenBackupModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          title="Backup and Restore Data"
        >
          <Download className="w-3.5 h-3.5 text-stone-400" />
          <span>Backup JSON</span>
        </button>
        <button
          onClick={() => {
            if (confirm('Reset ledger data to default sample transactions?')) {
              resetToSampleData();
            }
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          title="Reset to sample dataset"
        >
          <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
          <span>Reset</span>
        </button>
      </div>

      {/* Zone 3: Primary Emerald Action Button */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative group">
          <button
            onClick={() => onOpenQuickAdd('invoice')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] active:bg-[#065F46] rounded-xl transition-all shadow-xs shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline font-sans">New Transaction</span>
            <span className="sm:hidden">New</span>
          </button>
          
          <div className="hidden group-hover:block absolute right-0 top-full pt-1.5 w-52 shadow-xl z-30">
            <div className="bg-white border border-stone-200 rounded-xl py-1.5 shadow-md text-xs">
              <button
                onClick={() => onOpenQuickAdd('invoice')}
                className="w-full text-left px-4 py-2 hover:bg-emerald-50/70 text-stone-800 font-medium flex items-center justify-between"
              >
                <span>Create Customer Invoice</span>
                <span className="text-[11px] text-stone-400 font-mono">A/R</span>
              </button>
              <button
                onClick={() => onOpenQuickAdd('expense')}
                className="w-full text-left px-4 py-2 hover:bg-emerald-50/70 text-stone-800 font-medium flex items-center justify-between"
              >
                <span>Log Expense or Bill</span>
                <span className="text-[11px] text-stone-400 font-mono">A/P</span>
              </button>
              <button
                onClick={() => onOpenQuickAdd('journal')}
                className="w-full text-left px-4 py-2 hover:bg-emerald-50/70 text-stone-800 font-medium flex items-center justify-between"
              >
                <span>Manual Journal Entry</span>
                <span className="text-[11px] text-stone-400 font-mono">Dr/Cr</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

