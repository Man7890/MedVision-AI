/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowLeft,
  FileDown,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Info,
} from 'lucide-react';
import { AnalysisResult } from '../utils/screeningLogic.ts';
import { HeatmapViewer } from './HeatmapViewer.tsx';
import { ReportModal } from './ReportModal.tsx';

interface ResultsDashboardProps {
  result: AnalysisResult;
  imageUrl: string;
  onNewAnalysis: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  result,
  imageUrl,
  onNewAnalysis,
}) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const isConfident = result.prediction.uncertaintyStatus === 'confident';
  const isUnassessable = result.prediction.uncertaintyStatus === 'unassessable';

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      {/* Top Action Bar & Modality Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <button
          onClick={onNewAnalysis}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start New Screening Session</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
            {result.modality.replace('_', ' ')}
          </span>
          <span
            className={`text-2xs px-2.5 py-1 rounded-full font-medium ${
              result.inferenceMode === 'gemini_vision'
                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                : 'bg-teal-50 text-teal-700 border border-teal-200'
            }`}
          >
            {result.inferenceMode === 'gemini_vision'
              ? 'Gemini 3.8 Flash Vision Engine'
              : 'Research Benchmark Engine (CheXNet/HAM10000)'}
          </span>
          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Mandatory Prominent Medical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-bold">Medical Safety &amp; Non-Diagnostic Protocol: </span>
          {result.disclaimer}
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Heatmap Viewer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <HeatmapViewer
            originalImageUrl={imageUrl}
            focalPoints={result.heatmapData.focalPoints}
            peakActivationRegion={result.heatmapData.peakActivationRegion}
            explanation={result.heatmapData.explanation}
            modality={result.modality}
          />
        </div>

        {/* Right Column: AI Predictions & Confidence Metrics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary Result Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Preliminary Screening Output
              </span>
              <span className="text-2xs text-slate-400 font-mono">
                {result.processingTimeMs} ms
              </span>
            </div>

            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {result.prediction.displayName}
                </h3>
              </div>

              {/* Uncertainty Badge */}
              <div className="mt-2.5">
                {isConfident ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Calibrated Model Agreement</span>
                  </span>
                ) : isUnassessable ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Suboptimal Image Quality / Unassessable</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Elevated Uncertainty (Borderline Signatures)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Model Confidence Metric */}
            {result.prediction.confidence !== null ? (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">Model Output Confidence</span>
                  <span className="font-mono font-bold text-slate-900">
                    {Math.round(result.prediction.confidence * 100)}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(result.prediction.confidence * 100)}%` }}
                  />
                </div>
                <p className="text-3xs text-slate-400 mt-1">
                  Note: Model confidence reflects neural network classification softmax activation and does not constitute a clinical probability of human disease.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
                Confidence withheld due to diagnostic image quality limitations.
              </div>
            )}

            {/* Alternative Class Probabilities */}
            {result.prediction.alternativeClasses.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">
                  Probability Distribution Across Evaluated Classes:
                </span>
                <div className="space-y-2">
                  {result.prediction.alternativeClasses.map((ac) => (
                    <div key={ac.className} className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-700">
                        <span>{ac.displayName}</span>
                        <span className="font-mono font-semibold text-slate-900">
                          {Math.round(ac.score * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-400 rounded-full"
                          style={{ width: `${Math.round(ac.score * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Model Provenance & Session Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs shadow-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 pb-2 border-b border-slate-100">
              <Cpu className="w-4 h-4 text-teal-600" />
              <span>Inference Pipeline Metadata</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Model Name:</span>
              <span className="font-semibold text-slate-800">{result.modelName}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Model Version:</span>
              <span className="font-mono text-slate-700">{result.modelVersion}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Explainability Method:</span>
              <span className="text-slate-800 font-medium">Grad-CAM (Gradient Activation Map)</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">Session ID:</span>
              <span className="font-mono text-slate-600 text-3xs">{result.sessionId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Educational Insights, Observations, and Limitations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Objective Findings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Key Objective Visual Observations</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
            {result.observations.map((obs, idx) => (
              <li key={idx}>{obs}</li>
            ))}
          </ul>
        </div>

        {/* Model Limitations & Next Steps */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Documented Research Limitations</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
            {result.limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
          <div className="pt-2 text-2xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Always correlate screening outputs with comprehensive clinical history, physical examination, and professional diagnostic radiology or dermatology review.
            </span>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          result={result}
          imageUrl={imageUrl}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
