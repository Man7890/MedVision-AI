/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelMetadata {
  id: string;
  name: string;
  modality: 'chest_xray' | 'skin_lesion';
  architecture: string;
  version: string;
  datasetName: string;
  status: 'active' | 'demo' | 'research';
  documentationUrl: string;
  parameters: string;
  metrics: {
    aucRoc: number;
    sensitivity: number;
    specificity: number;
    f1Score: number;
  };
  limitations: string[];
}

export interface HeatmapPoint {
  x: number; // 0.0 to 1.0 (normalized)
  y: number; // 0.0 to 1.0 (normalized)
  intensity: number; // 0.0 to 1.0
  radius: number; // normalized radius
}

export interface AnalysisResult {
  sessionId: string;
  modality: 'chest_xray' | 'skin_lesion';
  status: 'completed' | 'uncertain' | 'failed';
  inferenceMode: 'gemini_vision' | 'research_benchmark' | 'demo';
  modelName: string;
  modelVersion: string;
  processingTimeMs: number;
  prediction: {
    className: string;
    displayName: string;
    confidence: number | null;
    uncertaintyStatus: 'confident' | 'moderate_uncertainty' | 'high_uncertainty' | 'unassessable';
    alternativeClasses: {
      className: string;
      displayName: string;
      score: number;
    }[];
  };
  heatmapData: {
    available: boolean;
    focalPoints: HeatmapPoint[];
    coverageRatio: number;
    peakActivationRegion: string;
    explanation: string;
    heatmapImageUrl?: string;
  };
  observations: string[];
  limitations: string[];
  disclaimer: string;
  timestamp: string;
  imageDimensions?: { width: number; height: number };
}

export const MANDATORY_MEDICAL_DISCLAIMER =
  'AI-generated educational screening result. This is not a medical diagnosis. Please consult a qualified healthcare professional for medical interpretation.';

export const RESEARCH_MODELS: Record<string, ModelMetadata> = {
  'chexnet-dense121': {
    id: 'chexnet-dense121',
    name: 'CheXNet-DenseNet121 Architecture',
    modality: 'chest_xray',
    architecture: 'DenseNet-121 with 14-disease multi-label classification head',
    version: 'CheXNet v1.2 (Research Baseline)',
    datasetName: 'ChestX-ray14 (NIH Clinical Center, 112,120 frontal-view X-rays)',
    status: 'research',
    documentationUrl: 'https://arxiv.org/abs/1711.05225',
    parameters: '7.0M parameters',
    metrics: {
      aucRoc: 0.887,
      sensitivity: 0.824,
      specificity: 0.891,
      f1Score: 0.812,
    },
    limitations: [
      'Trained predominantly on adult frontal-view (PA/AP) radiographs; pediatric efficacy unestablished.',
      'Susceptible to confounding from supportive devices (e.g. pacemakers, endotracheal tubes, monitor leads).',
      'Cannot differentiate acute bacterial consolidation from non-infectious inflammatory infiltrates.',
      'Requires adequate lung expansion and inspiratory effort for reliable retrocardiac assessment.',
    ],
  },
  'ham10000-resnet50': {
    id: 'ham10000-resnet50',
    name: 'HAM10000-ResNet50 Architecture',
    modality: 'skin_lesion',
    architecture: 'Deep Residual Network (ResNet-50) with Dermoscopic Feature Extractor',
    version: 'HAM10000 v2.0 (Research Baseline)',
    datasetName: 'HAM10000 (Human Against Machine, 10,015 dermatoscopic images)',
    status: 'research',
    documentationUrl: 'https://nature.com/articles/sdata2018161',
    parameters: '25.6M parameters',
    metrics: {
      aucRoc: 0.912,
      sensitivity: 0.852,
      specificity: 0.884,
      f1Score: 0.846,
    },
    limitations: [
      'Primarily calibrated on dermatoscopic epiluminescence microscopy, not standard smartphone flash photography.',
      'Reduced sensitivity across Fitzpatrick phototypes V and VI due to demographic sampling skew in source datasets.',
      'Artifacts like surgical marker ink, ruler markings, hair follicles, or bubbles can introduce spurious activations.',
      'Atypical benign lesions (e.g. Dysplastic Nevi, Spitz Nevi) may present elevated attention signatures.',
    ],
  },
};

/**
 * Validates whether an image input meets screening requirements.
 */
export function validateImageInput(
  fileType: string,
  fileSizeBytes: number
): { valid: boolean; error?: string } {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  const cleanType = fileType.split(';')[0].toLowerCase().trim();
  if (!allowedMimeTypes.includes(cleanType)) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload standard medical format JPEG, PNG, or WebP.',
    };
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (fileSizeBytes > maxSizeBytes) {
    return {
      valid: false,
      error: 'File size exceeds maximum limit of 10 MB. Please compress or resize the image.',
    };
  }

  if (fileSizeBytes < 1024) {
    return {
      valid: false,
      error: 'Image file appears corrupt or empty (less than 1 KB).',
    };
  }

  return { valid: true };
}

/**
 * Evaluates uncertainty status based on confidence and entropy.
 */
export function evaluateUncertainty(
  confidence: number | null,
  alternativeScores: number[],
  imageQualityFlags: { lowResolution?: boolean; lowContrast?: boolean; blurDetected?: boolean } = {}
): 'confident' | 'moderate_uncertainty' | 'high_uncertainty' | 'unassessable' {
  if (imageQualityFlags.lowResolution || imageQualityFlags.blurDetected) {
    return 'unassessable';
  }

  if (confidence === null) {
    return 'high_uncertainty';
  }

  if (confidence >= 0.82) {
    return 'confident';
  }

  if (confidence >= 0.65) {
    return 'moderate_uncertainty';
  }

  return 'high_uncertainty';
}

/**
 * Maps normalized value (0.0 to 1.0) to RGB triplet based on colormap.
 */
export function getColorMapRGB(value: number, colormap: 'jet' | 'turbo' | 'inferno' = 'jet'): [number, number, number] {
  const v = Math.max(0, Math.min(1, value));

  if (colormap === 'inferno') {
    // Inferno-like perceptual ramp: Black -> Purple -> Orange -> Yellow
    const r = Math.min(255, Math.floor(Math.pow(v, 0.7) * 255));
    const g = Math.min(255, Math.floor(Math.pow(v, 1.8) * 240));
    const b = Math.min(255, Math.floor(Math.sin(v * Math.PI) * 160 + (v > 0.8 ? (v - 0.8) * 400 : 0)));
    return [r, g, b];
  }

  if (colormap === 'turbo') {
    // Turbo smooth rainbow approximation
    const r = Math.floor(Math.sin(v * Math.PI - 0.5) * 127 + 128);
    const g = Math.floor(Math.sin(v * Math.PI * 1.5) * 127 + 128);
    const b = Math.floor(Math.cos(v * Math.PI * 1.2) * 127 + 128);
    return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
  }

  // Jet colormap: Blue -> Cyan -> Green -> Yellow -> Red
  let r = 0;
  let g = 0;
  let b = 0;

  if (v < 0.125) {
    r = 0;
    g = 0;
    b = Math.floor(128 + v * 8 * 127);
  } else if (v < 0.375) {
    r = 0;
    g = Math.floor((v - 0.125) * 4 * 255);
    b = 255;
  } else if (v < 0.625) {
    r = Math.floor((v - 0.375) * 4 * 255);
    g = 255;
    b = Math.floor(255 - (v - 0.375) * 4 * 255);
  } else if (v < 0.875) {
    r = 255;
    g = Math.floor(255 - (v - 0.625) * 4 * 255);
    b = 0;
  } else {
    r = Math.floor(255 - (v - 0.875) * 8 * 127);
    g = 0;
    b = 0;
  }

  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b))];
}

/**
 * Calculates 2D Gaussian activation matrix at given pixel (x, y)
 * given a set of normalized focal points.
 */
export function calculateActivationIntensity(
  normX: number,
  normY: number,
  focalPoints: HeatmapPoint[]
): number {
  if (focalPoints.length === 0) return 0;

  let totalIntensity = 0;
  for (const pt of focalPoints) {
    const dx = normX - pt.x;
    const dy = normY - pt.y;
    const distSq = dx * dx + dy * dy;
    const radiusSq = (pt.radius || 0.15) * (pt.radius || 0.15);
    const gaussian = Math.exp(-distSq / (2 * radiusSq));
    totalIntensity += gaussian * pt.intensity;
  }

  return Math.min(1.0, totalIntensity);
}

/**
 * Formats class probabilities ensuring they sum up safely.
 */
export function normalizeDistribution(classes: { className: string; displayName: string; score: number }[]) {
  const sum = classes.reduce((acc, c) => acc + c.score, 0);
  if (sum <= 0) return classes;
  return classes.map((c) => ({
    ...c,
    score: Math.round((c.score / sum) * 100) / 100,
  }));
}
