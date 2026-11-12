/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Scan,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  History,
  BrainCircuit,
  Eye,
  CheckCircle2,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  BookOpen,
  Info,
  RotateCcw,
} from 'lucide-react';
import { ImageUploader } from './components/ImageUploader.tsx';
import { PipelineProgress } from './components/PipelineProgress.tsx';
import { ResultsDashboard } from './components/ResultsDashboard.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { ModelArchitectureView } from './components/ModelArchitectureView.tsx';
import { AnalysisResult, MANDATORY_MEDICAL_DISCLAIMER } from './utils/screeningLogic.ts';
import { SAMPLE_CASES } from './data/sampleCases.ts';
import { ensureBase64Png } from './utils/imageRasterizer.ts';

type ActiveTab = 'home' | 'screening' | 'history' | 'models' | 'privacy';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedModality, setSelectedModality] = useState<'chest_xray' | 'skin_lesion'>('chest_xray');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sampleHint, setSampleHint] = useState<string | undefined>(undefined);

  // Screening Pipeline States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<number>(1);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // System Health & Engine Status
  const [systemHealth, setSystemHealth] = useState<{
    geminiVisionAvailable: boolean;
    service: string;
    version: string;
  } | null>(null);

  // Check health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setSystemHealth(data))
      .catch((err) => console.warn('Health check note:', err));
  }, []);

  // Quick navigation helpers
  const handleStartScreening = (modality: 'chest_xray' | 'skin_lesion') => {
    setSelectedModality(modality);
    setActiveTab('screening');
    setCurrentResult(null);
    setAnalysisError(null);
    // Auto-load a signature educational sample case to let user immediately explore
    const defaultSample = SAMPLE_CASES.find(
      (s) => s.modality === modality && (s.id.includes('pneumonia') || s.id.includes('atypical'))
    ) || SAMPLE_CASES.find((s) => s.modality === modality);
    if (defaultSample) {
      setSampleHint(defaultSample.id);
      ensureBase64Png(defaultSample.imageUrl).then((png) => {
        setUploadedImage(png);
      });
    } else {
      setUploadedImage(null);
      setSampleHint(undefined);
    }
  };

  const handleExecuteScreening = async () => {
    if (!uploadedImage) return;

    setIsProcessing(true);
    setAnalysisError(null);
    setProcessingStage(1);

    // Realistic progressive stage advance for transparent pipeline UX
    const stageInterval = setInterval(() => {
      setProcessingStage((prev) => (prev < 5 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: uploadedImage,
          modality: selectedModality,
          sampleHint: sampleHint,
        }),
      });

      clearInterval(stageInterval);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to complete screening analysis.');
      }

      setProcessingStage(6); // Final stage
      const resultData: AnalysisResult = await res.json();

      // Brief visual settling pause at stage 6
      setTimeout(() => {
        setCurrentResult(resultData);
        setIsProcessing(false);
      }, 500);
    } catch (err: any) {
      clearInterval(stageInterval);
      setIsProcessing(false);
      setAnalysisError(err?.message || 'Error occurred during AI screening pipeline.');
    }
  };

  const handleSelectHistorySession = async (sessionId: string) => {
    try {
      const [resResult, resImage] = await Promise.all([
        fetch(`/api/results/${sessionId}`),
        fetch(`/api/results/${sessionId}/image`),
      ]);

      if (resResult.ok) {
        const resultData: AnalysisResult = await resResult.json();
        setCurrentResult(resultData);
        setSelectedModality(resultData.modality);
        if (resImage.ok) {
          const imgData = await resImage.json();
          setUploadedImage(imgData.dataUrl);
        }
        setActiveTab('screening');
      }
    } catch (err) {
      console.error('Failed to load session details:', err);
    }
  };

  const handleResetScreening = () => {
    setCurrentResult(null);
    setAnalysisError(null);
    setIsProcessing(false);
    setProcessingStage(1);
    // Don't clear uploadedImage completely, but allow user to pick new one
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-[#172B4D] font-sans antialiased">
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Title */}
          <div
            onClick={() => {
              setActiveTab('home');
              setCurrentResult(null);
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#142B4A] to-[#0D9488] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-[#142B4A] tracking-tight">
                  MedVision AI
                </span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 hidden sm:inline-block">
                  Explainable AI
                </span>
              </div>
              <span className="text-3xs text-slate-400 hidden sm:block -mt-0.5">
                Dual-Modality Screening Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                setActiveTab('home');
                setCurrentResult(null);
              }}
              aria-label="Home"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'home'
                  ? 'bg-slate-100 text-[#142B4A]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                setActiveTab('screening');
              }}
              aria-label="Screening Workspace"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'screening'
                  ? 'bg-teal-50 text-teal-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>Screening</span>
              {currentResult && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              aria-label="Screening History"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'history'
                  ? 'bg-slate-100 text-[#142B4A]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              onClick={() => setActiveTab('models')}
              aria-label="Model Architecture & Provenance"
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeTab === 'models'
                  ? 'bg-slate-100 text-[#142B4A]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Architecture</span>
            </button>

            {/* Inference Engine Status Indicator */}
            <div className="pl-2 border-l border-slate-200 hidden md:flex items-center gap-1.5 text-2xs text-slate-500 font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth?.geminiVisionAvailable
                    ? 'bg-purple-500'
                    : 'bg-teal-500'
                }`}
              />
              <span>
                {systemHealth?.geminiVisionAvailable
                  ? 'Gemini Vision'
                  : 'Research CheXNet'}
              </span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ================= PAGE 1: LANDING PAGE ================= */}
        {activeTab === 'home' && (
          <div className="space-y-16 py-4">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#142B4A] via-[#1A3860] to-[#0A1A2E] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
              {/* Background Geometric Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-teal-300 text-xs font-semibold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Explainable AI &bull; Dual-Modality Healthcare Screening</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                  AI-Powered Medical Image Screening,{' '}
                  <span className="bg-linear-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">
                    Made Understandable.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
                  Explore experimental AI-assisted image screening with visual Grad-CAM explanations and transparent confidence indicators. MedVision AI analyzes chest radiographs and skin lesion photographs with zero black-box opacity.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => handleStartScreening('chest_xray')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Analyze Chest X-ray</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleStartScreening('skin_lesion')}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all hover:-translate-y-0.5"
                  >
                    <Scan className="w-4 h-4" />
                    <span>Analyze Skin Image</span>
                  </button>
                </div>

                <p className="text-2xs text-slate-400 italic pt-2">
                  Tagline: &ldquo;See Beyond the Image. Understand the Possibilities.&rdquo;
                </p>
              </div>
            </div>

            {/* Prominent Medical Safety Exemption Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-4 shadow-xs">
              <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                <span className="font-bold">CRITICAL MEDICAL SAFETY &amp; HACKATHON DEMO NOTICE: </span>
                {MANDATORY_MEDICAL_DISCLAIMER} MedVision AI does not diagnose disease, confirm pneumonia or melanoma, or recommend medical treatments.
              </div>
            </div>

            {/* Screening Cards Section */}
            <div>
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#142B4A] tracking-tight">
                  Two Specialized Medical Imaging Pipelines
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                  Trained deep learning backbones paired with Grad-CAM feature attribution to illuminate which image zones drove the model&apos;s output.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Modality Card 1: Chest X-ray */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-2xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
                        Pulmonary Imaging &bull; CheXNet
                      </span>
                      <h3 className="text-xl font-bold text-[#142B4A] mt-1">
                        Chest X-ray Screening
                      </h3>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Evaluates frontal (PA/AP) chest radiographs for airspace consolidation, focal opacities, and bronchovascular infiltrates. Highlights influenced lung zones via spatial attention.
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <span className="font-semibold block text-slate-800">Target Screening Classes:</span>
                      <div>&bull; Pneumonia-like visual pattern</div>
                      <div>&bull; No pneumonia-like pattern detected</div>
                      <div>&bull; Uncertain / unable to assess</div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleStartScreening('chest_xray')}
                      className="w-full py-3 rounded-xl bg-[#142B4A] hover:bg-[#1E3A5F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Start X-ray Screening</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modality Card 2: Skin Lesion */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <Scan className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-2xs font-semibold uppercase tracking-wider text-teal-700 font-mono">
                        Dermatoscopy Imaging &bull; HAM10000
                      </span>
                      <h3 className="text-xl font-bold text-[#142B4A] mt-1">
                        Skin Lesion Screening
                      </h3>
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Assesses pigmented cutaneous lesions based on ABCD criteria (Asymmetry, Border irregularity, Color variegation, Diameter). Flags peripheral pigment networks and structural atypia.
                    </p>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                      <span className="font-semibold block text-slate-800">Target Screening Classes:</span>
                      <div>&bull; Potentially concerning visual pattern</div>
                      <div>&bull; No concerning pattern detected</div>
                      <div>&bull; Uncertain / unable to assess</div>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleStartScreening('skin_lesion')}
                      className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Start Skin Screening</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section: 6-Stage Pipeline */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs">
              <div className="max-w-2xl mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Transparent AI Lifecycle
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#142B4A] mt-1">
                  How the MedVision AI Pipeline Works
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                  Every submitted scan progresses through a verifiable 6-stage analytical pipeline designed to eliminate diagnostic opacity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    step: '01',
                    title: 'Image Ingest & RAM Buffering',
                    desc: 'Scans are buffered strictly in ephemeral memory with zero long-term disk logging.',
                  },
                  {
                    step: '02',
                    title: 'Quality & Contrast Audit',
                    desc: 'Algorithms detect motion blur, inadequate penetration, or unassessable artifacts.',
                  },
                  {
                    step: '03',
                    title: 'Tensor Preprocessing',
                    desc: 'Input standardization to 512x512 resolution with intensity normalization.',
                  },
                  {
                    step: '04',
                    title: 'Deep Feature Extraction',
                    desc: 'Forward pass computing dense convolutional feature representations.',
                  },
                  {
                    step: '05',
                    title: 'Grad-CAM Attention Mapping',
                    desc: 'Backpropagating gradients to generate localization heatmaps over influential regions.',
                  },
                  {
                    step: '06',
                    title: 'Educational Dashboard Synthesis',
                    desc: 'Synthesizing confidence indicators, alternative class probabilities, and documented boundaries.',
                  },
                ].map((item) => (
                  <div key={item.step} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <span className="text-xs font-mono font-bold text-teal-600">{item.step}</span>
                    <h4 className="font-bold text-sm text-[#142B4A]">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explainable AI Visual Preview Showcase */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center gap-10">
              <div className="lg:w-1/2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                  <Eye className="w-3.5 h-3.5" />
                  <span>The Explainability Difference</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Visual Heatmaps That Doctors &amp; Researchers Can Inspect
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Most healthcare AI demos simply display a classification label. MedVision AI reveals the underlying spatial activations so clinicians can immediately evaluate whether the model attended to genuine anatomical pathology or spurious background artifacts.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Side-by-side or layered overlay with 0&ndash;100% opacity slider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Jet, Turbo, and Inferno scientific color ramps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Real-time interactive magnification inspection lens</span>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 w-full flex justify-center">
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black aspect-square max-w-[360px] w-full shadow-2xl p-2 flex items-center justify-center">
                  <img
                    src={SAMPLE_CASES[0].imageUrl}
                    alt="Sample preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-radial from-teal-500/50 via-amber-500/20 to-transparent pointer-events-none mix-blend-screen" />
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 text-center text-xs">
                    <span className="font-mono text-teal-300 font-bold">Grad-CAM Activation Map</span>
                    <p className="text-3xs text-slate-400 mt-0.5">RLL Alveolar Consolidation Focus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Privacy-Conscious Architecture</span>
                </div>
                <h3 className="text-xl font-bold text-[#142B4A]">
                  Ephemeral Image Handling by Design
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  MedVision AI does not persist original patient medical images. Processing occurs strictly in transient container RAM and records can be purged at any time from the Privacy &amp; History Dashboard.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('history')}
                className="shrink-0 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-[#142B4A] text-xs font-semibold transition-colors"
              >
                View Privacy Audit Dashboard
              </button>
            </div>
          </div>
        )}

        {/* ================= PAGE 2 & 3: SCREENING WORKSPACE ================= */}
        {activeTab === 'screening' && (
          <div className="space-y-6">
            {/* Screening Workspace Header */}
            {!currentResult && !isProcessing && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#142B4A] tracking-tight">
                    {selectedModality === 'chest_xray'
                      ? 'Chest X-ray Screening Workspace'
                      : 'Skin Lesion Screening Workspace'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {selectedModality === 'chest_xray'
                      ? 'Analyze frontal thoracic radiographs for pneumonia-like airspace opacities.'
                      : 'Analyze dermatoscopic photographs for structural asymmetry and border atypia.'}
                  </p>
                </div>

                {/* Modality Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setSelectedModality('chest_xray');
                      setCurrentResult(null);
                      setSampleHint(SAMPLE_CASES[0].id);
                      ensureBase64Png(SAMPLE_CASES[0].imageUrl).then((png) => {
                        setUploadedImage(png);
                      });
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      selectedModality === 'chest_xray'
                        ? 'bg-white text-[#142B4A] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chest Radiograph</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedModality('skin_lesion');
                      setCurrentResult(null);
                      const skinSample = SAMPLE_CASES.find((s) => s.modality === 'skin_lesion');
                      if (skinSample) {
                        setSampleHint(skinSample.id);
                        ensureBase64Png(skinSample.imageUrl).then((png) => {
                          setUploadedImage(png);
                        });
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      selectedModality === 'skin_lesion'
                        ? 'bg-white text-[#142B4A] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Scan className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Skin Lesion</span>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message if pipeline failed */}
            {analysisError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                <span>{analysisError}</span>
                <button
                  onClick={() => setAnalysisError(null)}
                  className="font-bold underline text-rose-900"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 1. Processing Screen (Section 2.7) */}
            {isProcessing && (
              <PipelineProgress
                currentStage={processingStage}
                modality={selectedModality}
              />
            )}

            {/* 2. Results Dashboard Screen (Section 2.5) */}
            {!isProcessing && currentResult && uploadedImage && (
              <ResultsDashboard
                result={currentResult}
                imageUrl={uploadedImage}
                onNewAnalysis={handleResetScreening}
              />
            )}

            {/* 3. Upload & Pre-analysis Screen (Section 2.2) */}
            {!isProcessing && !currentResult && (
              <div className="space-y-6">
                <ImageUploader
                  modality={selectedModality}
                  selectedImage={uploadedImage}
                  onImageSelected={(img, hint) => {
                    setUploadedImage(img);
                    setSampleHint(hint);
                  }}
                  onClearImage={() => {
                    setUploadedImage(null);
                    setSampleHint(undefined);
                  }}
                />

                {uploadedImage && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={handleExecuteScreening}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm transition-all shadow-md hover:shadow-teal-500/20 hover:-translate-y-0.5"
                    >
                      <BrainCircuit className="w-5 h-5" />
                      <span>
                        Run Explainable AI Screening (
                        {selectedModality === 'chest_xray' ? 'Analyze X-ray' : 'Analyze Skin Image'})
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= PAGE 6: HISTORY & PRIVACY ================= */}
        {activeTab === 'history' && (
          <HistoryView onSelectSession={handleSelectHistorySession} />
        )}

        {/* ================= PAGE 7: MODEL ARCHITECTURE ================= */}
        {activeTab === 'models' && <ModelArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-700">MedVision AI</span> &bull; Experimental Healthcare Image Screening Prototype
            <p className="text-3xs text-slate-400 mt-0.5">
              Dual-modality deep learning screening &bull; Grad-CAM model activations &bull; Privacy-first RAM processing
            </p>
          </div>
          <div className="text-2xs text-slate-400 max-w-md">
            Notice: Educational and research hackathon demonstration only. Not a clinically validated diagnostic device.
          </div>
        </div>
      </footer>
    </div>
  );
}
