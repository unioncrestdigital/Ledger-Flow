import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Invoice, InvoiceLineItem } from '../types/accounting';
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  Trash2,
  Eye,
  CheckCircle2,
  Printer,
  X,
  Clock,
  AlertTriangle,
} from 'lucide-react';

interface InvoicesViewProps {
  isOpenCreateModal: boolean;
  onCloseCreateModal: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  isOpenCreateModal,
  onCloseCreateModal,
}) => {
  const {
    invoices,
    taxRates,
    accounts,
    addInvoice,
    recordInvoicePayment,
    deleteInvoice,
    companyProfile,
    reaAgents,
  } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'SENT' | 'OVERDUE'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [paymentAccount, setPaymentAccount] = useState('acc-1010');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  // New Invoice Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('Payment due within 30 days. Remit via ACH wire.');

  const [items, setItems] = useState<Omit<InvoiceLineItem, 'id'>[]>([
    {
      description: 'Cloud Consulting & Architecture Services',
      quantity: 10,
      unitPrice: 180,
      taxRateId: taxRates[0]?.id || 'tax-ca-standard',
      amount: 1800,
      taxAmount: 1800 * (taxRates[0]?.rate || 0.0825),
    },
  ]);

  // Recalculate item amount & tax
  const updateItem = (index: number, field: string, val: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: val };

      const qty = field === 'quantity' ? Number(val) : current.quantity;
      const price = field === 'unitPrice' ? Number(val) : current.unitPrice;
      const rateObj = taxRates.find((t) => t.id === (field === 'taxRateId' ? val : current.taxRateId));
      const rate = rateObj ? rateObj.rate : 0;

      const sub = Math.round(qty * price * 100) / 100;
      const tax = Math.round(sub * rate * 100) / 100;

      current.amount = sub;
      current.taxAmount = tax;
      updated[index] = current;
      return updated;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        quantity: 1,
        unitPrice: 150,
        taxRateId: taxRates[0]?.id || 'tax-ca-standard',
        amount: 150,
        taxAmount: 150 * (taxRates[0]?.rate || 0.0825),
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const formSubtotal = items.reduce((s, it) => s + it.amount, 0);
  const formTaxTotal = items.reduce((s, it) => s + it.taxAmount, 0);
  const formTotal = formSubtotal + formTaxTotal;

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter a customer name');
      return;
    }
    if (items.length === 0 || formTotal <= 0) {
      alert('Please add at least one billable line item.');
      return;
    }

    const lineItems: InvoiceLineItem[] = items.map((it, idx) => ({
      ...it,
      id: `item-${Date.now()}-${idx}`,
    }));

    addInvoice({
      customerId: `cust-${Date.now()}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || 'accounting@client.com',
      issueDate,
      dueDate,
      items: lineItems,
      subtotal: Math.round(formSubtotal * 100) / 100,
      taxTotal: Math.round(formTaxTotal * 100) / 100,
      total: Math.round(formTotal * 100) / 100,
      notes,
    });

    // Reset and close
    setCustomerName('');
    setCustomerEmail('');
    onCloseCreateModal();
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Invoices & Accounts Receivable
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Automated double-entry customer billing, tax assessment, and cash receipts.
          </p>
        </div>

        <button
          onClick={onCloseCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Invoice
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200/90 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by invoice # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl text-xs font-medium">
          {(['ALL', 'SENT', 'PAID', 'OVERDUE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === st
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {st === 'ALL' ? 'All Invoices' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices High-Density Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Tax Accrued</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No invoices match your current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div>{inv.customerName}</div>
                      <div className="text-[11px] text-slate-600">{inv.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-mono tabular-nums">
                      {inv.issueDate}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-mono tabular-nums">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                      ${inv.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ${inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold ${
                          inv.status === 'PAID'
                            ? 'text-emerald-700'
                            : inv.status === 'OVERDUE'
                            ? 'text-rose-600'
                            : 'text-blue-700'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-right whitespace-nowrap space-x-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => setPaymentModalInvoice(inv)}
                          className="px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                        >
                          Record Payment
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                        title="View / Print"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete invoice ${inv.invoiceNumber} and its corresponding double-entry journal postings?`)) {
                            deleteInvoice(inv.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isOpenCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  New Customer Invoice
                </h2>
                <p className="text-xs text-slate-500">
                  Debits A/R (1200), credits Revenue (4010), and accrues Sales Tax (2050).
                </p>
              </div>
              <button
                onClick={onCloseCreateModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
              {/* Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nexus Innovations Inc."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    placeholder="billing@customer.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Line Items & Tax Breakdown
                  </span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800"
                  >
                    + Add Item Row
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md items-center text-xs"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <input
                          type="text"
                          required
                          placeholder="Description of deliverables / services"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-right font-mono"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Rate"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-right font-mono"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <select
                          value={item.taxRateId}
                          onChange={(e) => updateItem(idx, 'taxRateId', e.target.value)}
                          className="w-full px-1.5 py-1 bg-white border border-slate-300 rounded text-[11px]"
                        >
                          {taxRates.map((tr) => (
                            <option key={tr.id} value={tr.id}>
                              {tr.name} ({(tr.rate * 100).toFixed(2)}%)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-200 flex flex-col items-end gap-1 text-xs">
                <div className="flex justify-between w-64 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">${formSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 text-slate-600">
                  <span>Tax Total:</span>
                  <span className="font-mono tabular-nums">${formTaxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total Due:</span>
                  <span className="font-mono tabular-nums text-emerald-700">${formTotal.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Terms & Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-emerald-600 focus:outline-none"
                />
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
                >
                  Post & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Record Invoice Payment
              </h3>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Receiving payment for{' '}
              <strong className="text-slate-900">{paymentModalInvoice.invoiceNumber}</strong> from{' '}
              {paymentModalInvoice.customerName}.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Amount:</span>
                <span className="font-mono font-bold text-slate-900">
                  ${paymentModalInvoice.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sales Tax Included:</span>
                <span className="font-mono text-slate-700">
                  ${paymentModalInvoice.taxTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deposit Into Account (Debit Cash)
              </label>
              <select
                value={paymentAccount}
                onChange={(e) => setPaymentAccount(e.target.value)}
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
                Receipt Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="px-3 py-1.5 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  recordInvoicePayment(paymentModalInvoice.id, paymentAccount, paymentDate);
                  setPaymentModalInvoice(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-md shadow-xs"
              >
                Confirm Payment Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold text-slate-900">
                Invoice Preview ({selectedInvoice.invoiceNumber})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content */}
            <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800">
              {/* Header Letterhead */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    {companyProfile.name}
                  </h1>
                  <p className="text-slate-500 mt-1">{companyProfile.address}</p>
                  <p className="text-slate-500">{companyProfile.cityStateZip}</p>
                  <p className="text-slate-500 mt-1 font-mono">Tax EIN: {companyProfile.taxId}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-slate-900">
                    INVOICE
                  </div>
                  <div className="text-slate-600 font-mono mt-1 font-semibold">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="mt-2 text-slate-500">
                    Status:{' '}
                    <strong className={selectedInvoice.status === 'PAID' ? 'text-emerald-700' : 'text-slate-900'}>
                      {selectedInvoice.status}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Bill To & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                    Billed To:
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-1">
                    {selectedInvoice.customerName}
                  </div>
                  <div className="text-slate-500">{selectedInvoice.customerEmail}</div>
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <span className="text-slate-500">Issue Date:</span>{' '}
                    <span className="font-mono tabular-nums font-medium">{selectedInvoice.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Payment Due:</span>{' '}
                    <span className="font-mono tabular-nums font-semibold text-slate-900">{selectedInvoice.dueDate}</span>
                  </div>
                  {selectedInvoice.paidDate && (
                    <div>
                      <span className="text-emerald-700">Paid On:</span>{' '}
                      <span className="font-mono tabular-nums font-medium text-emerald-700">{selectedInvoice.paidDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 font-semibold text-left">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Tax</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((it) => (
                    <tr key={it.id}>
                      <td className="py-2.5 font-medium text-slate-900">{it.description}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">{it.quantity}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-700">${it.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-600">${it.taxAmount.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums font-semibold text-slate-900">${it.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Totals */}
              <div className="pt-4 border-t border-slate-200 flex flex-col items-end gap-1">
                <div className="flex justify-between w-64 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 text-slate-600">
                  <span>Sales Tax Total:</span>
                  <span className="font-mono tabular-nums">${selectedInvoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between w-64 text-base font-bold text-slate-900 pt-1 border-t border-slate-300">
                  <span>Total Due:</span>
                  <span className="font-mono tabular-nums text-emerald-700">${selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedInvoice.notes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <span className="font-semibold text-slate-700">Remittance Note:</span>
                  <p className="text-slate-600 mt-0.5">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
