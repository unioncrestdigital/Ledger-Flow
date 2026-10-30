import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import {
  TrendingUp,
  Receipt,
  FileText,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Wallet,
  Building,
  CreditCard,
  Plus,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenQuickAdd: (type: 'invoice' | 'expense' | 'journal') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenQuickAdd }) => {
  const {
    totalCash,
    totalReceivables,
    totalPayables,
    totalRevenue,
    totalExpenses,
    netIncome,
    invoices,
    expenses,
    quarterlyTaxSummaries,
    contractor1099Reports,
    totalSalesTaxCollected,
    netSalesTaxPayable,
    accounts,
  } = useAccounting();

  const [selectedTimeframe, setSelectedTimeframe] = useState<'1M' | '3M' | '6M' | 'YTD' | 'ALL'>('3M');

  // Total Business Net Worth (Total Assets - Total Liabilities)
  const totalAssets = accounts
    .filter((a) => a.type === 'ASSET')
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => a.type === 'LIABILITY')
    .reduce((sum, a) => sum + a.balance, 0);
  const netWorth = totalAssets - totalLiabilities;

  const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');
  const pendingBills = expenses.filter((e) => e.status === 'PENDING');

  const savingsRate = totalRevenue > 0 ? Math.max(0, ((netIncome / totalRevenue) * 100)).toFixed(1) : '0.0';

  const currentQuarterTax = quarterlyTaxSummaries[quarterlyTaxSummaries.length - 1]; // Q4

  // Timeframe chart points for Monarch-style area chart
  const timeframeData: Record<string, { points: number[]; labels: string[]; change: string }> = {
    '1M': {
      points: [68200, 71400, 70800, 74200, 77500, netWorth],
      labels: ['Oct 1', 'Oct 7', 'Oct 14', 'Oct 21', 'Oct 28', 'Today'],
      change: '+$9,300 (+14.2%)',
    },
    '3M': {
      points: [52000, 58400, 61200, 67800, 71500, netWorth],
      labels: ['Aug', 'Late Aug', 'Sep', 'Late Sep', 'Oct', 'Current'],
      change: '+$25,500 (+49.0%)',
    },
    '6M': {
      points: [38000, 42500, 49000, 58400, 67800, netWorth],
      labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      change: '+$39,500 (+104%)',
    },
    'YTD': {
      points: [35000, 41200, 48000, 55400, 64200, netWorth],
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Current'],
      change: `+$${netIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })} (+121%)`,
    },
    'ALL': {
      points: [25000, 35000, 48000, 59000, 68000, netWorth],
      labels: ['2024', 'Q1 25', 'Q3 25', 'Q1 26', 'Q3 26', 'Today'],
      change: '+$52,500 (+210%)',
    },
  };

  const currentPoints = timeframeData[selectedTimeframe].points;
  const currentLabels = timeframeData[selectedTimeframe].labels;
  const currentChange = timeframeData[selectedTimeframe].change;

  // Generate SVG path for smooth Monarch-style area chart
  const minP = Math.min(...currentPoints) * 0.95;
  const maxP = Math.max(...currentPoints) * 1.05;
  const width = 640;
  const height = 140;

  const getCoordinates = (points: number[]) => {
    return points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - minP) / (maxP - minP)) * (height - 20) - 10;
      return { x, y };
    });
  };

  const coords = getCoordinates(currentPoints);
  const pathD = coords.reduce((acc, c, i) => {
    return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
  }, '');
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  // Merchant monogram initials & palette generator
  const getAvatarInfo = (name: string) => {
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    const colors = [
      { bg: 'bg-orange-50 text-orange-700 border-orange-200' },
      { bg: 'bg-blue-50 text-blue-700 border-blue-200' },
      { bg: 'bg-purple-50 text-purple-700 border-purple-200' },
      { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      { bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    ];
    const index = name.length % colors.length;
    return { initials, style: colors[index].bg };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Monarch Hero Net Worth & Liquidity Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider block">
              Enterprise Net Worth
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-stone-900 tabular-nums">
                ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {currentChange}
              </span>
            </div>
          </div>

          {/* Monarch Timeframe Selector Pill Group */}
          <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl text-xs font-semibold">
            {(['1M', '3M', '6M', 'YTD', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedTimeframe === tf
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Smooth Emerald Area Chart */}
        <div className="relative pt-2">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-32 sm:h-36 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="monarchGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#monarchGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke="#059669"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {coords.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={i === coords.length - 1 ? '4' : '2'}
                className={i === coords.length - 1 ? 'fill-[#059669] stroke-white stroke-2' : 'fill-[#059669] opacity-40'}
              />
            ))}
          </svg>

          {/* Timeline labels */}
          <div className="flex justify-between items-center text-[11px] text-stone-400 mt-2 font-mono">
            {currentLabels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>

        {/* Quick Micro-Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-stone-100 text-xs">
          <div>
            <span className="text-stone-400 block text-[11px]">Liquid Cash & Checking</span>
            <span className="font-bold font-serif text-stone-900 text-base tabular-nums">
              ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Uncollected Invoices (A/R)</span>
            <span className="font-bold font-serif text-stone-900 text-base tabular-nums">
              ${totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Pending Vendor Bills (A/P)</span>
            <span className="font-bold font-serif text-stone-900 text-base tabular-nums">
              ${totalPayables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">Accrued Tax Liability</span>
            <span className="font-bold font-serif text-stone-900 text-base tabular-nums">
              ${totalSalesTaxCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Monarch Cash Flow & Accounts Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monarch Cash Flow Widget */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
              <div>
                <h2 className="text-sm font-bold text-stone-900 font-serif">
                  Cash Flow (Income vs Operating Expenses)
                </h2>
                <p className="text-xs text-stone-500">
                  Total revenue recognized against operational expenditures
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                {savingsRate}% Profit Retention
              </span>
            </div>

            {/* Income Progress Bar */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Gross Revenue Billed
                  </span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-full" />
                </div>
              </div>

              {/* Expenses Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium text-stone-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Operating Expenses & Burn
                  </span>
                  <span className="font-mono font-bold text-stone-900 tabular-nums">
                    ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${totalRevenue > 0 ? Math.min(100, (totalExpenses / totalRevenue) * 100) : 0}%`,
                    }}
                    className="h-full bg-slate-400 rounded-full transition-all"
                  />
                </div>
              </div>

              {/* Net Profit Summary */}
              <div className="p-3.5 bg-stone-50/80 border border-stone-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500 block">YTD Net Operating Profit</span>
                  <span className="text-lg font-bold font-serif text-stone-900 tabular-nums">
                    ${netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate('reports')}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors shadow-2xs"
                >
                  View P&L Report →
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Accrual accounting basis</span>
            <span className="font-mono text-stone-400">LedgerFlow · Double-Entry</span>
          </div>
        </div>

        {/* Monarch Accounts Grouping List */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-serif">
                Accounts by Category
              </h2>
              <p className="text-xs text-stone-500">Real-time balances across bank and ledger accounts</p>
            </div>
            <button
              onClick={() => onNavigate('accounts')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              All Accounts →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Cash Accounts */}
            <div className="p-3 bg-stone-50/60 border border-stone-200/70 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  $
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Checking & Cash Reserves</div>
                  <div className="text-[11px] text-stone-500">2 depository accounts</div>
                </div>
              </div>
              <span className="font-mono font-bold text-stone-900 text-sm tabular-nums">
                ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Receivables */}
            <div className="p-3 bg-stone-50/60 border border-stone-200/70 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold">
                  AR
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Accounts Receivable</div>
                  <div className="text-[11px] text-stone-500">{unpaidInvoices.length} invoices awaiting payment</div>
                </div>
              </div>
              <span className="font-mono font-bold text-stone-900 text-sm tabular-nums">
                ${totalReceivables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Payables */}
            <div className="p-3 bg-stone-50/60 border border-stone-200/70 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                  AP
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Accounts Payable & Cards</div>
                  <div className="text-[11px] text-stone-500">{pendingBills.length} pending obligations</div>
                </div>
              </div>
              <span className="font-mono font-bold text-rose-600 text-sm tabular-nums">
                ${totalPayables.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Tax Obligations */}
            <div className="p-3 bg-stone-50/60 border border-stone-200/70 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                  TX
                </div>
                <div>
                  <div className="font-semibold text-stone-900">Sales Tax Reserve</div>
                  <div className="text-[11px] text-stone-500">CDTFA & Local Tax Accrual</div>
                </div>
              </div>
              <span className="font-mono font-bold text-stone-900 text-sm tabular-nums">
                ${totalSalesTaxCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Transactions Stream & Tax Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions Stream */}
        <div className="lg:col-span-2 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-serif">
                Recent Ledger Transactions
              </h2>
              <p className="text-xs text-stone-500">Audited double-entry customer receipts and expense vouchers</p>
            </div>
            <button
              onClick={() => onNavigate('journal')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All →
            </button>
          </div>

          <div className="divide-y divide-stone-100 text-xs">
            {[
              ...invoices.map((inv) => ({
                id: inv.id,
                name: inv.customerName,
                date: inv.issueDate,
                type: 'INVOICE' as const,
                status: inv.status,
                account: '1200 Accounts Receivable',
                amount: inv.total,
                isPositive: true,
              })),
              ...expenses.map((exp) => ({
                id: exp.id,
                name: exp.vendorName,
                date: exp.date,
                type: 'EXPENSE' as const,
                status: exp.status,
                account: exp.description,
                amount: exp.amount,
                isPositive: false,
              })),
            ]
              .sort((a, b) => (b.date > a.date ? 1 : -1))
              .slice(0, 5)
              .map((tx) => {
                const avatar = getAvatarInfo(tx.name);

                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-stone-50/50 rounded-lg px-1 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${avatar.style}`}
                      >
                        {avatar.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 truncate">
                          {tx.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate mt-0.5">
                          {tx.account} · <span className="font-mono">{tx.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-mono font-bold tabular-nums text-sm ${
                          tx.isPositive ? 'text-emerald-700' : 'text-stone-900'
                        }`}
                      >
                        {tx.isPositive ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {tx.type} · {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Col: Automated Tax Health in Emerald Style */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-stone-900 font-serif">
                  Quarterly Tax Reserve
                </h3>
              </div>
              <span className="text-[11px] font-mono font-semibold text-stone-500">
                {currentQuarterTax.quarter}
              </span>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Automated sales tax liability calculation with input tax credit offsets and quarterly estimated pass-through reserve.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl">
                <div className="flex justify-between text-stone-600 mb-1">
                  <span>Sales Tax Accrued:</span>
                  <span className="font-mono font-semibold text-stone-900">
                    ${totalSalesTaxCollected.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600 mb-1">
                  <span>Input Tax Credits Offset:</span>
                  <span className="font-mono font-medium text-emerald-700">
                    -${useAccounting().totalSalesTaxPaid.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 mt-1 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                  <span>Net Statutory Tax Owed:</span>
                  <span className="font-mono text-emerald-700">
                    ${netSalesTaxPayable.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 border border-stone-200/80 rounded-xl">
                <div className="flex justify-between text-stone-600 mb-1">
                  <span>Estimated Federal + State Q4:</span>
                  <span className="font-mono font-semibold text-stone-900">
                    ${currentQuarterTax.totalEstimatedTaxLiability.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500">
                  <span>Due Date: {currentQuarterTax.dueDate}</span>
                  <span className="text-stone-700 font-medium">Form 1040-ES</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100">
            <button
              onClick={() => onNavigate('taxes')}
              className="w-full py-2.5 text-xs font-semibold text-center text-white bg-[#059669] hover:bg-[#047857] rounded-xl transition-all shadow-xs shadow-emerald-600/20"
            >
              Open Tax Automation Center →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
