/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BrainCircuit,
  Database,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { RESEARCH_MODELS, MANDATORY_MEDICAL_DISCLAIMER } from '../utils/screeningLogic.ts';

export const ModelArchitectureView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <BrainCircuit className="w-3.5 h-3.5 text-teal-600" />
          <span>Transparent Model Registry &amp; Provenance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Model Architecture &amp; Explainability Foundations
        </h1>
        <p className="text-slate-600 text-sm mt-2 max-w-2xl leading-relaxed">
          Detailed technical specifications, training corpus benchmarks, Grad-CAM mathematical formulation, and documented clinical boundaries for MedVision AI screening pipelines.
        </p>
      </div>

      {/* Mandatory Safety Notice */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Medical Device Exemption: </span>
          {MANDATORY_MEDICAL_DISCLAIMER} The documented architectures and weights are evaluated strictly for technical hackathon demonstration and educational evaluation.
        </div>
      </div>

      {/* Dual Modality Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CheXNet DenseNet-121 */}
        {(() => {
          const m = RESEARCH_MODELS['chexnet-dense121'];
          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    XR
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                    <span className="text-2xs text-slate-400 font-mono">{m.version}</span>
                  </div>
                </div>
                <span className="text-2xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {m.parameters}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Underlying Architecture</span>
                  <p className="text-slate-800 font-semibold">{m.architecture}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Training Dataset</span>
                  <p className="text-slate-800 font-semibold">{m.datasetName}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1.5">Documented Research Metrics</span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">AUC-ROC</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.aucRoc}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">Sensitivity</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.sensitivity}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">Specificity</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.specificity}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">F1-Score</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.f1Score}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Documented Limitations:</span>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-2xs leading-relaxed">
                    {m.limitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <a
                  href={m.documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-semibold"
                >
                  <span>Stanford ML Group Paper</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })()}

        {/* HAM10000 ResNet-50 */}
        {(() => {
          const m = RESEARCH_MODELS['ham10000-resnet50'];
          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    SK
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{m.name}</h3>
                    <span className="text-2xs text-slate-400 font-mono">{m.version}</span>
                  </div>
                </div>
                <span className="text-2xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {m.parameters}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Underlying Architecture</span>
                  <p className="text-slate-800 font-semibold">{m.architecture}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Training Dataset</span>
                  <p className="text-slate-800 font-semibold">{m.datasetName}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1.5">Documented Research Metrics</span>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">AUC-ROC</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.aucRoc}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">Sensitivity</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.sensitivity}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">Specificity</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.specificity}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-3xs text-slate-400 uppercase font-bold block">F1-Score</span>
                      <span className="font-mono font-bold text-teal-700">{m.metrics.f1Score}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1">Documented Limitations:</span>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside text-2xs leading-relaxed">
                    {m.limitations.map((lim, i) => (
                      <li key={i}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <a
                  href={m.documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-700 hover:text-teal-800 font-semibold"
                >
                  <span>Nature Scientific Data Paper</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Grad-CAM Explainability Mathematical Formulation */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Explainable AI (XAI) Theory</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold tracking-tight">
          How Grad-CAM (Gradient-weighted Class Activation Mapping) Works
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
          Unlike black-box classifiers that only emit an opaque probability number, Grad-CAM utilizes the gradients flowing into the final convolutional layer of the neural network to produce a coarse localization map highlighting the regions in the image most salient for predicting class <span className="font-mono text-teal-300">c</span>.
        </p>

        {/* Formula Display Box */}
        <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 max-w-xl font-mono text-xs sm:text-sm text-center text-teal-300 my-4">
          <p className="mb-2 text-slate-400 text-2xs uppercase tracking-wider">
            Neuron Importance Weights ($\alpha_k^c$):
          </p>
          <div className="text-sm sm:text-base font-bold text-white mb-3">
            α_k^c = (1 / Z) · ∑_i ∑_j (∂ y^c / ∂ A_(i,j)^k)
          </div>
          <p className="mb-2 text-slate-400 text-2xs uppercase tracking-wider">
            Grad-CAM Heatmap Localization (L_Grad-CAM^c):
          </p>
          <div className="text-sm sm:text-base font-bold text-white">
            L_Grad-CAM^c = ReLU( ∑_k α_k^c · A^k )
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="font-bold text-teal-400 block mb-1">1. Backward Gradient Flow</span>
            <span className="text-slate-400 leading-relaxed">
              We compute the derivative of the target score with respect to feature activation maps $A^k$.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="font-bold text-teal-400 block mb-1">2. Global Average Pooling</span>
            <span className="text-slate-400 leading-relaxed">
              Gradients are pooled spatially across width and height to capture the importance of channel $k$.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700">
            <span className="font-bold text-teal-400 block mb-1">3. Rectified Linear Unit (ReLU)</span>
            <span className="text-slate-400 leading-relaxed">
              We apply ReLU to only preserve features that positively contribute to the target classification.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
