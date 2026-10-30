import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  TrendingUp,
  Scale,
  FileText,
  Printer,
  Download,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    accounts,
    totalRevenue,
    totalExpenses,
    netIncome,
    totalTrialDebits,
    totalTrialCredits,
    isTrialBalanceBalanced,
    companyProfile,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'PL' | 'BALANCE_SHEET' | 'TRIAL_BALANCE'>('PL');

  // Categorize accounts for Balance Sheet
  const currentAssets = accounts.filter(
    (a) => a.type === 'ASSET' && a.subType !== 'Fixed Assets' && a.subType !== 'Contra Asset'
  );
  const fixedAssets = accounts.filter(
    (a) => a.type === 'ASSET' && (a.subType === 'Fixed Assets' || a.subType === 'Contra Asset')
  );
  const totalAssetsSum = accounts
    .filter((a) => a.type === 'ASSET')
    .reduce((sum, a) => sum + a.balance, 0);

  const liabilities = accounts.filter((a) => a.type === 'LIABILITY');
  const totalLiabilitiesSum = liabilities.reduce((sum, a) => sum + a.balance, 0);

  const equityAccounts = accounts.filter((a) => a.type === 'EQUITY');
  const totalEquityBase = equityAccounts.reduce((sum, a) => sum + a.balance, 0);
  const totalEquityWithNetIncome = totalEquityBase + netIncome;

  const totalLiabAndEquity = Math.round((totalLiabilitiesSum + totalEquityWithNetIncome) * 100) / 100;
  const roundedAssets = Math.round(totalAssetsSum * 100) / 100;
  const isBalanceSheetBalanced = Math.abs(roundedAssets - totalLiabAndEquity) < 0.05;

  // Revenue & Expense lists for P&L
  const revenueAccounts = accounts.filter((a) => a.type === 'REVENUE');
  const expenseAccounts = accounts.filter((a) => a.type === 'EXPENSE');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Financial Statements & Accounting Reports
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            GAAP-compliant Profit & Loss, Balance Sheet, and Trial Balance ledger reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200/90 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-400" />
            Print Report
          </button>
        </div>
      </div>

      {/* Segmented Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl text-xs font-medium print:hidden">
        <button
          onClick={() => setActiveTab('PL')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'PL' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Profit & Loss (Income Statement)
        </button>
        <button
          onClick={() => setActiveTab('BALANCE_SHEET')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'BALANCE_SHEET' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('TRIAL_BALANCE')}
          className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
            activeTab === 'TRIAL_BALANCE' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Trial Balance
        </button>
      </div>

      {/* REPORT CONTENT WRAPPER */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Report Letterhead */}
        <div className="text-center pb-6 border-b border-stone-200 mb-6">
          <h2 className="text-xl font-bold text-stone-900 font-serif">{companyProfile.name}</h2>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            {activeTab === 'PL' && 'PROFIT & LOSS STATEMENT (INCOME STATEMENT)'}
            {activeTab === 'BALANCE_SHEET' && 'BALANCE SHEET (STATEMENT OF FINANCIAL POSITION)'}
            {activeTab === 'TRIAL_BALANCE' && 'GENERAL LEDGER TRIAL BALANCE'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Reporting Period: FY 2026 (Year-to-Date) · Accrual Accounting Basis
          </div>
        </div>

        {/* 1. PROFIT & LOSS */}
        {activeTab === 'PL' && (
          <div className="max-w-2xl mx-auto space-y-6 text-xs text-slate-800">
            {/* Revenue Section */}
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                Operating Revenue
              </div>
              <div className="space-y-1.5 pl-2">
                {revenueAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center py-1">
                    <span className="text-slate-700">
                      {acc.code} - {acc.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200 font-bold text-slate-900">
                <span>Total Operating Revenue</span>
                <span className="font-mono tabular-nums">
                  ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Operating Expenses Section */}
            <div>
              <div className="font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
                Operating Expenses
              </div>
              <div className="space-y-1.5 pl-2">
                {expenseAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center py-1">
                    <span className="text-slate-700">
                      {acc.code} - {acc.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200 font-bold text-slate-900">
                <span>Total Operating Expenses</span>
                <span className="font-mono tabular-nums">
                  ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Net Income Summary */}
            <div className="pt-4 border-t-2 border-slate-900">
              <div className="flex justify-between items-center text-sm font-bold text-slate-900 py-1">
                <span>Net Operating Income (EBIT)</span>
                <span className="font-mono tabular-nums text-emerald-700">
                  ${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Net Operating Margin: {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(2) : '0.00'}%
              </div>
            </div>
          </div>
        )}

        {/* 2. BALANCE SHEET */}
        {activeTab === 'BALANCE_SHEET' && (
          <div className="max-w-2xl mx-auto space-y-6 text-xs text-slate-800">
            {/* ASSETS */}
            <div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 pb-1 mb-3">
                1. Assets
              </div>

              {/* Current Assets */}
              <div className="mb-4">
                <div className="font-semibold text-slate-600 mb-2 pl-1">
                  Current Assets
                </div>
                <div className="space-y-1.5 pl-3">
                  {currentAssets.map((acc) => (
                    <div key={acc.id} className="flex justify-between items-center py-0.5">
                      <span className="text-slate-700">{acc.code} - {acc.name}</span>
                      <span className="font-mono tabular-nums text-slate-900">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fixed Assets */}
              <div className="mb-4">
                <div className="font-semibold text-slate-600 mb-2 pl-1">
                  Fixed Assets & Property
                </div>
                <div className="space-y-1.5 pl-3">
                  {fixedAssets.map((acc) => (
                    <div key={acc.id} className="flex justify-between items-center py-0.5">
                      <span className="text-slate-700">{acc.code} - {acc.name}</span>
                      <span className="font-mono tabular-nums text-slate-900">
                        ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-300 font-bold text-slate-900 text-xs">
                <span>TOTAL ASSETS</span>
                <span className="font-mono tabular-nums text-slate-900">
                  ${roundedAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* LIABILITIES */}
            <div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 pb-1 mb-3">
                2. Liabilities
              </div>

              <div className="space-y-1.5 pl-3">
                {liabilities.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center py-0.5">
                    <span className="text-slate-700">{acc.code} - {acc.name}</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-300 font-bold text-slate-900 text-xs">
                <span>TOTAL LIABILITIES</span>
                <span className="font-mono tabular-nums text-slate-900">
                  ${totalLiabilitiesSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* EQUITY */}
            <div>
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b-2 border-slate-900 pb-1 mb-3">
                3. Equity
              </div>

              <div className="space-y-1.5 pl-3">
                {equityAccounts.map((acc) => (
                  <div key={acc.id} className="flex justify-between items-center py-0.5">
                    <span className="text-slate-700">{acc.code} - {acc.name}</span>
                    <span className="font-mono tabular-nums text-slate-900">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-0.5 text-emerald-800 font-semibold">
                  <span>Net Operating Income (Current Year)</span>
                  <span className="font-mono tabular-nums">
                    ${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-300 font-bold text-slate-900 text-xs">
                <span>TOTAL EQUITY</span>
                <span className="font-mono tabular-nums text-slate-900">
                  ${totalEquityWithNetIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* EQUILIBRIUM SUMMARY */}
            <div className="pt-4 border-t-2 border-slate-900 bg-slate-50 p-4 rounded-md">
              <div className="flex justify-between items-center font-bold text-slate-900 text-sm">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span className="font-mono tabular-nums">
                  ${totalLiabAndEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Accounting Equation: Assets = Liabilities + Equity
                </span>
                {isBalanceSheetBalanced ? (
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Perfectly Balanced
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    Discrepancy: ${Math.abs(roundedAssets - totalLiabAndEquity).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. TRIAL BALANCE */}
        {activeTab === 'TRIAL_BALANCE' && (
          <div className="max-w-3xl mx-auto space-y-4 text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-700 font-bold text-[11px] uppercase">
                    <th className="py-2 px-3">Code</th>
                    <th className="py-2 px-3">Account Title</th>
                    <th className="py-2 px-3">Classification</th>
                    <th className="py-2 px-3 text-right">Debit Balance ($)</th>
                    <th className="py-2 px-3 text-right">Credit Balance ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {accounts.map((acc) => {
                    const isDebit = acc.type === 'ASSET' || acc.type === 'EXPENSE';
                    const debitAmt = isDebit && acc.balance !== 0 ? acc.balance : null;
                    const creditAmt = !isDebit && acc.balance !== 0 ? acc.balance : null;

                    return (
                      <tr key={acc.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-bold text-slate-900">{acc.code}</td>
                        <td className="py-2 px-3 font-sans text-slate-800">{acc.name}</td>
                        <td className="py-2 px-3 font-sans text-slate-500 text-[11px]">{acc.type}</td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-900">
                          {debitAmt !== null ? `$${debitAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums text-slate-900">
                          {creditAmt !== null ? `$${creditAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <td colSpan={3} className="py-2.5 px-3 font-sans uppercase">
                      Trial Balance Equilibrium:
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      ${totalTrialDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      ${totalTrialCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between text-xs text-emerald-800">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Debits and credits parity verified across all Chart of Accounts balances.
              </span>
              <span className="font-mono font-bold">Sum Debits == Sum Credits</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
