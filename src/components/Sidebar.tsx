import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  BookOpen,
  Scale,
  TrendingUp,
  Layers,
  Database,
  Building,
  CheckCircle2,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  activeView: string;
  onSelectView: (view: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { isTrialBalanceBalanced, netIncome, totalCash, totalReceivables, totalPayables, totalSalesTaxCollected } = useAccounting();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices & A/R', icon: FileText },
    { id: 'expenses', label: 'Expenses & A/P', icon: Receipt },
    { id: 'journal', label: 'General Ledger', icon: BookOpen },
    { id: 'taxes', label: 'Tax Center', icon: Scale },
    { id: 'reports', label: 'Reports & P&L', icon: TrendingUp },
    { id: 'accounts', label: 'Accounts', icon: Layers },
    { id: 'rea', label: 'REA Engine', icon: Database },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-stone-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-40 h-full lg:h-[calc(100vh-57px)] w-64 bg-[#0B1313] text-stone-300 flex flex-col justify-between shrink-0 transition-transform duration-200 ease-in-out border-r border-emerald-950/40 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col overflow-y-auto px-3.5 py-5">
          {/* Mobile Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800 lg:hidden">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="sm" showSelector={false} />
              <span className="text-sm font-serif font-bold text-white tracking-tight">LedgerFlow</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="text-xs text-stone-400 hover:text-white px-2 py-1"
            >
              Close
            </button>
          </div>

          <div className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider px-3 mb-2.5">
            Navigation
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#059669] text-white font-semibold shadow-xs shadow-emerald-500/20'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                </button>
              );
            })}
          </nav>

          {/* Accounts Summary in Sidebar */}
          <div className="mt-6 pt-4 border-t border-stone-800/80">
            <div className="text-[10px] font-semibold text-emerald-400/80 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
              <span>Account Balances</span>
              <span className="text-[9px] text-emerald-400 font-mono">LIVE</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <button
                onClick={() => onSelectView('accounts')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-stone-800/40 text-left transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-stone-300 group-hover:text-white">Cash & Bank</span>
                </div>
                <span className="font-mono text-[11px] text-stone-200 tabular-nums">
                  ${totalCash.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </button>

              <button
                onClick={() => onSelectView('invoices')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-stone-800/40 text-left transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span className="text-stone-300 group-hover:text-white">Receivables</span>
                </div>
                <span className="font-mono text-[11px] text-stone-200 tabular-nums">
                  ${totalReceivables.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </button>

              <button
                onClick={() => onSelectView('expenses')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-stone-800/40 text-left transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-stone-300 group-hover:text-white">Bills & Payables</span>
                </div>
                <span className="font-mono text-[11px] text-stone-200 tabular-nums">
                  ${totalPayables.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </button>

              <button
                onClick={() => onSelectView('taxes')}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-stone-800/40 text-left transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-stone-300 group-hover:text-white">Tax Reserve</span>
                </div>
                <span className="font-mono text-[11px] text-stone-200 tabular-nums">
                  ${totalSalesTaxCollected.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer with Net Operating Profit indicator */}
        <div className="p-4 border-t border-stone-800/80 bg-[#070E0E]/80">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 uppercase font-mono">Net Operating Profit</span>
              <span className="text-sm font-bold font-serif text-white tabular-nums tracking-tight">
                ${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Building className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

