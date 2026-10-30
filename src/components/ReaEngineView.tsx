import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { ReaEvent, ReaResource, ReaAgent } from '../types/accounting';
import {
  Database,
  ArrowRightLeft,
  Users,
  Coins,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Info,
} from 'lucide-react';

export const ReaEngineView: React.FC = () => {
  const { reaEvents, reaResources, reaAgents, journalEntries } = useAccounting();

  const [selectedEventId, setSelectedEventId] = useState<string>(reaEvents[0]?.id || '');

  const selectedEvent = reaEvents.find((e) => e.id === selectedEventId) || reaEvents[0];
  const dualEvent = selectedEvent?.dualEventId
    ? reaEvents.find((e) => e.id === selectedEvent.dualEventId || e.journalEntryId === selectedEvent.dualEventId)
    : null;

  const internalAgent = reaAgents.find((a) => a.id === selectedEvent?.internalAgentId);
  const externalAgent = reaAgents.find((a) => a.id === selectedEvent?.externalAgentId);
  const resource = reaResources.find((r) => r.id === selectedEvent?.resourceId);
  const linkedJournal = journalEntries.find((je) => je.id === selectedEvent?.journalEntryId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif">
            REA Accounting Model
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Architectural implementation of the REA enterprise accounting ontology with Economic Duality pairing.
          </p>
        </div>
      </div>

      {/* REA Concept Explainer Card */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900 font-serif">
              The REA Model & Computer-Age Bookkeeping
            </h2>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              Unlike traditional manual bookkeeping which relies on static ledgers and debit/credit memory shortcuts, the <strong>REA (Resources, Events, Agents)</strong> model captures the fundamental operational reality of economic exchange. Traditional double-entry statements (Balance Sheet, P&L, Trial Balance) are dynamically derived views calculated on-the-fly from granular economic events.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-stone-100 text-xs">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1 font-serif">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>1. Resources (R)</span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Scarce economic assets under enterprise control: cash liquidity, service capacity, receivables, and tax credits.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1 font-serif">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <span>2. Events (E)</span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Inflows, outflows, and exchanges paired via <strong>Economic Duality</strong> (every give event requires a receive event).
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80">
            <div className="font-bold text-stone-900 flex items-center gap-1.5 mb-1 font-serif">
              <Users className="w-4 h-4 text-purple-600" />
              <span>3. Agents (A)</span>
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              Internal (business, owners, employees) and external participants (customers, vendors, tax authorities).
            </p>
          </div>
        </div>
      </div>

      {/* Interactive REA Event Duality Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Event Stream Selector */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
            Economic Event Ledger
          </h3>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {reaEvents.map((evt) => {
              const isSelected = evt.id === selectedEventId;
              const extAgent = reaAgents.find((a) => a.id === evt.externalAgentId);

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  className={`p-2.5 rounded-md border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-slate-900">{evt.eventType}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{evt.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate mt-0.5">
                    {evt.memo}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="text-slate-500">{extAgent?.name}</span>
                    <span className={`font-mono font-bold ${evt.resourceDelta >= 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {evt.resourceDelta >= 0 ? '+' : ''}${Math.abs(evt.resourceDelta).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Cols: Duality Pairing Inspection Canvas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
          <div className="pb-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Economic Duality Pairing & Agent Flow
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing the give-and-take duality linking resource changes to double-entry ledgers.
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-700">
              Event ID: {selectedEvent?.id}
            </span>
          </div>

          {selectedEvent && (
            <div className="space-y-5">
              {/* Event Triplet Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Primary Economic Event
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Affected Resource:</span>
                    <strong className="text-slate-900 font-mono">{resource?.name || selectedEvent.resourceId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Internal Agent:</span>
                    <strong className="text-slate-900">{internalAgent?.name || 'Enterprise'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">External Counterparty:</span>
                    <strong className="text-slate-900">{externalAgent?.name || 'Counterparty'}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-600">{selectedEvent.memo}</span>
                  <span className="font-mono font-bold text-slate-900">
                    Delta: {selectedEvent.resourceDelta >= 0 ? '+' : '-'}${Math.abs(selectedEvent.resourceDelta).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Economic Duality Connection */}
              <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wide">
                  <ArrowRightLeft className="w-4 h-4 text-blue-700" />
                  <span>Economic Duality Pairing</span>
                </div>

                {dualEvent ? (
                  <div className="text-xs space-y-2">
                    <p className="text-slate-700">
                      Paired with counter-event <strong className="font-mono text-slate-900">{dualEvent.eventType}</strong> (ID: {dualEvent.id}).
                    </p>
                    <div className="p-2.5 bg-white border border-blue-200 rounded text-xs flex justify-between items-center">
                      <span>{dualEvent.memo}</span>
                      <span className="font-mono font-bold text-slate-900">
                        ${Math.abs(dualEvent.resourceDelta).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">
                    This operational event is paired with an outstanding contractual claim (Accounts Receivable / Accounts Payable). Upon cash settlement, the economic duality closes.
                  </p>
                )}
              </div>

              {/* Linked Double-Entry Journal Entry */}
              {linkedJournal && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">
                      Derived Double-Entry Journal ({linkedJournal.entryNumber})
                    </span>
                    <span className="text-slate-500 font-mono">{linkedJournal.date}</span>
                  </div>

                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-500">
                        <th className="py-1">Account</th>
                        <th className="py-1 text-right">Debit</th>
                        <th className="py-1 text-right">Credit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {linkedJournal.lines.map((l) => (
                        <tr key={l.id}>
                          <td className="py-1 font-sans">{l.memo || l.accountId}</td>
                          <td className="py-1 text-right tabular-nums">{l.debit > 0 ? `$${l.debit.toFixed(2)}` : '—'}</td>
                          <td className="py-1 text-right tabular-nums">{l.credit > 0 ? `$${l.credit.toFixed(2)}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
