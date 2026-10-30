export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface Account {
  id: string;
  code: string; // e.g. "1010", "1200", "2010"
  name: string;
  type: AccountType;
  subType?: string; // e.g. "Cash & Cash Equivalents", "Current Assets", "Operating Expense"
  description?: string;
  balance: number; // Current calculated balance
  isSystem?: boolean; // Default standard accounts that shouldn't be deleted
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  memo?: string;
}

export type TransactionSource = 'INVOICE' | 'EXPENSE' | 'BILL' | 'MANUAL' | 'TAX_PAYMENT' | 'PAYMENT_RECEIVED';

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. "JE-1001"
  date: string; // ISO date YYYY-MM-DD
  description: string;
  reference?: string; // e.g. "INV-104"
  source: TransactionSource;
  lines: JournalLine[];
  reaEventId?: string; // Links to REA Economic Event
}

export interface TaxRate {
  id: string;
  name: string;
  code: string;
  rate: number; // e.g. 0.0825 for 8.25%
  authority: string; // e.g. "California Dept of Tax & Fee Admin"
  description?: string;
  isDefault?: boolean;
}

export type TaxDeductibility = '100_PERCENT' | '50_PERCENT_MEALS' | 'CAPITALIZED' | 'NON_DEDUCTIBLE';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRateId: string;
  amount: number;
  taxAmount: number;
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  notes?: string;
  paidDate?: string;
  journalEntryId?: string;
  paymentJournalEntryId?: string;
}

export type ExpenseStatus = 'PAID' | 'PENDING';

export interface Expense {
  id: string;
  expenseNumber: string;
  vendorId: string;
  vendorName: string;
  date: string;
  accountId: string; // Expense account (e.g. 5010)
  paymentAccountId: string; // Cash or Credit Card (e.g. 1010 or 2020)
  amount: number;
  taxRateId: string;
  taxAmount: number;
  taxDeductibility: TaxDeductibility;
  description: string;
  reference?: string;
  status: ExpenseStatus;
  isContractor1099?: boolean;
  journalEntryId?: string;
}

// REA (Resources, Events, Agents) Model Entities
export type ReaResourceType = 'MONETARY' | 'SERVICE' | 'RECEIVABLE' | 'PAYABLE' | 'TAX_CREDIT' | 'CAPITAL';

export interface ReaResource {
  id: string;
  name: string;
  type: ReaResourceType;
  currentValue: number;
  unit: string;
}

export type ReaEventType = 
  | 'CASH_INFLOW' 
  | 'CASH_OUTFLOW' 
  | 'SERVICE_RENDERED' 
  | 'SERVICE_ACQUIRED' 
  | 'TAX_ASSESSMENT' 
  | 'TAX_REMITTANCE' 
  | 'CAPITAL_INJECTION';

export interface ReaEvent {
  id: string;
  date: string;
  eventType: ReaEventType;
  resourceId: string;
  resourceDelta: number; // Positive (increment) or Negative (decrement)
  internalAgentId: string; // e.g. Business Owner / Finance
  externalAgentId: string; // e.g. Customer, Vendor, Tax Agency
  dualEventId?: string; // REA Economic Duality: links Give to Receive
  journalEntryId?: string;
  memo: string;
}

export type ReaAgentType = 'INTERNAL' | 'CUSTOMER' | 'VENDOR' | 'TAX_AUTHORITY';

export interface ReaAgent {
  id: string;
  name: string;
  type: ReaAgentType;
  email?: string;
  taxId?: string; // SSN or EIN for 1099 tracking
}

export interface QuarterlyTaxSummary {
  quarter: string; // "Q1 2026", etc.
  startDate: string;
  endDate: string;
  dueDate: string;
  grossSales: number;
  taxableSales: number;
  salesTaxCollected: number;
  salesTaxPaidOnExpenses: number;
  netSalesTaxOwed: number;
  totalDeductibleExpenses: number;
  netTaxableIncome: number;
  estimatedFederalIncomeTax: number;
  estimatedStateIncomeTax: number;
  estimatedSelfEmploymentTax: number;
  totalEstimatedTaxLiability: number;
  isRemitted: boolean;
  remittedDate?: string;
}
