/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileImage,
  X,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { SAMPLE_CASES, SampleCase } from '../data/sampleCases.ts';
import { validateImageInput } from '../utils/screeningLogic.ts';
import { ensureBase64Png } from '../utils/imageRasterizer.ts';

interface ImageUploaderProps {
  modality: 'chest_xray' | 'skin_lesion';
  selectedImage: string | null;
  onImageSelected: (dataUrl: string, sampleHint?: string) => void;
  onClearImage: () => void;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  modality,
  selectedImage,
  onImageSelected,
  onClearImage,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredSamples = SAMPLE_CASES.filter((c) => c.modality === modality);

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    const validation = validateImageInput(file.type, file.size);
    if (!validation.valid) {
      setErrorMsg(validation.error || 'Invalid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleSelectSample = async (sample: SampleCase) => {
    setErrorMsg(null);
    try {
      const pngUrl = await ensureBase64Png(sample.imageUrl);
      onImageSelected(pngUrl, sample.id);
    } catch {
      onImageSelected(sample.imageUrl, sample.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!selectedImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
              : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/50'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileInputChange}
          />

          <div className="mx-auto w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 shadow-xs">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight mb-1">
            Drag &amp; Drop {modality === 'chest_xray' ? 'Chest Radiograph' : 'Skin Lesion Photo'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-4">
            Supported formats: standard JPEG, PNG, or WebP. Maximum file size 10 MB.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <FileImage className="w-4 h-4" />
            <span>Browse Computer Files</span>
          </button>

          {/* Privacy footnote */}
          <p className="text-2xs text-slate-400 mt-4 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            Images are processed ephemerally in RAM; no permanent cloud retention.
          </p>
        </div>
      ) : (
        /* Image Preview & Replacement Card */
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span>Image Loaded &amp; Ready for Screening</span>
            </div>
            <button
              onClick={onClearImage}
              disabled={disabled}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove Image</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-black border border-slate-300 shadow-inner flex items-center justify-center shrink-0">
              <img
                src={selectedImage}
                alt="Selected medical preview"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2 text-xs text-slate-600 w-full">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-semibold text-slate-700 block mb-1">
                  Target Modality:
                </span>
                <span className="capitalize font-mono text-teal-800 font-bold">
                  {modality === 'chest_xray' ? 'Frontal Chest Radiograph (X-ray)' : 'Dermatoscopic Skin Lesion'}
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                Click &ldquo;Begin AI Screening&rdquo; to launch the 6-stage feature extraction, model inference, and Grad-CAM activation heatmap pipeline.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Pre-loaded Sample Case Selector */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Or Select from Validated Educational Sample Cases:</span>
          </div>
          <span className="text-2xs text-slate-400">Instant One-Click Load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {filteredSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              disabled={disabled}
              className="text-left p-3 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/40 transition-all group flex flex-col justify-between shadow-2xs"
            >
              <div className="aspect-square w-full rounded-lg bg-black mb-2.5 overflow-hidden flex items-center justify-center border border-slate-100">
                <img
                  src={sample.imageUrl}
                  alt={sample.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <div>
                <span className="inline-block px-1.5 py-0.5 rounded text-3xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 mb-1">
                  {sample.difficulty}
                </span>
                <h4 className="font-semibold text-xs text-slate-900 group-hover:text-teal-700 line-clamp-1">
                  {sample.title}
                </h4>
                <p className="text-2xs text-slate-500 line-clamp-2 mt-0.5">
                  {sample.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
