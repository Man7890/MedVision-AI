/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SampleCase {
  id: string;
  modality: 'chest_xray' | 'skin_lesion';
  title: string;
  category: string;
  expectedPattern: string;
  description: string;
  clinicalNotes: string;
  imageUrl: string;
  difficulty: 'Standard' | 'Subtle' | 'Challenging' | 'Quality Control';
}

function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

// 1. Normal Chest Radiograph (Clear lung fields, sharp costophrenic angles)
const normalXraySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="normalLungGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a0f18"/>
      <stop offset="85%" stop-color="#141c2b"/>
      <stop offset="100%" stop-color="#243044"/>
    </radialGradient>
    <filter id="boneBlur" x="-10%" y="-10%" width="120%" height="120%">
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>
  </defs>
  <!-- Background Thoracic Field -->
  <rect width="500" height="500" fill="#080c14"/>
  
  <!-- Thoracic Cage Outline -->
  <path d="M 120 70 C 250 50, 250 50, 380 70 C 430 180, 440 340, 400 450 C 330 465, 170 465, 100 450 C 60 340, 70 180, 120 70 Z" fill="url(#normalLungGrad)"/>

  <!-- Thoracic Spine & Mediastinum -->
  <path d="M 235 60 L 265 60 L 268 440 L 232 440 Z" fill="#2d3748" opacity="0.6"/>
  <rect x="242" y="70" width="16" height="360" rx="3" fill="#4a5568" opacity="0.5"/>
  
  <!-- Trachea (air column) -->
  <rect x="246" y="65" width="8" height="90" rx="4" fill="#0a0f18"/>

  <!-- Left & Right Clavicles -->
  <path d="M 100 95 Q 180 85 240 100" stroke="#718096" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.7" filter="url(#boneBlur)"/>
  <path d="M 400 95 Q 320 85 260 100" stroke="#718096" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.7" filter="url(#boneBlur)"/>

  <!-- Ribs (Posterior & Anterior Arc) -->
  <g stroke="#4a5568" stroke-width="7" fill="none" opacity="0.45" stroke-linecap="round">
    <path d="M 235 130 Q 140 120 95 160"/>
    <path d="M 265 130 Q 360 120 405 160"/>
    <path d="M 235 170 Q 130 160 85 210"/>
    <path d="M 265 170 Q 370 160 415 210"/>
    <path d="M 235 220 Q 120 215 80 270"/>
    <path d="M 265 220 Q 380 215 420 270"/>
    <path d="M 235 270 Q 120 270 85 330"/>
    <path d="M 265 270 Q 380 270 415 330"/>
    <path d="M 235 325 Q 130 330 95 390"/>
    <path d="M 265 325 Q 370 330 405 390"/>
  </g>

  <!-- Normal Cardiac Silhouette & Aortic Knob -->
  <!-- Aortic Knob -->
  <path d="M 260 150 Q 285 160 275 180 Q 260 190 255 200" fill="#4a5568" opacity="0.75"/>
  <!-- Cardiac Apex (oriented towards left hemithorax) -->
  <path d="M 245 200 C 230 250, 190 320, 230 360 C 270 400, 340 370, 320 310 C 300 250, 270 210, 245 200 Z" fill="#4a5568" opacity="0.8"/>

  <!-- Left & Right Hemidiaphragm with Sharp Costophrenic Angles -->
  <!-- Right Hemidiaphragm (slightly higher) -->
  <path d="M 85 410 C 130 360, 210 365, 235 410 L 85 410" fill="#2d3748" opacity="0.9"/>
  <!-- Left Hemidiaphragm -->
  <path d="M 255 420 C 290 380, 370 380, 415 425 L 255 425" fill="#2d3748" opacity="0.9"/>

  <!-- Normal Bronchovascular Markings -->
  <g stroke="#334155" stroke-width="2" fill="none" opacity="0.6">
    <path d="M 210 200 Q 170 220 140 250"/>
    <path d="M 210 220 Q 160 260 130 300"/>
    <path d="M 290 200 Q 330 220 360 250"/>
    <path d="M 290 220 Q 340 260 370 300"/>
  </g>

  <!-- Radiographic Marker -->
  <text x="440" y="50" font-family="sans-serif" font-size="24" font-weight="bold" fill="#718096">R</text>
  <text x="30" y="475" font-family="sans-serif" font-size="12" fill="#4a5568">PA ERECT | EXP</text>
</svg>
`;

// 2. Right Lower Lobe Consolidation (Pneumonia-like airspace opacity)
const pneumoniaXraySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="consolidationGrad" cx="40%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#cbd5e1" stop-opacity="0.95"/>
      <stop offset="50%" stop-color="#94a3b8" stop-opacity="0.75"/>
      <stop offset="85%" stop-color="#475569" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#1e293b" stop-opacity="0"/>
    </radialGradient>
    <filter id="consolidationBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5"/>
    </filter>
  </defs>
  <!-- Background Thoracic Field -->
  <rect width="500" height="500" fill="#080c14"/>
  
  <!-- Thoracic Cage Outline -->
  <path d="M 120 70 C 250 50, 250 50, 380 70 C 430 180, 440 340, 400 450 C 330 465, 170 465, 100 450 C 60 340, 70 180, 120 70 Z" fill="#0f172a"/>

  <!-- Thoracic Spine -->
  <rect x="242" y="70" width="16" height="360" rx="3" fill="#4a5568" opacity="0.5"/>
  <rect x="246" y="65" width="8" height="90" rx="4" fill="#0a0f18"/>

  <!-- Clavicles -->
  <path d="M 100 95 Q 180 85 240 100" stroke="#718096" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.7"/>
  <path d="M 400 95 Q 320 85 260 100" stroke="#718096" stroke-width="12" stroke-linecap="round" fill="none" opacity="0.7"/>

  <!-- Cardiac Silhouette -->
  <path d="M 245 200 C 230 250, 190 320, 230 360 C 270 400, 340 370, 320 310 C 300 250, 270 210, 245 200 Z" fill="#4a5568" opacity="0.8"/>

  <!-- Left Hemidiaphragm (Clear) -->
  <path d="M 255 420 C 290 380, 370 380, 415 425 L 255 425" fill="#2d3748" opacity="0.9"/>
  <!-- Right Hemidiaphragm (Obscured by Consolidation - Silhouette sign) -->
  <path d="M 85 410 C 130 360, 210 365, 235 410 L 85 410" fill="#2d3748" opacity="0.6"/>

  <!-- Dense Airspace Consolidation in Right Mid-to-Lower Zone -->
  <ellipse cx="165" cy="310" rx="60" ry="45" fill="url(#consolidationGrad)" filter="url(#consolidationBlur)"/>
  <ellipse cx="145" cy="340" rx="45" ry="35" fill="url(#consolidationGrad)" filter="url(#consolidationBlur)"/>

  <!-- Air Bronchograms (dark branching radiolucencies traversing opaque lung) -->
  <path d="M 175 285 Q 165 315 150 335" stroke="#0a0f18" stroke-width="2.5" fill="none" opacity="0.85"/>
  <path d="M 165 315 Q 155 330 140 345" stroke="#0a0f18" stroke-width="2" fill="none" opacity="0.85"/>
  <path d="M 165 315 Q 180 330 185 348" stroke="#0a0f18" stroke-width="1.8" fill="none" opacity="0.85"/>

  <!-- Ribs overlay -->
  <g stroke="#4a5568" stroke-width="7" fill="none" opacity="0.35" stroke-linecap="round">
    <path d="M 235 130 Q 140 120 95 160"/>
    <path d="M 265 130 Q 360 120 405 160"/>
    <path d="M 235 220 Q 120 215 80 270"/>
    <path d="M 265 220 Q 380 215 420 270"/>
    <path d="M 235 270 Q 120 270 85 330"/>
    <path d="M 265 270 Q 380 270 415 330"/>
  </g>

  <!-- Radiographic Marker -->
  <text x="440" y="50" font-family="sans-serif" font-size="24" font-weight="bold" fill="#718096">R</text>
  <text x="30" y="475" font-family="sans-serif" font-size="12" fill="#ef4444" opacity="0.8">FOCAL OPACITY: RLL</text>
</svg>
`;

// 3. Bilateral Infiltrates Chest Radiograph
const bilateralInfiltratesSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="infiltrateGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#94a3b8" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
    </radialGradient>
    <filter id="diffuseBlur">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
  </defs>
  <rect width="500" height="500" fill="#080c14"/>
  <path d="M 120 70 C 250 50, 250 50, 380 70 C 430 180, 440 340, 400 450 C 330 465, 170 465, 100 450 C 60 340, 70 180, 120 70 Z" fill="#0f172a"/>
  <rect x="242" y="70" width="16" height="360" rx="3" fill="#4a5568" opacity="0.5"/>
  <path d="M 245 200 C 230 250, 190 320, 230 360 C 270 400, 340 370, 320 310 C 300 250, 270 210, 245 200 Z" fill="#4a5568" opacity="0.8"/>

  <!-- Bilateral Perihilar Infiltrates -->
  <circle cx="170" cy="270" r="55" fill="url(#infiltrateGrad)" filter="url(#diffuseBlur)"/>
  <circle cx="330" cy="260" r="50" fill="url(#infiltrateGrad)" filter="url(#diffuseBlur)"/>
  <circle cx="150" cy="330" r="40" fill="url(#infiltrateGrad)" filter="url(#diffuseBlur)"/>
  <circle cx="350" cy="320" r="45" fill="url(#infiltrateGrad)" filter="url(#diffuseBlur)"/>

  <text x="440" y="50" font-family="sans-serif" font-size="24" font-weight="bold" fill="#718096">R</text>
</svg>
`;

// 4. Low Quality / Suboptimal Radiograph (Triggers Uncertainty)
const lowQualityXraySvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <filter id="heavyBlur">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>
  <!-- Low contrast washed out grayscale -->
  <rect width="500" height="500" fill="#334155"/>
  <circle cx="250" cy="250" r="180" fill="#475569" filter="url(#heavyBlur)"/>
  <path d="M 120 70 C 250 50, 250 50, 380 70 C 430 180, 440 340, 400 450 C 330 465, 170 465, 100 450 Z" fill="#64748b" opacity="0.5" filter="url(#heavyBlur)"/>
  <text x="250" y="250" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">SUBOPTIMAL PENETRATION &amp; MOTION ARTIFACT</text>
</svg>
`;

// 5. Benign Melanocytic Nevus (Regular pigment network, oval symmetry)
const benignNevusSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="skinBase" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f8d7c4"/>
      <stop offset="100%" stop-color="#e2b8a0"/>
    </radialGradient>
    <radialGradient id="nevusCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#4a2e1b"/>
      <stop offset="60%" stop-color="#6a4427"/>
      <stop offset="88%" stop-color="#8a5a35"/>
      <stop offset="100%" stop-color="#ab7448" stop-opacity="0.3"/>
    </radialGradient>
    <filter id="softSkin">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feColorMatrix type="matrix" values="0.1 0 0 0 0.9  0 0.1 0 0 0.8  0 0 0.1 0 0.7  0 0 0 0.08 0" result="coloredNoise"/>
      <feComposite in="SourceGraphic" in2="coloredNoise" operator="over"/>
    </filter>
  </defs>
  <!-- Surrounding Skin -->
  <rect width="500" height="500" fill="url(#skinBase)"/>
  
  <!-- Dermoscopy Lens Ring Guide -->
  <circle cx="250" cy="250" r="230" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.4"/>
  <circle cx="250" cy="250" r="235" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.3"/>

  <!-- Symmetric Oval Benign Nevus Core -->
  <ellipse cx="250" cy="250" rx="100" ry="85" fill="url(#nevusCore)"/>

  <!-- Homogeneous Reticular Pigment Network (delicate lattice) -->
  <g stroke="#3d2413" stroke-width="1.2" opacity="0.4" fill="none">
    <ellipse cx="250" cy="250" rx="80" ry="68"/>
    <ellipse cx="250" cy="250" rx="60" ry="50"/>
    <ellipse cx="250" cy="250" rx="40" ry="32"/>
    <line x1="200" y1="210" x2="300" y2="290"/>
    <line x1="200" y1="290" x2="300" y2="210"/>
    <line x1="170" y1="250" x2="330" y2="250"/>
    <line x1="250" y1="180" x2="250" y2="320"/>
  </g>

  <!-- Dermoscopic Measurement Scale Bar (10mm) -->
  <line x1="50" y1="460" x2="150" y2="460" stroke="#475569" stroke-width="3"/>
  <line x1="50" y1="453" x2="50" y2="467" stroke="#475569" stroke-width="3"/>
  <line x1="150" y1="453" x2="150" y2="467" stroke="#475569" stroke-width="3"/>
  <text x="80" y="450" font-family="sans-serif" font-size="12" font-weight="bold" fill="#475569">5 mm</text>
  <text x="350" y="460" font-family="sans-serif" font-size="12" fill="#64748b">DERM 10x POL</text>
</svg>
`;

// 6. Atypical / Concerning Pigmented Lesion (Asymmetric, irregular notched border, color variegation)
const atypicalLesionSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="atypicalSkin" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fae3d5"/>
      <stop offset="100%" stop-color="#e0bba3"/>
    </radialGradient>
    <filter id="lesionTexture">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <rect width="500" height="500" fill="url(#atypicalSkin)"/>

  <!-- Dermoscopy Outer Ring -->
  <circle cx="250" cy="250" r="230" fill="none" stroke="#ffffff" stroke-width="8" opacity="0.4"/>

  <!-- Asymmetric, Irregular Scalloped Contour (ABCD: Asymmetry & Border Irregularity) -->
  <path d="M 210 160 C 270 140, 340 170, 360 220 C 380 270, 370 330, 310 360 C 260 380, 190 370, 160 320 C 130 270, 160 180, 210 160 Z" fill="#2c1a11" filter="url(#lesionTexture)"/>
  
  <!-- Color Variegation Zone 1: Dark Black/Brown Eccentric Nodular Area -->
  <path d="M 230 180 C 280 170, 330 200, 340 240 C 350 280, 310 300, 270 290 C 230 280, 210 240, 230 180 Z" fill="#140a05"/>

  <!-- Color Variegation Zone 2: Blue-white veil / slate gray area -->
  <ellipse cx="280" cy="250" rx="35" ry="25" fill="#4a5d6e" opacity="0.75"/>

  <!-- Color Variegation Zone 3: Erythematous / reddish peripheral glow -->
  <path d="M 160 280 Q 140 310 170 340 Q 200 370 230 350" stroke="#b91c1c" stroke-width="12" fill="none" opacity="0.6"/>

  <!-- Peripheral Pigment Streaks / Pseudopods -->
  <path d="M 360 220 Q 385 225 390 235" stroke="#2c1a11" stroke-width="4" stroke-linecap="round"/>
  <path d="M 355 260 Q 380 270 385 285" stroke="#2c1a11" stroke-width="4" stroke-linecap="round"/>
  <path d="M 330 340 Q 345 365 350 375" stroke="#2c1a11" stroke-width="4" stroke-linecap="round"/>

  <!-- Measurement Scale Bar -->
  <line x1="50" y1="460" x2="190" y2="460" stroke="#475569" stroke-width="3"/>
  <line x1="50" y1="453" x2="50" y2="467" stroke="#475569" stroke-width="3"/>
  <line x1="190" y1="453" x2="190" y2="467" stroke="#475569" stroke-width="3"/>
  <text x="95" y="450" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ef4444">> 7 mm</text>
  <text x="350" y="460" font-family="sans-serif" font-size="12" fill="#64748b">DERM 10x POL</text>
</svg>
`;

// 7. Seborrheic Keratosis (Stuck-on appearance, comedo-like openings)
const seborrheicKeratosisSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <rect width="500" height="500" fill="#edd4c2"/>
  <circle cx="250" cy="250" r="110" fill="#5c4033" stroke="#3e2723" stroke-width="4"/>
  <!-- Comedo-like pseudocomedone openings -->
  <circle cx="220" cy="210" r="7" fill="#1b120c"/>
  <circle cx="280" cy="225" r="9" fill="#1b120c"/>
  <circle cx="240" cy="265" r="8" fill="#1b120c"/>
  <circle cx="290" cy="280" r="6" fill="#1b120c"/>
  <circle cx="195" cy="260" r="5" fill="#1b120c"/>
  <!-- Keratin cysts (milia-like cysts) -->
  <circle cx="260" cy="195" r="4" fill="#fff9c4"/>
  <circle cx="215" cy="290" r="5" fill="#fff9c4"/>
</svg>
`;

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'sample-xray-pneumonia-rll',
    modality: 'chest_xray',
    title: 'Right Lower Lobe Consolidation',
    category: 'Airspace Opacification',
    expectedPattern: 'Pneumonia-like pattern',
    difficulty: 'Standard',
    description:
      'High-contrast frontal radiograph exhibiting dense alveolar opacity in the right lower pulmonary zone with air bronchograms.',
    clinicalNotes:
      'Classic silhouette sign with partial loss of the right hemidiaphragmatic margin. Model attention expected over the dense focal infiltrate.',
    imageUrl: svgToDataUrl(pneumoniaXraySvg),
  },
  {
    id: 'sample-xray-normal-bilateral',
    modality: 'chest_xray',
    title: 'Unremarkable Bilateral Lung Fields',
    category: 'Normal Screening Baseline',
    expectedPattern: 'No pneumonia-like pattern',
    difficulty: 'Standard',
    description:
      'Frontal PA chest radiograph demonstrating clear bilateral parenchyma, sharp costophrenic recesses, and normal cardiothoracic ratio.',
    clinicalNotes:
      'Unremarkable lung volumes with symmetric vascular arborization. Grad-CAM baseline activation remains low and diffuse without focal spikes.',
    imageUrl: svgToDataUrl(normalXraySvg),
  },
  {
    id: 'sample-xray-bilateral-infiltrates',
    modality: 'chest_xray',
    title: 'Bilateral Perihilar Infiltrates',
    category: 'Diffuse Reticulonodular Pattern',
    expectedPattern: 'Pneumonia-like pattern',
    difficulty: 'Challenging',
    description:
      'Subtle interstitial and alveolar haziness distributed across both perihilar pulmonary zones.',
    clinicalNotes:
      'Evaluates model sensitivity for multi-focal presentations where gradient activation splits between bilateral regions.',
    imageUrl: svgToDataUrl(bilateralInfiltratesSvg),
  },
  {
    id: 'sample-xray-low-quality',
    modality: 'chest_xray',
    title: 'Suboptimal Penetration & Artifact',
    category: 'Quality Control Failure',
    expectedPattern: 'Uncertain / Unable to assess',
    difficulty: 'Quality Control',
    description:
      'Under-penetrated frontal radiograph with low contrast dynamic range and motion blurring.',
    clinicalNotes:
      'Validates uncertainty detection engine. System must safely refuse confident classification on degraded diagnostic inputs.',
    imageUrl: svgToDataUrl(lowQualityXraySvg),
  },
  {
    id: 'sample-skin-atypical-lesion',
    modality: 'skin_lesion',
    title: 'Atypical Pigmented Lesion',
    category: 'Structural Asymmetry & Border Notch',
    expectedPattern: 'Potentially concerning pattern',
    difficulty: 'Standard',
    description:
      'Dermatoscopic image displaying architectural asymmetry across orthogonal axes, irregular notched borders, and multi-tone pigmentation.',
    clinicalNotes:
      'Focal peripheral streaks and eccentric hyperpigmentation. Grad-CAM gradients peak along the irregular scalloped margins.',
    imageUrl: svgToDataUrl(atypicalLesionSvg),
  },
  {
    id: 'sample-skin-benign-nevus',
    modality: 'skin_lesion',
    title: 'Benign Melanocytic Nevus',
    category: 'Uniform Reticular Pattern',
    expectedPattern: 'No concerning pattern',
    difficulty: 'Standard',
    description:
      'Symmetric, oval, uniformly pigmented dermatoscopic lesion with delicate homogeneous pigment network and sharp, regular margins.',
    clinicalNotes:
      'Absence of atypical pigment network or eccentric globules. Model attention is distributed symmetrically over the central core.',
    imageUrl: svgToDataUrl(benignNevusSvg),
  },
  {
    id: 'sample-skin-seborrheic-keratosis',
    modality: 'skin_lesion',
    title: 'Seborrheic Keratosis Pattern',
    category: 'Benign Keratinizing Epithelial',
    expectedPattern: 'No concerning pattern',
    difficulty: 'Subtle',
    description:
      'Well-demarcated verrucous lesion with characteristic keratin pseudofollicular openings and milia-like cysts.',
    clinicalNotes:
      'High diagnostic specificity case testing differentiation between melanocytic atypia and benign non-melanocytic keratotic lesions.',
    imageUrl: svgToDataUrl(seborrheicKeratosisSvg),
  },
];
