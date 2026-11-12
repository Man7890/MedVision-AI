/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Printer, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { AnalysisResult } from '../utils/screeningLogic.ts';

interface ReportModalProps {
  result: AnalysisResult;
  imageUrl: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ result, imageUrl, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">Educational Screening Summary</h3>
              <p className="text-xs text-slate-400 font-mono">Session ID: {result.sessionId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-800 printable-content">
          {/* Mandatory Medical Safety Disclaimer Banner */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">CRITICAL MEDICAL SAFETY NOTICE: </span>
              {result.disclaimer}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Modality</span>
              <span className="font-semibold text-slate-800 capitalize">
                {result.modality.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Screening Model</span>
              <span className="font-semibold text-slate-800">{result.modelName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Inference Mode</span>
              <span className="font-semibold text-teal-700 capitalize">
                {result.inferenceMode.replace('_', ' ')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Timestamp</span>
              <span className="font-mono text-slate-700">
                {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Visual Scan and Findings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="flex flex-col items-center">
              <div className="border border-slate-300 rounded-lg overflow-hidden bg-black aspect-square w-full max-w-[220px]">
                <img src={imageUrl} alt="Screening input" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xs text-slate-500 mt-1.5">Submitted Radiograph/Photograph</span>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Primary Screening Classification
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{result.prediction.displayName}</span>
                  {result.prediction.uncertaintyStatus === 'confident' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Confident
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> {result.prediction.uncertaintyStatus}
                    </span>
                  )}
                </div>
              </div>

              {result.prediction.confidence !== null && (
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                    <span>Model Confidence Index</span>
                    <span className="font-mono font-bold text-teal-800">
                      {Math.round(result.prediction.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${Math.round(result.prediction.confidence * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {result.prediction.alternativeClasses.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1.5">
                    Class Probability Distribution:
                  </span>
                  <div className="space-y-1.5">
                    {result.prediction.alternativeClasses.map((ac) => (
                      <div key={ac.className} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700">{ac.displayName}</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {Math.round(ac.score * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Explainability Section */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 text-xs">
            <h4 className="font-bold text-teal-900 mb-1">Grad-CAM Feature Activation Findings:</h4>
            <p className="text-slate-700 leading-relaxed mb-2">
              {result.heatmapData.explanation}
            </p>
            <p className="text-teal-800 font-semibold">
              Peak Gradient Region: <span className="text-slate-900">{result.heatmapData.peakActivationRegion}</span>
            </p>
          </div>

          {/* Key Observations & Limitations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h5 className="font-bold text-slate-800 mb-2">Objective Visual Observations:</h5>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                {result.observations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h5 className="font-bold text-slate-800 mb-2">Documented Model Limitations:</h5>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                {result.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-2xs text-slate-400 text-center pt-4 border-t border-slate-100">
            MedVision AI Prototype • Built for Educational &amp; Research Review Only • Compliant with Privacy-Preserving Ephemeral Processing
          </div>
        </div>
      </div>
    </div>
  );
};
