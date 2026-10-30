import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Expense, TaxDeductibility } from '../types/accounting';
import {
  Plus,
  Search,
  Receipt,
  DollarSign,
  Calendar,
  Trash2,
  CheckCircle2,
  X,
  Building,
  CreditCard,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ExpensesViewProps {
  isOpenCreateModal: boolean;
  onCloseCreateModal: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  isOpenCreateModal,
  onCloseCreateModal,
}) => {
  const {
    expenses,
    accounts,
    taxRates,
    addExpense,
    payBill,
    deleteExpense,
    totalPayables,
    totalSalesTaxPaid,
    contractor1099Reports,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [payBillModalExpense, setPayBillModalExpense] = useState<Expense | null>(null);
  const [billPaymentAccount, setBillPaymentAccount] = useState('acc-1010');

  // New Expense form state
  const [vendorName, setVendorName] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('acc-5010'); // Default Cloud Hosting
  const [paymentType, setPaymentType] = useState<'IMMEDIATE' | 'BILL'>('IMMEDIATE');
  const [paymentAccountId, setPaymentAccountId] = useState('acc-1010'); // Checking
  const [totalAmount, setTotalAmount] = useState('');
  const [taxRateId, setTaxRateId] = useState('tax-ca-standard');
  const [taxDeductibility, setTaxDeductibility] = useState<TaxDeductibility>('100_PERCENT');
  const [isContractor1099, setIsContractor1099] = useState(false);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');

  // Calculate tax amount automatically based on selected tax rate
  const selectedRateObj = taxRates.find((t) => t.id === taxRateId);
  const currentRate = selectedRateObj ? selectedRateObj.rate : 0;
  const numAmount = parseFloat(totalAmount) || 0;
  // If rate > 0, estimate tax portion assuming gross amount includes or calculates tax
  const calculatedTax = currentRate > 0 ? Math.round((numAmount * currentRate / (1 + currentRate)) * 100) / 100 : 0;

  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim()) {
      alert('Please enter a vendor name');
      return;
    }
    if (numAmount <= 0) {
      alert('Please enter a valid expense amount greater than 0.');
      return;
    }

    addExpense({
      vendorId: `vend-${Date.now()}`,
      vendorName: vendorName.trim(),
      date: expenseDate,
      accountId,
      paymentAccountId: paymentType === 'BILL' ? 'acc-2010' : paymentAccountId,
      amount: numAmount,
      taxRateId,
      taxAmount: calculatedTax,
      taxDeductibility,
      description: description.trim() || 'General business expense',
      reference: reference.trim(),
      status: paymentType === 'BILL' ? 'PENDING' : 'PAID',
      isContractor1099,
    });

    // Reset
    setVendorName('');
    setTotalAmount('');
    setDescription('');
    setReference('');
    setIsContractor1099(false);
    onCloseCreateModal();
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.reference && exp.reference.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || exp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFilteredSum = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Expenses & Accounts Payable
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track operational spending, input tax credits, vendor bills, and 1099 contractor payouts.
          </p>
        </div>

        <button
          onClick={onCloseCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Log Expense / Bill
        </button>
      </div>

      {/* Summary KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-stone-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">Total Operating Expenses</div>
          <div className="text-2xl font-bold font-serif tracking-tight text-stone-900 tabular-nums">
            ${totalFilteredSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            {expenses.length} total entries recorded
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-stone-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">Accounts Payable (Bills)</div>
          <div className="text-2xl font-bold font-serif tracking-tight text-rose-600 tabular-nums">
            ${totalPayables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Liabilities Account 2010
          </div>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-xs text-stone-400 mb-1 font-semibold uppercase tracking-wider text-[10px]">Input Tax Credits (Offset)</div>
          <div className="text-2xl font-bold font-serif tracking-tight text-emerald-600 tabular-nums">
            ${totalSalesTaxPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Reduces sales tax liability dollar-for-dollar
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200/90 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by vendor, memo, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl text-xs font-medium">
          {(['ALL', 'PAID', 'PENDING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {st === 'ALL' ? 'All Expenses' : st === 'PAID' ? 'Paid Cash/Card' : 'Pending Bills (A/P)'}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Category Account</th>
                <th className="py-3 px-4">Tax Deductibility</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Tax Credit</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No expense entries found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const targetAcc = accounts.find((a) => a.id === exp.accountId);

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-600 font-mono tabular-nums whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{exp.vendorName}</span>
                          {exp.isContractor1099 && (
                            <span className="text-[10px] font-mono text-purple-700 font-semibold">
                              [1099]
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">
                          {exp.description}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        {targetAcc ? `${targetAcc.code} - ${targetAcc.name}` : exp.accountId}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {exp.taxDeductibility === '50_PERCENT_MEALS' ? (
                          <span className="text-amber-700 font-medium">50% Meals Limit</span>
                        ) : exp.taxDeductibility === 'NON_DEDUCTIBLE' ? (
                          <span className="text-rose-600 font-medium">Non-Deductible</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">100% Deductible</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {exp.reference || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        {exp.taxAmount > 0 ? `$${exp.taxAmount.toFixed(2)}` : '$0.00'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        ${exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            exp.status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {exp.status === 'PAID' ? 'Paid' : 'Pending Bill'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                        {exp.status === 'PENDING' && (
                          <button
                            onClick={() => setPayBillModalExpense(exp)}
                            className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                          >
                            Pay Bill
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete expense ${exp.expenseNumber} and revoke linked double-entry journal entry?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EXPENSE MODAL */}
      {isOpenCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Log Business Expense or Bill
                </h2>
                <p className="text-xs text-slate-500">
                  Debits Expense Account and Input Tax Credit; credits Cash or Accounts Payable.
                </p>
              </div>
              <button
                onClick={onCloseCreateModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Payment Type: Immediate vs A/P Bill */}
              <div className="flex items-center gap-3 p-2 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentType('IMMEDIATE')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    paymentType === 'IMMEDIATE'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paid Immediately (Cash / Card)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('BILL')}
                  className={`flex-1 py-1.5 rounded-md transition-colors ${
                    paymentType === 'BILL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vendor Bill (Accounts Payable)
                </button>
              </div>

              {/* Vendor & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vendor / Payee *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Cloud, Google, Landlord"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Expense Category & Payment Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expense Account (Category) *
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                  >
                    {accounts
                      .filter((a) => a.type === 'EXPENSE')
                      .map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.code} - {acc.name}
                        </option>
                      ))}
                  </select>
                </div>

                {paymentType === 'IMMEDIATE' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Payment Account *
                    </label>
                    <select
                      value={paymentAccountId}
                      onChange={(e) => setPaymentAccountId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                    >
                      {accounts
                        .filter((a) => a.code.startsWith('10') || a.code === '2020')
                        .map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Liability Account
                    </label>
                    <div className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-300 rounded-md text-slate-700 font-mono">
                      2010 - Accounts Payable (A/P)
                    </div>
                  </div>
                )}
              </div>

              {/* Amount, Tax Rate, Tax Deductibility */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sales Tax Rate
                  </label>
                  <select
                    value={taxRateId}
                    onChange={(e) => setTaxRateId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md"
                  >
                    {taxRates.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.name} ({(tr.rate * 100).toFixed(1)}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax Deductibility
                  </label>
                  <select
                    value={taxDeductibility}
                    onChange={(e) => setTaxDeductibility(e.target.value as TaxDeductibility)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-md"
                  >
                    <option value="100_PERCENT">100% Business Deductible</option>
                    <option value="50_PERCENT_MEALS">50% Meals Limitation</option>
                    <option value="CAPITALIZED">Capitalized (Depreciation)</option>
                    <option value="NON_DEDUCTIBLE">Non-Deductible Expense</option>
                  </select>
                </div>
              </div>

              {/* Input Tax Credit Preview */}
              {calculatedTax > 0 && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs flex justify-between items-center text-emerald-800">
                  <span>Input Tax Credit Recognized (Account 1600):</span>
                  <span className="font-mono font-bold">${calculatedTax.toFixed(2)}</span>
                </div>
              )}

              {/* 1099 Contractor Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="contractor1099"
                  checked={isContractor1099}
                  onChange={(e) => setIsContractor1099(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                >
                </input>
                <label htmlFor="contractor1099" className="text-xs text-slate-700 font-medium">
                  Track for Form 1099-NEC (Independent Contractor Services $\ge \$600$)
                </label>
              </div>

              {/* Description & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice # / Receipt Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-9941, INV-44"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Memo / Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monthly server runtimes"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseCreateModal}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition-colors"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY BILL MODAL */}
      {payBillModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Disburse Payment for Vendor Bill
              </h3>
              <button
                onClick={() => setPayBillModalExpense(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Paying bill from <strong className="text-slate-900">{payBillModalExpense.vendorName}</strong>.
              This will debit Accounts Payable (2010) and credit your selected cash account.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${payBillModalExpense.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disburse From Account
              </label>
              <select
                value={billPaymentAccount}
                onChange={(e) => setBillPaymentAccount(e.target.value)}
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

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setPayBillModalExpense(null)}
                className="px-3 py-1.5 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  payBill(payBillModalExpense.id, billPaymentAccount);
                  setPayBillModalExpense(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs"
              >
                Confirm Bill Disbursement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
