/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  UploadCloud,
  FileCheck,
  Cpu,
  BrainCircuit,
  Eye,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export interface PipelineStage {
  id: number;
  label: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STAGES: PipelineStage[] = [
  {
    id: 1,
    label: 'Image Received',
    detail: 'Secure in-memory ingest & byte stream verification',
    icon: UploadCloud,
  },
  {
    id: 2,
    label: 'Image Validation',
    detail: 'Resolution, contrast dynamic range & artifact audit',
    icon: FileCheck,
  },
  {
    id: 3,
    label: 'Preprocessing & Tensor Transform',
    detail: 'Spatial normalization (512x512) & grayscale/RGB standardization',
    icon: Cpu,
  },
  {
    id: 4,
    label: 'Deep Learning Model Inference',
    detail: 'Forward pass through dense feature extractors & class logit computation',
    icon: BrainCircuit,
  },
  {
    id: 5,
    label: 'Grad-CAM Explainability Generation',
    detail: 'Backpropagating classification gradients into final convolutional activation maps',
    icon: Eye,
  },
  {
    id: 6,
    label: 'Results & Clinical Dashboard Preparation',
    detail: 'Uncertainty thresholding, confidence normalization & educational synthesis',
    icon: CheckCircle2,
  },
];

interface PipelineProgressProps {
  currentStage: number; // 1 to 6
  onComplete?: () => void;
  modality: 'chest_xray' | 'skin_lesion';
}

export const PipelineProgress: React.FC<PipelineProgressProps> = ({
  currentStage,
  modality,
}) => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setPulse((p) => !p), 800);
    return () => clearInterval(timer);
  }, []);

  const progressPercentage = Math.min(100, Math.round((currentStage / 6) * 100));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
          <span>Active Screening Pipeline</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Processing {modality === 'chest_xray' ? 'Frontal Chest Radiograph' : 'Skin Lesion Image'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Real-time execution of multi-layer feature extractors and gradient activation mapping
        </p>
      </div>

      {/* Progress Bar Container */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
          <span>Overall Pipeline Progress</span>
          <span className="font-mono text-teal-700">{progressPercentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-linear-to-r from-teal-500 to-blue-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-3.5">
        {STAGES.map((stage) => {
          const isDone = currentStage > stage.id;
          const isCurrent = currentStage === stage.id;
          const isUpcoming = currentStage < stage.id;
          const Icon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all duration-300 ${
                isDone
                  ? 'bg-slate-50/80 border-slate-200/80 text-slate-700'
                  : isCurrent
                    ? 'bg-teal-50/60 border-teal-300 text-teal-950 shadow-xs'
                    : 'bg-white border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? 'bg-teal-600 text-white'
                    : isCurrent
                      ? 'bg-teal-500 text-white ring-4 ring-teal-100'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-teal-950'
                        : isDone
                          ? 'text-slate-800'
                          : 'text-slate-400'
                    }`}
                  >
                    Step {stage.id}: {stage.label}
                  </h4>
                  {isCurrent && (
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isDone && (
                    <span className="text-2xs font-medium text-slate-500">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {stage.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping inline-block" />
          Processing without permanent disk retention
        </span>
        <span className="text-slate-400">Memory Isolated</span>
      </div>
    </div>
  );
};
