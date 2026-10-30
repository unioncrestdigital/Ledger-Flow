import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { TaxRate } from '../types/accounting';
import {
  Scale,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
  Building2,
  DollarSign,
  Printer,
  X,
} from 'lucide-react';

export const TaxCenterView: React.FC = () => {
  const {
    quarterlyTaxSummaries,
    contractor1099Reports,
    taxRates,
    accounts,
    expenses,
    remitQuarterlyTax,
    addTaxRate,
    totalSalesTaxCollected,
    totalSalesTaxPaid,
    netSalesTaxPayable,
    companyProfile,
  } = useAccounting();

  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4 2026');
  const [remitModalQuarter, setRemitModalQuarter] = useState<string | null>(null);
  const [remitAccount, setRemitAccount] = useState('acc-1010');
  const [remitDate, setRemitDate] = useState(new Date().toISOString().split('T')[0]);

  // New Tax Rate modal
  const [isOpenAddRateModal, setIsOpenAddRateModal] = useState(false);
  const [newRateName, setNewRateName] = useState('');
  const [newRateCode, setNewRateCode] = useState('');
  const [newRatePercent, setNewRatePercent] = useState('');
  const [newRateAuthority, setNewRateAuthority] = useState('');

  const currentSummary = quarterlyTaxSummaries.find((q) => q.quarter === selectedQuarter) || quarterlyTaxSummaries[3];

  // Schedule C expense deduction breakdown calculation
  const scheduleCBreakdown = [
    {
      category: 'Cloud Infrastructure & Hosting (Account 5010)',
      deductibility: '100% Deductible',
      gross: expenses.filter((e) => e.accountId === 'acc-5010').reduce((s, e) => s + e.amount, 0),
      deductible: expenses.filter((e) => e.accountId === 'acc-5010').reduce((s, e) => s + (e.amount - e.taxAmount), 0),
    },
    {
      category: 'Contract Labor 1099 (Account 5020)',
      deductibility: '100% Deductible',
      gross: expenses.filter((e) => e.accountId === 'acc-5020').reduce((s, e) => s + e.amount, 0),
      deductible: expenses.filter((e) => e.accountId === 'acc-5020').reduce((s, e) => s + (e.amount - e.taxAmount), 0),
    },
    {
      category: 'Office Lease & Facilities (Account 5030)',
      deductibility: '100% Deductible',
      gross: expenses.filter((e) => e.accountId === 'acc-5030').reduce((s, e) => s + e.amount, 0),
      deductible: expenses.filter((e) => e.accountId === 'acc-5030').reduce((s, e) => s + (e.amount - e.taxAmount), 0),
    },
    {
      category: 'Software & SaaS Tools (Account 5040)',
      deductibility: '100% Deductible',
      gross: expenses.filter((e) => e.accountId === 'acc-5040').reduce((s, e) => s + e.amount, 0),
      deductible: expenses.filter((e) => e.accountId === 'acc-5040').reduce((s, e) => s + (e.amount - e.taxAmount), 0),
    },
    {
      category: 'Business Meals & Dining (Account 5050)',
      deductibility: '50% Statutory IRS Limitation',
      gross: expenses.filter((e) => e.accountId === 'acc-5050').reduce((s, e) => s + e.amount, 0),
      deductible: expenses.filter((e) => e.accountId === 'acc-5050').reduce((s, e) => s + ((e.amount - e.taxAmount) * 0.5), 0),
    },
    {
      category: 'Legal & Professional Services (Account 5070)',
      deductibility: '100% Deductible',
      gross: expenses.filter((e) => e.accountId === 'acc-5070').reduce((s, e) => s + e.amount, 0),
      deductible: expenses.filter((e) => e.accountId === 'acc-5070').reduce((s, e) => s + (e.amount - e.taxAmount), 0),
    },
  ];

  const totalGrossExpense = scheduleCBreakdown.reduce((s, b) => s + b.gross, 0);
  const totalDeductibleExpense = scheduleCBreakdown.reduce((s, b) => s + b.deductible, 0);

  const handleAddRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rateVal = parseFloat(newRatePercent) / 100;
    if (!newRateName.trim() || isNaN(rateVal)) return;

    addTaxRate({
      name: newRateName.trim(),
      code: newRateCode.trim() || `TAX-${rateVal * 100}`,
      rate: rateVal,
      authority: newRateAuthority.trim() || 'State Revenue Agency',
    });

    setNewRateName('');
    setNewRateCode('');
    setNewRatePercent('');
    setNewRateAuthority('');
    setIsOpenAddRateModal(false);
  };

  const handleExportTaxReport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        ['LEDGERFLOW AUTOMATED TAX COMPLIANCE REPORT', companyProfile.name],
        ['Generated At', new Date().toISOString()],
        ['EIN / Tax ID', companyProfile.taxId],
        [],
        ['QUARTERLY SALES TAX AND ESTIMATED WITHHOLDING'],
        ['Quarter', 'Gross Sales', 'Taxable Sales', 'Sales Tax Collected', 'Input Tax Credits', 'Net Sales Tax Owed', 'Estimated Federal Tax', 'Estimated State Tax', 'Estimated SE Tax', 'Status'],
        ...quarterlyTaxSummaries.map((q) => [
          q.quarter,
          q.grossSales,
          q.taxableSales,
          q.salesTaxCollected,
          q.salesTaxPaidOnExpenses,
          q.netSalesTaxOwed,
          q.estimatedFederalIncomeTax,
          q.estimatedStateIncomeTax,
          q.estimatedSelfEmploymentTax,
          q.isRemitted ? 'REMITTED' : 'ACCRUED',
        ]),
        [],
        ['FORM 1099-NEC INDEPENDENT CONTRACTOR TRACKING'],
        ['Contractor Name', 'Tax ID', 'Total Paid YTD', 'Threshold Exceeded ($600)'],
        ...contractor1099Reports.map((c) => [
          c.vendorName,
          c.taxId,
          c.totalPaid,
          c.thresholdExceeded ? 'YES (1099 Required)' : 'NO',
        ]),
      ]
        .map((e) => e.join(','))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ledgerflow_tax_report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Automated Tax Center & Compliance
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Automated sales tax liability calculation, input tax credit offsets, quarterly estimated returns, and 1099-NEC audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportTaxReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200/90 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            Export Tax CSV
          </button>
          <button
            onClick={() => setIsOpenAddRateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Add Jurisdiction
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sales Tax Collected */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
            <span>Sales Tax Accrued (Liabilities 2050)</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif tracking-tight text-stone-900 tabular-nums">
            ${totalSalesTaxCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Collected on invoiced deliverables
          </div>
        </div>

        {/* Input Tax Credits */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
            <span>Input Tax Credits (Assets 1600)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif tracking-tight text-emerald-600 tabular-nums">
            -${totalSalesTaxPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Sales tax paid on business purchases
          </div>
        </div>

        {/* Net Tax Remittance Due */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">
            <span>Net Statutory Sales Tax Owed</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-serif tracking-tight text-stone-900 tabular-nums">
            ${netSalesTaxPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>CDTFA / State remittance</span>
            {netSalesTaxPayable > 0 && (
              <button
                onClick={() => setRemitModalQuarter(currentSummary.quarter)}
                className="text-emerald-700 font-semibold hover:underline"
              >
                Remit Now →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quarterly Tax Schedules & Filing Tracker */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Quarterly Tax Filing & Estimated Liability Schedule
            </h2>
            <p className="text-xs text-slate-500">
              Automatic calculation of sales tax liability, pass-through federal estimates, and self-employment tax.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            {quarterlyTaxSummaries.map((q) => (
              <button
                key={q.quarter}
                onClick={() => setSelectedQuarter(q.quarter)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  selectedQuarter === q.quarter
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {q.quarter}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Quarter Detailed Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Sales Tax Liability (State / County)
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Taxable Sales:</span>
                <span className="font-mono font-medium text-slate-900">${currentSummary.taxableSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sales Tax Collected:</span>
                <span className="font-mono text-slate-900">${currentSummary.salesTaxCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Input Tax Credit Offset:</span>
                <span className="font-mono text-emerald-700">-${currentSummary.salesTaxPaidOnExpenses.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Net Sales Tax Owed:</span>
                <span className="font-mono text-emerald-700">${currentSummary.netSalesTaxOwed.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Income & Self-Employment Estimates
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Federal Income Tax (18%):</span>
                <span className="font-mono font-medium text-slate-900">${currentSummary.estimatedFederalIncomeTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. California State Tax (7%):</span>
                <span className="font-mono font-medium text-slate-900">${currentSummary.estimatedStateIncomeTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Est. Self-Employment Tax (8%):</span>
                <span className="font-mono font-medium text-slate-900">${currentSummary.estimatedSelfEmploymentTax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Total Quarterly Reserve:</span>
                <span className="font-mono text-slate-900">${currentSummary.totalEstimatedTaxLiability.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Filing Status & Due Date
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="text-slate-600">
                  Statutory Due Date:{' '}
                  <strong className="text-slate-900 font-mono">{currentSummary.dueDate}</strong>
                </div>
                <div className="text-slate-600">
                  Form Target: <strong className="text-slate-900">CDTFA Form 401-A2 / IRS 1040-ES</strong>
                </div>
                <div className="mt-2">
                  Status:{' '}
                  {currentSummary.isRemitted ? (
                    <span className="font-semibold text-emerald-700">Remitted & Cleared</span>
                  ) : (
                    <span className="font-semibold text-amber-700">Accrued (Pending Remittance)</span>
                  )}
                </div>
              </div>
            </div>

            {!currentSummary.isRemitted && currentSummary.netSalesTaxOwed > 0 && (
              <button
                onClick={() => setRemitModalQuarter(currentSummary.quarter)}
                className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-semibold text-xs rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
              >
                File & Remit {currentSummary.quarter} Sales Tax
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Columns: Schedule C Deductions Audit & 1099 Contractor Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule C Expense Deductibility Audit */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                IRS Schedule C Deductions Audit
              </h2>
              <p className="text-xs text-slate-500">
                Statutory deductibility classification with 50% business meals haircut
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {scheduleCBreakdown.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{item.category}</div>
                  <div className="text-[11px] text-slate-500">{item.deductibility}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-slate-900 tabular-nums">
                    ${item.deductible.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  {item.gross !== item.deductible && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Gross: ${item.gross.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
            <span>Total Schedule C Deductible Expenses:</span>
            <span className="font-mono text-emerald-700 tabular-nums">
              ${totalDeductibleExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 1099-NEC Contractor Threshold Monitor */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                1099-NEC Independent Contractor Audit
              </h2>
              <p className="text-xs text-slate-500">
                Monitors annual threshold of $600 for non-employee compensation
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Threshold: $600.00
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {contractor1099Reports.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No 1099 contractor payments recorded yet.
              </div>
            ) : (
              contractor1099Reports.map((c) => (
                <div key={c.vendorId} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{c.vendorName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Tax ID: {c.taxId} · {c.transactionCount} payments
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      ${c.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    {c.thresholdExceeded ? (
                      <span className="text-[11px] font-semibold text-amber-700">
                        Form 1099-NEC Required
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Under $600 limit
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Filing deadline: January 31 following tax year. Copy A to IRS, Copy B to contractor.
          </div>
        </div>
      </div>

      {/* Configured Tax Rates Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Active Tax Jurisdictions & Rates
            </h2>
            <p className="text-xs text-slate-500">
              Standard rules applied to invoice line items and expense input credits
            </p>
          </div>
        </div>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200 font-semibold">
              <th className="py-2">Jurisdiction Name</th>
              <th className="py-2">Code</th>
              <th className="py-2 text-right">Tax Rate</th>
              <th className="py-2">Government Authority</th>
              <th className="py-2 text-center">Default</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {taxRates.map((tr) => (
              <tr key={tr.id} className="hover:bg-slate-50">
                <td className="py-2.5 font-medium text-slate-900">{tr.name}</td>
                <td className="py-2.5 font-mono text-slate-600">{tr.code}</td>
                <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                  {(tr.rate * 100).toFixed(3)}%
                </td>
                <td className="py-2.5 text-slate-600">{tr.authority}</td>
                <td className="py-2.5 text-center">
                  {tr.isDefault && (
                    <span className="text-emerald-700 font-semibold text-[11px]">
                      Default
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* REMIT TAX MODAL */}
      {remitModalQuarter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Remit {remitModalQuarter} Statutory Sales Tax
              </h3>
              <button
                onClick={() => setRemitModalQuarter(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              This action generates an audited double-entry journal entry to clear accrued Sales Tax Payable (2050), apply Input Tax Credits (1600), and credit cash.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Sales Tax Collected:</span>
                <span className="font-mono text-slate-900">${currentSummary.salesTaxCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Less Input Tax Offset:</span>
                <span className="font-mono text-emerald-700">-${currentSummary.salesTaxPaidOnExpenses.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Net Check Disbursed:</span>
                <span className="font-mono text-emerald-700">${currentSummary.netSalesTaxOwed.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disburse From Cash Account
              </label>
              <select
                value={remitAccount}
                onChange={(e) => setRemitAccount(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              >
                {accounts
                  .filter((a) => a.code.startsWith('10'))
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.code} - {acc.name} (${acc.balance.toFixed(2)})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remittance Date
              </label>
              <input
                type="date"
                value={remitDate}
                onChange={(e) => setRemitDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setRemitModalQuarter(null)}
                className="px-3 py-1.5 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  remitQuarterlyTax(remitModalQuarter, remitAccount, remitDate);
                  setRemitModalQuarter(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs"
              >
                Confirm Tax Remittance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TAX JURISDICTION MODAL */}
      {isOpenAddRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Add Tax Jurisdiction Rate
              </h3>
              <button
                onClick={() => setIsOpenAddRateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jurisdiction Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Washington State Combined"
                  value={newRateName}
                  onChange={(e) => setNewRateName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rate Percentage (%) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    placeholder="6.5"
                    value={newRatePercent}
                    onChange={(e) => setNewRatePercent(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tax Code
                  </label>
                  <input
                    type="text"
                    placeholder="WA-SALES-6.5"
                    value={newRateCode}
                    onChange={(e) => setNewRateCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tax Authority Agency
                </label>
                <input
                  type="text"
                  placeholder="e.g. Washington Dept of Revenue"
                  value={newRateAuthority}
                  onChange={(e) => setNewRateAuthority(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenAddRateModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md"
                >
                  Save Tax Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
