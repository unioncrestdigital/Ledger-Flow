import React, { useState } from 'react';
import { AccountingProvider } from './context/AccountingContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InvoicesView } from './components/InvoicesView';
import { ExpensesView } from './components/ExpensesView';
import { JournalView } from './components/JournalView';
import { TaxCenterView } from './components/TaxCenterView';
import { ReportsView } from './components/ReportsView';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { ReaEngineView } from './components/ReaEngineView';
import { BackupModal } from './components/BackupModal';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOpenBackupModal, setIsOpenBackupModal] = useState(false);

  // Quick action modals
  const [isOpenInvoiceCreate, setIsOpenInvoiceCreate] = useState(false);
  const [isOpenExpenseCreate, setIsOpenExpenseCreate] = useState(false);
  const [isOpenJournalCreate, setIsOpenJournalCreate] = useState(false);

  const handleOpenQuickAdd = (type: 'invoice' | 'expense' | 'journal') => {
    if (type === 'invoice') {
      setActiveView('invoices');
      setIsOpenInvoiceCreate(true);
    } else if (type === 'expense') {
      setActiveView('expenses');
      setIsOpenExpenseCreate(true);
    } else if (type === 'journal') {
      setActiveView('journal');
      setIsOpenJournalCreate(true);
    }
  };

  return (
    <AccountingProvider>
      <div className="min-h-screen bg-[#F8FAF9] text-stone-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-950">
        {/* Top Bar Header */}
        <Header
          activeView={activeView}
          onOpenQuickAdd={handleOpenQuickAdd}
          onOpenBackupModal={() => setIsOpenBackupModal(true)}
        />

        {/* Main Workspace Frame */}
        <div className="flex-1 flex w-full max-w-[1720px] mx-auto">
          {/* Navigation Sidebar */}
          <Sidebar
            activeView={activeView}
            onSelectView={(view) => setActiveView(view)}
            isOpenMobile={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* Mobile Sidebar Trigger button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-md shadow-xs"
              >
                ☰ Navigation Menu
              </button>
            </div>

            {activeView === 'dashboard' && (
              <Dashboard
                onNavigate={(view) => setActiveView(view)}
                onOpenQuickAdd={handleOpenQuickAdd}
              />
            )}

            {activeView === 'invoices' && (
              <InvoicesView
                isOpenCreateModal={isOpenInvoiceCreate}
                onCloseCreateModal={() => setIsOpenInvoiceCreate(false)}
              />
            )}

            {activeView === 'expenses' && (
              <ExpensesView
                isOpenCreateModal={isOpenExpenseCreate}
                onCloseCreateModal={() => setIsOpenExpenseCreate(false)}
              />
            )}

            {activeView === 'journal' && (
              <JournalView
                isOpenCreateModal={isOpenJournalCreate}
                onCloseCreateModal={() => setIsOpenJournalCreate(false)}
              />
            )}

            {activeView === 'taxes' && <TaxCenterView />}

            {activeView === 'reports' && <ReportsView />}

            {activeView === 'accounts' && <ChartOfAccountsView />}

            {activeView === 'rea' && <ReaEngineView />}
          </main>
        </div>

        {/* Backup & Portability Modal */}
        <BackupModal
          isOpen={isOpenBackupModal}
          onClose={() => setIsOpenBackupModal(false)}
        />
      </div>
    </AccountingProvider>
  );
}
