import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { Download, Upload, Copy, Check, X, AlertCircle } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { exportDataJSON, importDataJSON } = useAccounting();

  const [importText, setImportText] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const jsonString = exportDataJSON();

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const success = importDataJSON(importText.trim());
    if (success) {
      setStatusMessage({ type: 'success', text: 'Financial database successfully restored from JSON backup.' });
      setTimeout(() => {
        onClose();
        setStatusMessage(null);
        setImportText('');
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: 'Invalid JSON ledger backup format. Please verify the file.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Database Backup & Portability
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-md text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <div className="font-semibold text-slate-800 mb-1">Export Current Ledger State</div>
            <p className="text-slate-500 mb-2">
              Includes full Chart of Accounts, Invoices, Expenses, Double-Entry Journals, Tax Rates, and REA Duality events.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#059669] hover:bg-[#047857] text-white font-semibold rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download JSON File
              </button>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-xl transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy JSON'}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200">
            <div className="font-semibold text-stone-800 mb-1">Restore / Import JSON</div>
            <textarea
              rows={4}
              placeholder="Paste JSON ledger backup here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full px-3 py-1.5 border border-stone-300 rounded-xl font-mono text-[11px] focus:outline-none focus:border-[#059669]"
            />
            <button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:opacity-40 text-white font-semibold rounded-xl shadow-xs shadow-emerald-600/20 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              Restore Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
