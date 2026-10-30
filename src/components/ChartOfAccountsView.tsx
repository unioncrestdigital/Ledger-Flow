import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Account, AccountType } from '../types/accounting';
import {
  Layers,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const ChartOfAccountsView: React.FC = () => {
  const { accounts, addAccount, deleteAccount } = useAccounting();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('EXPENSE');
  const [subType, setSubType] = useState('Operating Expense');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      setFormError('Account code and name are required.');
      return;
    }

    if (accounts.some((a) => a.code === code.trim())) {
      setFormError(`Account code "${code}" already exists in the Chart of Accounts.`);
      return;
    }

    addAccount({
      code: code.trim(),
      name: name.trim(),
      type,
      subType: subType.trim() || type,
      description: description.trim(),
    });

    setCode('');
    setName('');
    setDescription('');
    setFormError(null);
    setIsOpenAddModal(false);
  };

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.code.includes(searchQuery) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.subType && acc.subType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || acc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const accountTypes: AccountType[] = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            Chart of Accounts
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Standard general ledger account hierarchy, normal balance conventions, and current balances.
          </p>
        </div>

        <button
          onClick={() => setIsOpenAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200/90 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search code or account title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-[#059669]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl text-xs overflow-x-auto font-medium">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedType === 'ALL' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            All Types
          </button>
          {accountTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-lg transition-all ${
                selectedType === t ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}s
            </button>
          ))}
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4 w-24">Code</th>
                <th className="py-3 px-4">Account Title</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4">Sub-Category</th>
                <th className="py-3 px-4">Normal Balance</th>
                <th className="py-3 px-4 text-right">Current Ledger Balance</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => {
                const isDebitNormal = acc.type === 'ASSET' || acc.type === 'EXPENSE';

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {acc.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{acc.name}</div>
                      {acc.description && (
                        <div className="text-[11px] text-slate-500">{acc.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-medium">{acc.type}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {acc.subType || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {isDebitNormal ? 'DEBIT' : 'CREDIT'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {!acc.isSystem && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete account ${acc.code} - ${acc.name}?`)) {
                              const res = deleteAccount(acc.id);
                              if (!res.success) alert(res.error);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {acc.isSystem && (
                        <span className="text-[11px] text-slate-400">System</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ACCOUNT MODAL */}
      {isOpenAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Add New Chart of Accounts Entry
              </h3>
              <button
                onClick={() => setIsOpenAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Account Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5090"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Classification *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md"
                  >
                    {accountTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Account Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Training & Development"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Sub-Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Operating Expenses"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="Accounting description for transaction categorization"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpenAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
