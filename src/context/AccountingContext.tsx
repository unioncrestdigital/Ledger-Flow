import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Account,
  JournalEntry,
  TaxRate,
  Invoice,
  Expense,
  ReaResource,
  ReaEvent,
  ReaAgent,
  QuarterlyTaxSummary,
  JournalLine,
} from '../types/accounting';
import { DEFAULT_ACCOUNTS, DEFAULT_TAX_RATES } from '../data/defaultAccounts';
import {
  INITIAL_AGENTS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_REA_EVENTS,
  INITIAL_RESOURCES,
} from '../data/sampleData';

interface CompanyProfile {
  name: string;
  dba: string;
  taxId: string;
  address: string;
  cityStateZip: string;
  phone: string;
  email: string;
  currency: string;
  fiscalYearStartMonth: number; // 1 = January
}

interface Contractor1099Report {
  vendorId: string;
  vendorName: string;
  taxId: string;
  totalPaid: number;
  thresholdExceeded: boolean; // >= $600 threshold
  transactionCount: number;
}

interface AccountingContextType {
  // Core Entities
  accounts: Account[];
  taxRates: TaxRate[];
  invoices: Invoice[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  reaResources: ReaResource[];
  reaEvents: ReaEvent[];
  reaAgents: ReaAgent[];
  companyProfile: CompanyProfile;

  // Key Financial Metrics
  totalCash: number;
  totalReceivables: number;
  totalPayables: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  isTrialBalanceBalanced: boolean;
  trialBalanceDifference: number;
  totalTrialDebits: number;
  totalTrialCredits: number;

  // Tax Metrics
  activeTaxRate: TaxRate;
  quarterlyTaxSummaries: QuarterlyTaxSummary[];
  contractor1099Reports: Contractor1099Report[];
  totalSalesTaxCollected: number;
  totalSalesTaxPaid: number;
  netSalesTaxPayable: number;

  // Actions
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'journalEntryId' | 'paymentJournalEntryId'>) => Invoice;
  recordInvoicePayment: (invoiceId: string, paymentAccountId: string, paymentDate?: string) => void;
  deleteInvoice: (invoiceId: string) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'expenseNumber' | 'journalEntryId'>) => Expense;
  payBill: (expenseId: string, paymentAccountId: string, paymentDate?: string) => void;
  deleteExpense: (expenseId: string) => void;

  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'entryNumber'>) => { success: boolean; error?: string; entry?: JournalEntry };
  deleteJournalEntry: (id: string) => void;

  addAccount: (account: Omit<Account, 'id' | 'balance'>) => Account;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => { success: boolean; error?: string };

  addTaxRate: (rate: Omit<TaxRate, 'id'>) => TaxRate;
  updateTaxRate: (id: string, rate: Partial<TaxRate>) => void;

  remitQuarterlyTax: (quarterName: string, paymentAccountId: string, date: string) => boolean;

  resetToSampleData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'ledgerflow_accounting_v1';

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: 'Apex Cloud & Architecture LLC',
  dba: 'Apex Systems',
  taxId: '84-2910481',
  address: '555 Mission Street, Suite 2400',
  cityStateZip: 'San Francisco, CA 94105',
  phone: '(415) 890-4420',
  email: 'finance@apexcloud.io',
  currency: 'USD',
  fiscalYearStartMonth: 1,
};

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage if present, otherwise sample data
  const [baseAccounts, setBaseAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
  });

  const [taxRates, setTaxRates] = useState<TaxRate[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_tax_rates`);
    return saved ? JSON.parse(saved) : DEFAULT_TAX_RATES;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_journal_entries`);
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  const [reaResources] = useState<ReaResource[]>(INITIAL_RESOURCES);
  const [reaEvents, setReaEvents] = useState<ReaEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rea_events`);
    return saved ? JSON.parse(saved) : INITIAL_REA_EVENTS;
  });

  const [reaAgents, setReaAgents] = useState<ReaAgent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_rea_agents`);
    return saved ? JSON.parse(saved) : INITIAL_AGENTS;
  });

  const [companyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY_PROFILE);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(baseAccounts));
  }, [baseAccounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_tax_rates`, JSON.stringify(taxRates));
  }, [taxRates]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_journal_entries`, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rea_events`, JSON.stringify(reaEvents));
  }, [reaEvents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_rea_agents`, JSON.stringify(reaAgents));
  }, [reaAgents]);

  // Compute dynamic account balances based on all journal entries
  const accounts = useMemo(() => {
    // Map accountId -> { totalDebit: number, totalCredit: number }
    const accountTotals: Record<string, { debit: number; credit: number }> = {};

    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (!accountTotals[line.accountId]) {
          accountTotals[line.accountId] = { debit: 0, credit: 0 };
        }
        accountTotals[line.accountId].debit += line.debit || 0;
        accountTotals[line.accountId].credit += line.credit || 0;
      });
    });

    return baseAccounts.map((acc) => {
      const totals = accountTotals[acc.id] || { debit: 0, credit: 0 };
      let computedBalance = 0;

      // Normal balance rule:
      // ASSET & EXPENSE normal balance is DEBIT: Debit - Credit
      // LIABILITY, EQUITY, REVENUE normal balance is CREDIT: Credit - Debit
      if (acc.type === 'ASSET' || acc.type === 'EXPENSE') {
        computedBalance = totals.debit - totals.credit;
      } else {
        computedBalance = totals.credit - totals.debit;
      }

      return {
        ...acc,
        balance: Math.round(computedBalance * 100) / 100,
      };
    });
  }, [baseAccounts, journalEntries]);

  // Compute Trial Balance parity
  const { totalTrialDebits, totalTrialCredits, isTrialBalanceBalanced, trialBalanceDifference } = useMemo(() => {
    let totalD = 0;
    let totalC = 0;

    journalEntries.forEach((entry) => {
      entry.lines.forEach((line) => {
        totalD += Number(line.debit || 0);
        totalC += Number(line.credit || 0);
      });
    });

    const roundedD = Math.round(totalD * 100) / 100;
    const roundedC = Math.round(totalC * 100) / 100;
    const diff = Math.round(Math.abs(roundedD - roundedC) * 100) / 100;

    return {
      totalTrialDebits: roundedD,
      totalTrialCredits: roundedC,
      isTrialBalanceBalanced: diff < 0.01,
      trialBalanceDifference: diff,
    };
  }, [journalEntries]);

  // High-level financial KPIs
  const totalCash = useMemo(() => {
    return accounts
      .filter((a) => a.code === '1010' || a.code === '1020')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const totalReceivables = useMemo(() => {
    const arAcc = accounts.find((a) => a.code === '1200');
    return arAcc ? arAcc.balance : 0;
  }, [accounts]);

  const totalPayables = useMemo(() => {
    const apAcc = accounts.find((a) => a.code === '2010');
    return apAcc ? apAcc.balance : 0;
  }, [accounts]);

  const totalRevenue = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'REVENUE')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const totalExpenses = useMemo(() => {
    return accounts
      .filter((a) => a.type === 'EXPENSE')
      .reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const netIncome = useMemo(() => {
    return Math.round((totalRevenue - totalExpenses) * 100) / 100;
  }, [totalRevenue, totalExpenses]);

  // Tax calculations
  const activeTaxRate = useMemo(() => {
    return taxRates.find((t) => t.isDefault) || taxRates[0];
  }, [taxRates]);

  const { totalSalesTaxCollected, totalSalesTaxPaid, netSalesTaxPayable } = useMemo(() => {
    const taxPayableAcc = accounts.find((a) => a.code === '2050');
    const taxInputAcc = accounts.find((a) => a.code === '1600');

    const collected = taxPayableAcc ? taxPayableAcc.balance : 0;
    const paid = taxInputAcc ? taxInputAcc.balance : 0;
    const net = Math.round((collected - paid) * 100) / 100;

    return {
      totalSalesTaxCollected: collected,
      totalSalesTaxPaid: paid,
      netSalesTaxPayable: net,
    };
  }, [accounts]);

  // 1099 Contractor Report
  const contractor1099Reports = useMemo(() => {
    const contractorMap: Record<string, { total: number; count: number }> = {};

    expenses
      .filter((e) => e.isContractor1099)
      .forEach((e) => {
        if (!contractorMap[e.vendorId]) {
          contractorMap[e.vendorId] = { total: 0, count: 0 };
        }
        contractorMap[e.vendorId].total += e.amount;
        contractorMap[e.vendorId].count += 1;
      });

    return Object.entries(contractorMap).map(([vendorId, data]) => {
      const agent = reaAgents.find((a) => a.id === vendorId);
      return {
        vendorId,
        vendorName: agent?.name || 'Unknown Contractor',
        taxId: agent?.taxId || 'W-9 Pending',
        totalPaid: Math.round(data.total * 100) / 100,
        thresholdExceeded: data.total >= 600,
        transactionCount: data.count,
      };
    });
  }, [expenses, reaAgents]);

  // Quarterly Tax Summaries for Current Year (2026)
  const quarterlyTaxSummaries = useMemo(() => {
    const quarters = [
      { quarter: 'Q1 2026', start: '2026-01-01', end: '2026-03-31', due: '2026-04-15' },
      { quarter: 'Q2 2026', start: '2026-04-01', end: '2026-06-30', due: '2026-06-15' },
      { quarter: 'Q3 2026', start: '2026-07-01', end: '2026-09-30', due: '2026-09-15' },
      { quarter: 'Q4 2026', start: '2026-10-01', end: '2026-12-31', due: '2027-01-15' },
    ];

    return quarters.map((q) => {
      // Filter invoices in quarter
      const qInvoices = invoices.filter((inv) => inv.issueDate >= q.start && inv.issueDate <= q.end);
      const grossSales = qInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const taxableSales = qInvoices
        .filter((inv) => inv.taxTotal > 0)
        .reduce((sum, inv) => sum + inv.subtotal, 0);
      const salesTaxCollected = qInvoices.reduce((sum, inv) => sum + inv.taxTotal, 0);

      // Filter expenses in quarter
      const qExpenses = expenses.filter((exp) => exp.date >= q.start && exp.date <= q.end);
      const salesTaxPaidOnExpenses = qExpenses.reduce((sum, exp) => sum + exp.taxAmount, 0);
      const netSalesTaxOwed = Math.max(0, salesTaxCollected - salesTaxPaidOnExpenses);

      // Calculate deductible expenses (50% rule for meals)
      const totalDeductibleExpenses = qExpenses.reduce((sum, exp) => {
        if (exp.taxDeductibility === '50_PERCENT_MEALS') {
          return sum + (exp.amount - exp.taxAmount) * 0.5;
        }
        if (exp.taxDeductibility === 'NON_DEDUCTIBLE') {
          return sum;
        }
        return sum + (exp.amount - exp.taxAmount);
      }, 0);

      const netTaxableIncome = Math.max(0, grossSales - salesTaxCollected - totalDeductibleExpenses);

      // Tax estimates: 21% federal corporate/pass-through effective, 8.84% state, 15.3% SE tax if applicable
      const estimatedFederalIncomeTax = Math.round(netTaxableIncome * 0.18 * 100) / 100;
      const estimatedStateIncomeTax = Math.round(netTaxableIncome * 0.07 * 100) / 100;
      const estimatedSelfEmploymentTax = Math.round(netTaxableIncome * 0.08 * 100) / 100;
      const totalEstimatedTaxLiability =
        netSalesTaxOwed + estimatedFederalIncomeTax + estimatedStateIncomeTax + estimatedSelfEmploymentTax;

      // Check if tax was remitted for this quarter via journal entries
      const isRemitted = journalEntries.some(
        (je) => je.source === 'TAX_PAYMENT' && je.reference?.includes(q.quarter)
      );

      return {
        quarter: q.quarter,
        startDate: q.start,
        endDate: q.end,
        dueDate: q.due,
        grossSales: Math.round(grossSales * 100) / 100,
        taxableSales: Math.round(taxableSales * 100) / 100,
        salesTaxCollected: Math.round(salesTaxCollected * 100) / 100,
        salesTaxPaidOnExpenses: Math.round(salesTaxPaidOnExpenses * 100) / 100,
        netSalesTaxOwed: Math.round(netSalesTaxOwed * 100) / 100,
        totalDeductibleExpenses: Math.round(totalDeductibleExpenses * 100) / 100,
        netTaxableIncome: Math.round(netTaxableIncome * 100) / 100,
        estimatedFederalIncomeTax,
        estimatedStateIncomeTax,
        estimatedSelfEmploymentTax,
        totalEstimatedTaxLiability: Math.round(totalEstimatedTaxLiability * 100) / 100,
        isRemitted,
      };
    });
  }, [invoices, expenses, journalEntries]);

  // ACTIONS

  // Add Invoice & generate double-entry journal entry
  const addInvoice = (
    data: Omit<Invoice, 'id' | 'invoiceNumber' | 'status' | 'journalEntryId' | 'paymentJournalEntryId'>
  ) => {
    const id = `inv-${Date.now()}`;
    const invoiceNumber = `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const jeId = `je-${id}`;
    const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;

    // Ensure customer exists in REA agents
    let customerAgent = reaAgents.find((a) => a.id === data.customerId || a.name.toLowerCase() === data.customerName.toLowerCase());
    if (!customerAgent) {
      customerAgent = {
        id: data.customerId || `cust-${Date.now()}`,
        name: data.customerName,
        type: 'CUSTOMER',
        email: data.customerEmail,
      };
      setReaAgents((prev) => [...prev, customerAgent!]);
    }

    // Double Entry Lines for Invoice Billing:
    // Debit: Accounts Receivable (1200) for TOTAL amount
    // Credit: Consulting/Services Revenue (4010) for SUBTOTAL
    // Credit: Sales Tax Payable (2050) for TAX TOTAL (if > 0)
    const lines: JournalLine[] = [
      {
        id: `jl-${jeId}-1`,
        accountId: 'acc-1200', // A/R
        debit: data.total,
        credit: 0,
        memo: `Invoice ${invoiceNumber} billed to ${data.customerName}`,
      },
      {
        id: `jl-${jeId}-2`,
        accountId: 'acc-4010', // Consulting Revenue
        debit: 0,
        credit: data.subtotal,
        memo: `Revenue recognized for invoice ${invoiceNumber}`,
      },
    ];

    if (data.taxTotal > 0) {
      lines.push({
        id: `jl-${jeId}-3`,
        accountId: 'acc-2050', // Sales Tax Payable
        debit: 0,
        credit: data.taxTotal,
        memo: `Sales tax collected on ${invoiceNumber}`,
      });
    }

    const newJournalEntry: JournalEntry = {
      id: jeId,
      entryNumber: jeNumber,
      date: data.issueDate,
      description: `Invoice ${invoiceNumber} issued to ${data.customerName}`,
      reference: invoiceNumber,
      source: 'INVOICE',
      lines,
    };

    // REA Event: Economic Inflow expectation / Service Rendered
    const reaEvent: ReaEvent = {
      id: `rea-${id}`,
      date: data.issueDate,
      eventType: 'SERVICE_RENDERED',
      resourceId: 'res-services',
      resourceDelta: -data.subtotal,
      internalAgentId: 'agent-internal-owner',
      externalAgentId: customerAgent.id,
      journalEntryId: jeId,
      memo: `Delivered billed services on invoice ${invoiceNumber}`,
    };

    const newInvoice: Invoice = {
      ...data,
      id,
      invoiceNumber,
      status: 'SENT',
      journalEntryId: jeId,
    };

    setJournalEntries((prev) => [...prev, newJournalEntry]);
    setReaEvents((prev) => [...prev, reaEvent]);
    setInvoices((prev) => [newInvoice, ...prev]);

    return newInvoice;
  };

  // Record payment for an invoice
  const recordInvoicePayment = (invoiceId: string, paymentAccountId: string, paymentDate?: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === 'PAID') return;

    const date = paymentDate || new Date().toISOString().split('T')[0];
    const payJeId = `je-pay-${inv.id}`;
    const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;

    // Double Entry for receiving payment:
    // Debit: Cash/Checking (e.g. 1010)
    // Credit: Accounts Receivable (1200)
    const lines: JournalLine[] = [
      {
        id: `jl-${payJeId}-1`,
        accountId: paymentAccountId, // Checking/Cash
        debit: inv.total,
        credit: 0,
        memo: `Payment received for ${inv.invoiceNumber}`,
      },
      {
        id: `jl-${payJeId}-2`,
        accountId: 'acc-1200', // A/R
        debit: 0,
        credit: inv.total,
        memo: `Relieve Accounts Receivable for ${inv.invoiceNumber}`,
      },
    ];

    const payJournalEntry: JournalEntry = {
      id: payJeId,
      entryNumber: jeNumber,
      date,
      description: `Payment received for ${inv.invoiceNumber} from ${inv.customerName}`,
      reference: inv.invoiceNumber,
      source: 'PAYMENT_RECEIVED',
      lines,
    };

    // REA Event: Cash Inflow paired with prior service rendered (Economic Duality!)
    const reaCashEvent: ReaEvent = {
      id: `rea-pay-${inv.id}`,
      date,
      eventType: 'CASH_INFLOW',
      resourceId: 'res-cash',
      resourceDelta: inv.total,
      internalAgentId: 'agent-internal-owner',
      externalAgentId: inv.customerId,
      dualEventId: inv.journalEntryId,
      journalEntryId: payJeId,
      memo: `Cash collected in full for invoice ${inv.invoiceNumber}`,
    };

    setJournalEntries((prev) => [...prev, payJournalEntry]);
    setReaEvents((prev) => [...prev, reaCashEvent]);
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? { ...i, status: 'PAID', paidDate: date, paymentJournalEntryId: payJeId }
          : i
      )
    );
  };

  // Delete invoice
  const deleteInvoice = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    // Remove linked journal entries
    const jeIdsToDelete = [inv.journalEntryId, inv.paymentJournalEntryId].filter(Boolean);
    setJournalEntries((prev) => prev.filter((je) => !jeIdsToDelete.includes(je.id)));
    setReaEvents((prev) => prev.filter((re) => !jeIdsToDelete.includes(re.journalEntryId)));
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
  };

  // Add Expense & generate double-entry journal entry
  const addExpense = (data: Omit<Expense, 'id' | 'expenseNumber' | 'journalEntryId'>) => {
    const id = `exp-${Date.now()}`;
    const expenseNumber = `EXP-2026-${String(expenses.length + 1).padStart(3, '0')}`;
    const jeId = `je-${id}`;
    const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;

    // Ensure vendor in REA agents
    let vendorAgent = reaAgents.find((a) => a.id === data.vendorId || a.name.toLowerCase() === data.vendorName.toLowerCase());
    if (!vendorAgent) {
      vendorAgent = {
        id: data.vendorId || `vend-${Date.now()}`,
        name: data.vendorName,
        type: 'VENDOR',
      };
      setReaAgents((prev) => [...prev, vendorAgent!]);
    }

    const netExpenseAmount = Math.round((data.amount - (data.taxAmount || 0)) * 100) / 100;
    const isPendingBill = data.status === 'PENDING';

    // Double Entry for Expense:
    // Debit: Target Expense Account (e.g. 5010 Cloud, 5020 Contractor) for net amount
    // Debit: Sales Tax Input Credit (1600) for tax amount (if recoverable tax)
    // Credit: Cash/Checking (1010) or Credit Card (2020) if PAID; or Accounts Payable (2010) if PENDING
    const creditAccountId = isPendingBill ? 'acc-2010' : data.paymentAccountId;

    const lines: JournalLine[] = [
      {
        id: `jl-${jeId}-1`,
        accountId: data.accountId,
        debit: netExpenseAmount,
        credit: 0,
        memo: `${data.description} (${data.vendorName})`,
      },
    ];

    if (data.taxAmount > 0) {
      lines.push({
        id: `jl-${jeId}-2`,
        accountId: 'acc-1600', // Sales Tax Input Credit
        debit: data.taxAmount,
        credit: 0,
        memo: `Recoverable sales tax on ${expenseNumber}`,
      });
    }

    lines.push({
      id: `jl-${jeId}-3`,
      accountId: creditAccountId,
      debit: 0,
      credit: data.amount,
      memo: isPendingBill ? `A/P bill for ${data.vendorName}` : `Paid via ${data.paymentAccountId}`,
    });

    const newJournalEntry: JournalEntry = {
      id: jeId,
      entryNumber: jeNumber,
      date: data.date,
      description: `${data.vendorName}: ${data.description}`,
      reference: data.reference || expenseNumber,
      source: isPendingBill ? 'BILL' : 'EXPENSE',
      lines,
    };

    // REA Event: Cash Outflow / Service Acquired
    const reaEvent: ReaEvent = {
      id: `rea-${id}`,
      date: data.date,
      eventType: isPendingBill ? 'SERVICE_ACQUIRED' : 'CASH_OUTFLOW',
      resourceId: isPendingBill ? 'res-services' : 'res-cash',
      resourceDelta: isPendingBill ? data.amount : -data.amount,
      internalAgentId: 'agent-internal-owner',
      externalAgentId: vendorAgent.id,
      journalEntryId: jeId,
      memo: `Acquired goods/services from ${data.vendorName}`,
    };

    const newExpense: Expense = {
      ...data,
      id,
      expenseNumber,
      journalEntryId: jeId,
    };

    setJournalEntries((prev) => [...prev, newJournalEntry]);
    setReaEvents((prev) => [...prev, reaEvent]);
    setExpenses((prev) => [newExpense, ...prev]);

    return newExpense;
  };

  // Pay pending bill
  const payBill = (expenseId: string, paymentAccountId: string, paymentDate?: string) => {
    const exp = expenses.find((e) => e.id === expenseId);
    if (!exp || exp.status === 'PAID') return;

    const date = paymentDate || new Date().toISOString().split('T')[0];
    const payJeId = `je-billpay-${exp.id}`;
    const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;

    // Double Entry for Bill Payment:
    // Debit: Accounts Payable (2010)
    // Credit: Checking/Cash (e.g. 1010)
    const lines: JournalLine[] = [
      {
        id: `jl-${payJeId}-1`,
        accountId: 'acc-2010', // A/P
        debit: exp.amount,
        credit: 0,
        memo: `Relieve A/P bill for ${exp.vendorName}`,
      },
      {
        id: `jl-${payJeId}-2`,
        accountId: paymentAccountId,
        debit: 0,
        credit: exp.amount,
        memo: `Payment disbursed for bill ${exp.expenseNumber}`,
      },
    ];

    const billPayJournalEntry: JournalEntry = {
      id: payJeId,
      entryNumber: jeNumber,
      date,
      description: `Bill payment for ${exp.vendorName} (${exp.reference || exp.expenseNumber})`,
      reference: exp.expenseNumber,
      source: 'EXPENSE',
      lines,
    };

    const reaPayEvent: ReaEvent = {
      id: `rea-billpay-${exp.id}`,
      date,
      eventType: 'CASH_OUTFLOW',
      resourceId: 'res-cash',
      resourceDelta: -exp.amount,
      internalAgentId: 'agent-internal-owner',
      externalAgentId: exp.vendorId,
      journalEntryId: payJeId,
      memo: `Cash disbursed for accounts payable obligation to ${exp.vendorName}`,
    };

    setJournalEntries((prev) => [...prev, billPayJournalEntry]);
    setReaEvents((prev) => [...prev, reaPayEvent]);
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === expenseId ? { ...e, status: 'PAID', paymentAccountId } : e
      )
    );
  };

  // Delete expense
  const deleteExpense = (expenseId: string) => {
    const exp = expenses.find((e) => e.id === expenseId);
    if (!exp) return;

    setJournalEntries((prev) => prev.filter((je) => je.id !== exp.journalEntryId));
    setReaEvents((prev) => prev.filter((re) => re.journalEntryId !== exp.journalEntryId));
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  };

  // Add Manual Journal Entry with validation
  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'entryNumber'>) => {
    const totalDebit = entry.lines.reduce((sum, l) => sum + Number(l.debit || 0), 0);
    const totalCredit = entry.lines.reduce((sum, l) => sum + Number(l.credit || 0), 0);

    const roundedD = Math.round(totalDebit * 100) / 100;
    const roundedC = Math.round(totalCredit * 100) / 100;

    if (Math.abs(roundedD - roundedC) > 0.01) {
      return {
        success: false,
        error: `Journal entry is out of balance. Total Debits: $${roundedD.toFixed(2)}, Total Credits: $${roundedC.toFixed(2)}. Difference: $${Math.abs(roundedD - roundedC).toFixed(2)}.`,
      };
    }

    if (entry.lines.length < 2) {
      return {
        success: false,
        error: 'Double-entry bookkeeping requires at least 2 lines (at least 1 debit and 1 credit).',
      };
    }

    const id = `je-${Date.now()}`;
    const entryNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;

    const newEntry: JournalEntry = {
      ...entry,
      id,
      entryNumber,
      source: 'MANUAL',
    };

    setJournalEntries((prev) => [newEntry, ...prev]);
    return { success: true, entry: newEntry };
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((je) => je.id !== id));
    setReaEvents((prev) => prev.filter((re) => re.journalEntryId !== id));
  };

  // Account management
  const addAccount = (accountData: Omit<Account, 'id' | 'balance'>) => {
    const newAccount: Account = {
      ...accountData,
      id: `acc-${Date.now()}`,
      balance: 0,
      isSystem: false,
    };
    setBaseAccounts((prev) => [...prev, newAccount]);
    return newAccount;
  };

  const updateAccount = (id: string, accountData: Partial<Account>) => {
    setBaseAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...accountData } : acc))
    );
  };

  const deleteAccount = (id: string) => {
    const acc = baseAccounts.find((a) => a.id === id);
    if (!acc) return { success: false, error: 'Account not found' };
    if (acc.isSystem) return { success: false, error: 'System standard accounts cannot be deleted.' };

    // Check if account has journal entries
    const hasTransactions = journalEntries.some((je) =>
      je.lines.some((l) => l.accountId === id)
    );
    if (hasTransactions) {
      return {
        success: false,
        error: 'Cannot delete an account with existing journal entry transactions. Reclassify or archive instead.',
      };
    }

    setBaseAccounts((prev) => prev.filter((a) => a.id !== id));
    return { success: true };
  };

  // Tax Rate management
  const addTaxRate = (rateData: Omit<TaxRate, 'id'>) => {
    const newRate: TaxRate = {
      ...rateData,
      id: `tax-${Date.now()}`,
    };
    setTaxRates((prev) => [...prev, newRate]);
    return newRate;
  };

  const updateTaxRate = (id: string, rateData: Partial<TaxRate>) => {
    setTaxRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...rateData } : r))
    );
  };

  // Remit Quarterly Sales Tax to Tax Authority
  const remitQuarterlyTax = (quarterName: string, paymentAccountId: string, date: string) => {
    const summary = quarterlyTaxSummaries.find((q) => q.quarter === quarterName);
    if (!summary || summary.isRemitted || summary.netSalesTaxOwed <= 0) return false;

    const jeId = `je-tax-${quarterName.replace(/\s+/g, '-').toLowerCase()}`;
    const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;

    // Journal Entry for Tax Remittance:
    // Debit: Sales Tax Payable (2050) for total sales tax collected
    // Credit: Sales Tax Input Credits (1600) for tax paid on expenses (recovering credit)
    // Credit: Checking/Cash Account (1010) for net check sent to Department of Revenue
    const lines: JournalLine[] = [
      {
        id: `jl-${jeId}-1`,
        accountId: 'acc-2050', // Sales Tax Payable
        debit: summary.salesTaxCollected,
        credit: 0,
        memo: `Clear sales tax liability for ${quarterName}`,
      },
    ];

    if (summary.salesTaxPaidOnExpenses > 0) {
      lines.push({
        id: `jl-${jeId}-2`,
        accountId: 'acc-1600', // Sales Tax Input Credit
        debit: 0,
        credit: summary.salesTaxPaidOnExpenses,
        memo: `Apply input tax credit offset for ${quarterName}`,
      });
    }

    lines.push({
      id: `jl-${jeId}-3`,
      accountId: paymentAccountId,
      debit: 0,
      credit: summary.netSalesTaxOwed,
      memo: `Remittance check disbursed to California CDTFA for ${quarterName}`,
    });

    const taxJournalEntry: JournalEntry = {
      id: jeId,
      entryNumber: jeNumber,
      date,
      description: `Sales Tax Remittance Return for ${quarterName}`,
      reference: `TAX-${quarterName}`,
      source: 'TAX_PAYMENT',
      lines,
    };

    const reaTaxEvent: ReaEvent = {
      id: `rea-tax-${jeId}`,
      date,
      eventType: 'TAX_REMITTANCE',
      resourceId: 'res-cash',
      resourceDelta: -summary.netSalesTaxOwed,
      internalAgentId: 'agent-internal-owner',
      externalAgentId: 'tax-cdtfa',
      journalEntryId: jeId,
      memo: `Remitted statutory sales tax to CDTFA for ${quarterName}`,
    };

    setJournalEntries((prev) => [...prev, taxJournalEntry]);
    setReaEvents((prev) => [...prev, reaTaxEvent]);
    return true;
  };

  // Reset to default sample data
  const resetToSampleData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_accounts`);
    localStorage.removeItem(`${STORAGE_KEY}_tax_rates`);
    localStorage.removeItem(`${STORAGE_KEY}_invoices`);
    localStorage.removeItem(`${STORAGE_KEY}_expenses`);
    localStorage.removeItem(`${STORAGE_KEY}_journal_entries`);
    localStorage.removeItem(`${STORAGE_KEY}_rea_events`);
    localStorage.removeItem(`${STORAGE_KEY}_rea_agents`);

    setBaseAccounts(DEFAULT_ACCOUNTS);
    setTaxRates(DEFAULT_TAX_RATES);
    setInvoices(INITIAL_INVOICES);
    setExpenses(INITIAL_EXPENSES);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setReaEvents(INITIAL_REA_EVENTS);
    setReaAgents(INITIAL_AGENTS);
  };

  // Export/Import JSON backup
  const exportDataJSON = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      companyProfile,
      accounts: baseAccounts,
      taxRates,
      invoices,
      expenses,
      journalEntries,
      reaEvents,
      reaAgents,
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.accounts && data.journalEntries) {
        setBaseAccounts(data.accounts);
        if (data.taxRates) setTaxRates(data.taxRates);
        if (data.invoices) setInvoices(data.invoices);
        if (data.expenses) setExpenses(data.expenses);
        if (data.journalEntries) setJournalEntries(data.journalEntries);
        if (data.reaEvents) setReaEvents(data.reaEvents);
        if (data.reaAgents) setReaAgents(data.reaAgents);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AccountingContext.Provider
      value={{
        accounts,
        taxRates,
        invoices,
        expenses,
        journalEntries,
        reaResources,
        reaEvents,
        reaAgents,
        companyProfile,

        totalCash,
        totalReceivables,
        totalPayables,
        totalRevenue,
        totalExpenses,
        netIncome,
        isTrialBalanceBalanced,
        trialBalanceDifference,
        totalTrialDebits,
        totalTrialCredits,

        activeTaxRate,
        quarterlyTaxSummaries,
        contractor1099Reports,
        totalSalesTaxCollected,
        totalSalesTaxPaid,
        netSalesTaxPayable,

        addInvoice,
        recordInvoicePayment,
        deleteInvoice,

        addExpense,
        payBill,
        deleteExpense,

        addJournalEntry,
        deleteJournalEntry,

        addAccount,
        updateAccount,
        deleteAccount,

        addTaxRate,
        updateTaxRate,

        remitQuarterlyTax,

        resetToSampleData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
