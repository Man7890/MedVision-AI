/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  Scan,
} from 'lucide-react';
import { AnalysisResult } from '../utils/screeningLogic.ts';

interface HistoryItem {
  sessionId: string;
  modality: 'chest_xray' | 'skin_lesion';
  predictedClass: string;
  displayName: string;
  confidence: number | null;
  uncertaintyStatus: string;
  modelName: string;
  inferenceMode: string;
  processingTimeMs: number;
  timestamp: string;
}

interface HistoryViewProps {
  onSelectSession: (sessionId: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectSession }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteEntry = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.sessionId !== sessionId));
        setFeedbackMsg('Screening record removed from memory cache.');
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete history entry:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to purge all screening history records?')) {
      return;
    }
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        setHistory([]);
        setFeedbackMsg('All session records permanently purged from memory.');
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="w-3.5 h-3.5 text-teal-600" />
            <span>Session Audit Log</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Screening History &amp; Privacy Dashboard
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Ephemeral logs of previous screening inferences performed during this applet session.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge All History</span>
          </button>
        )}
      </div>

      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Privacy Guarantee Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Ephemeral Privacy Architecture Enforced</span>
          </div>
          <h3 className="font-bold text-base sm:text-lg">Zero Permanent Cloud Image Retention</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All medical scans are buffered strictly in ephemeral container RAM during tensor inference. No original images or patient identifiers are saved to persistent disk or long-term databases. When you clear history or close the applet, all session artifacts are purged.
          </p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>RAM In-Memory Only</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>No Patient PII Requested</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Previous Screening Inferences</h3>
          <span className="text-xs text-slate-500 font-mono">
            {history.length} session{history.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading session records...
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-700 text-sm">No screening history yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Run an analysis on a chest radiograph or skin lesion sample to generate screening records and Grad-CAM activations.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">Modality</th>
                  <th className="p-3.5">Predicted Screening Pattern</th>
                  <th className="p-3.5">Confidence</th>
                  <th className="p-3.5">Model / Engine</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {history.map((item) => (
                  <tr
                    key={item.sessionId}
                    onClick={() => onSelectSession(item.sessionId)}
                    className="hover:bg-teal-50/30 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2">
                        {item.modality === 'chest_xray' ? (
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                            <Activity className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                            <Scan className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-semibold text-slate-900 capitalize">
                          {item.modality.replace('_', ' ')}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 font-medium">
                      <span className="text-slate-800 block">{item.displayName}</span>
                      <span className="text-3xs text-slate-400 capitalize font-mono">
                        {item.uncertaintyStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono">
                      {item.confidence !== null ? (
                        <span className="font-semibold text-teal-800">
                          {Math.round(item.confidence * 100)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600">
                      <span className="block truncate max-w-[160px]" title={item.modelName}>
                        {item.modelName}
                      </span>
                      <span className="text-3xs text-slate-400 capitalize">
                        {item.inferenceMode.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-slate-500">
                      {item.processingTimeMs} ms
                    </td>

                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectSession(item.sessionId)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteEntry(item.sessionId, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
