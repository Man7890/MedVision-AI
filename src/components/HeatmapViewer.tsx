/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Columns,
  Eye,
  Sliders,
  Maximize2,
  Minimize2,
  Info,
  Palette,
  RotateCcw,
} from 'lucide-react';
import { HeatmapPoint, getColorMapRGB, calculateActivationIntensity } from '../utils/screeningLogic.ts';

interface HeatmapViewerProps {
  originalImageUrl: string;
  focalPoints: HeatmapPoint[];
  peakActivationRegion?: string;
  explanation?: string;
  modality: 'chest_xray' | 'skin_lesion';
}

export const HeatmapViewer: React.FC<HeatmapViewerProps> = ({
  originalImageUrl,
  focalPoints,
  peakActivationRegion,
  explanation,
  modality,
}) => {
  const [opacity, setOpacity] = useState<number>(0.65);
  const [viewMode, setViewMode] = useState<'overlay' | 'split' | 'heatmap_only'>('overlay');
  const [colormap, setColormap] = useState<'jet' | 'turbo' | 'inferno'>('jet');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [lensPosition, setLensPosition] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Render the Grad-CAM activation heatmap onto the HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 450;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    // Create an ImageData buffer for high performance pixel-level rendering
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Compute activation intensity across pixels
    for (let py = 0; py < height; py++) {
      const normY = py / height;
      for (let px = 0; px < width; px++) {
        const normX = px / width;
        const intensity = calculateActivationIntensity(normX, normY, focalPoints);
        const idx = (py * width + px) * 4;

        if (intensity < 0.08) {
          // Transparent for negligible activations
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 0;
        } else {
          const [r, g, b] = getColorMapRGB(intensity, colormap);
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          // Smoothly ramp alpha based on activation intensity
          const alphaVal = Math.min(255, Math.floor(Math.pow(intensity, 0.8) * 240));
          data[idx + 3] = alphaVal;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [focalPoints, colormap]);

  // Handle interactive lens inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
    setLensPosition({ x, y });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Visualizer Header Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-800 text-sm tracking-tight">
            Explainable AI Workspace (Grad-CAM)
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-medium">
            Model Attention
          </span>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setViewMode('overlay')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'overlay'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Layered Overlay View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overlay</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Side-by-Side Comparison"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
          <button
            onClick={() => setViewMode('heatmap_only')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
              viewMode === 'heatmap_only'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Heatmap Isolated View"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Heatmap Only</span>
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Display Area */}
      <div className="p-4 bg-slate-900 flex items-center justify-center min-h-[380px]">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
            {/* Original Image Card */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <span>Original {modality === 'chest_xray' ? 'Radiograph' : 'Lesion'}</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-slate-700 bg-black aspect-square w-full max-w-[340px] flex items-center justify-center">
                <img
                  src={originalImageUrl}
                  alt="Original medical input"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Combined Heatmap Overlay Card */}
            <div className="flex flex-col items-center">
              <div className="text-xs font-semibold text-teal-400 mb-2 flex items-center gap-1.5">
                <span>Grad-CAM Activation Overlay ({Math.round(opacity * 100)}%)</span>
              </div>
              <div className="relative rounded-lg overflow-hidden border border-teal-500/30 bg-black aspect-square w-full max-w-[340px] flex items-center justify-center">
                <img
                  src={originalImageUrl}
                  alt="Background medical input"
                  className="w-full h-full object-contain absolute inset-0"
                />
                <canvas
                  ref={canvasRef}
                  style={{ opacity: opacity }}
                  className="w-full h-full object-contain absolute inset-0 pointer-events-none"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Single Overlay or Heatmap Only */
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setLensPosition(null)}
            className={`relative rounded-xl overflow-hidden border border-slate-700 bg-black aspect-square w-full max-w-[420px] shadow-2xl transition-all ${
              isZoomed ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            {viewMode !== 'heatmap_only' && (
              <img
                src={originalImageUrl}
                alt="Medical scan input"
                className="w-full h-full object-contain absolute inset-0 select-none"
              />
            )}
            <canvas
              ref={canvasRef}
              style={{ opacity: viewMode === 'heatmap_only' ? 1.0 : opacity }}
              className="w-full h-full object-contain absolute inset-0 pointer-events-none"
            />

            {/* Magnifier Lens when zoom is toggled */}
            {isZoomed && lensPosition && (
              <div
                className="absolute pointer-events-none rounded-full border-2 border-teal-400 shadow-2xl bg-black overflow-hidden z-20"
                style={{
                  width: '120px',
                  height: '120px',
                  left: `${lensPosition.x - 60}px`,
                  top: `${lensPosition.y - 60}px`,
                }}
              >
                <div
                  className="relative w-[840px] h-[840px]"
                  style={{
                    transform: `translate(${-lensPosition.x * 2 + 60}px, ${-lensPosition.y * 2 + 60}px)`,
                  }}
                >
                  <img
                    src={originalImageUrl}
                    alt="Zoomed scan"
                    className="w-[840px] h-[840px] object-contain absolute inset-0"
                  />
                  <canvas
                    width={450}
                    height={450}
                    style={{ opacity }}
                    className="w-[840px] h-[840px] object-contain absolute inset-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visualizer Controls Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Opacity Slider */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <span className="font-semibold text-slate-700 whitespace-nowrap">Heatmap Opacity:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-32 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <span className="font-mono text-slate-600 w-9 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>

        {/* Colormap Selector */}
        <div className="flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold text-slate-700">Palette:</span>
          {(['jet', 'turbo', 'inferno'] as const).map((cm) => (
            <button
              key={cm}
              onClick={() => setColormap(cm)}
              className={`px-2 py-0.5 rounded capitalize font-medium transition-colors ${
                colormap === cm
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cm}
            </button>
          ))}
        </div>

        {/* Zoom inspection toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
              isZoomed
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isZoomed ? 'Exit Magnifier' : 'Magnifier Lens'}</span>
          </button>
          <button
            onClick={() => {
              setOpacity(0.65);
              setColormap('jet');
              setViewMode('overlay');
              setIsZoomed(false);
            }}
            className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors"
            title="Reset Controls"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Model Attention Explanation Callout */}
      <div className="p-4 bg-teal-50/50 border-t border-teal-100 flex items-start gap-3 text-xs text-slate-700">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-teal-900 mb-0.5">
            Interpretation of Attention Heatmap:
          </p>
          <p className="text-slate-600 leading-relaxed">
            {explanation ||
              'Highlighted regions represent visual features that had the highest gradient influence on the model’s convolutional filters.'}
          </p>
          {peakActivationRegion && (
            <p className="mt-1 text-teal-800 font-medium">
              Peak Gradient Activation Zone: <span className="font-semibold">{peakActivationRegion}</span>
            </p>
          )}
          <p className="mt-1 text-slate-500 italic">
            Notice: Highlighted regions represent areas that influenced the model’s prediction. They do not necessarily correspond to disease or abnormalities.
          </p>
        </div>
      </div>
    </div>
  );
};
