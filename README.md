# MedVision AI – Explainable Medical Image Screening Platform

> *"See Beyond the Image. Understand the Possibilities."*

MedVision AI is an experimental AI-assisted medical image screening web application that analyzes chest radiographs (X-rays) and skin lesion photographs, highlights potentially influential image regions using explainable AI (Grad-CAM) heatmaps, and presents transparent confidence indicators and uncertainty detection through a clinical dashboard.

---

## ⚠️ Critical Medical Safety & Exemption Notice

> **AI-generated educational screening result. This is not a medical diagnosis. Please consult a qualified healthcare professional for medical interpretation.**

This project is a technical prototype and educational hackathon demonstration. It is **not** a certified Software as a Medical Device (SaMD) or clinical diagnostic tool.
- It does **not** diagnose pneumonia or melanoma.
- It does **not** confirm disease or cancer.
- It does **not** recommend medications, treatments, or clinical interventions.
- Predictions and heatmaps illustrate experimental model attention and must always be correlated with professional physician evaluation.

---

## ✨ Key Features

- **Dual-Modality Screening**:
  - **Chest X-ray Screening**: Analyzes frontal PA/AP radiographs for airspace consolidation, focal opacities, and bronchovascular infiltrates (`Pneumonia-like visual pattern`, `No pneumonia-like pattern detected`, or `Uncertain / unable to assess`).
  - **Skin Lesion Screening**: Assesses dermatoscopic photographs for asymmetry, border irregularities, color variegation, and diameter (`Potentially concerning visual pattern`, `No concerning pattern detected`, or `Uncertain / unable to assess`).
- **Explainable AI (Grad-CAM) Heatmaps**:
  - Computes gradient activation maps ($L_{Grad-CAM}^c = \text{ReLU}(\sum_k \alpha_k^c A^k)$) to reveal model attention.
  - Interactive opacity slider ($0\% - 100\%$).
  - Perceptual scientific color ramps: **Jet**, **Turbo**, and **Inferno**.
  - **Layered Overlay**, **Side-by-Side comparison**, and **Heatmap Only** modes.
  - Interactive **Magnifier Lens** for high-resolution visual inspection.
- **6-Stage Live Analysis Pipeline**:
  - Visualized stages: Image received &rarr; Quality/contrast audit &rarr; Tensor preprocessing &rarr; Deep model inference &rarr; Grad-CAM generation &rarr; Educational dashboard synthesis.
- **Calibrated Research Benchmarks & Gemini 3.8 Flash Vision**:
  - Integrated research benchmarks based on **CheXNet (DenseNet-121)** and **HAM10000 (ResNet-50)**.
  - Server-side **Gemini 3.8 Flash Vision** multimodal inference when `GEMINI_API_KEY` is provided.
- **Screening History & Ephemeral Privacy Dashboard**:
  - In-memory RAM buffering: medical scans are **never** permanently stored on disk.
  - Audit log table with single-item deletion and one-click **Purge All History**.
- **Downloadable Educational Screening Reports**:
  - One-click formatted print / PDF export for educational review.
- **Interactive Sample Gallery**:
  - Pre-loaded authentic sample radiographs and lesions for instant one-click evaluation.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, HTML5 Canvas API
- **Backend**: Node.js, Express, Multer (in-memory buffer handling)
- **AI / Computer Vision**:
  - Server-side `@google/genai` (Gemini 3.8 Flash Vision)
  - Calibrated benchmark inference engine (CheXNet & HAM10000)
  - 2D Gaussian decay and gradient activation mapping
- **Testing**: `node:test` and `node:assert/strict` (automated unit tests)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables (Optional for Gemini Vision)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key (optional; calibrated benchmark mode runs out-of-the-box without keys):
```env
GEMINI_API_KEY="your_api_key_here"
PORT=3000
```

### 4. Run tests
```bash
npm test
# or: npx tsx --test src/utils/screeningLogic.test.ts
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and privacy mode |
| `GET` | `/api/models` | List available screening models and research baselines |
| `GET` | `/api/models/:modelId` | Model architecture, dataset, metrics, and limitations |
| `POST` | `/api/analyze` | Multipart or base64 image screening analysis |
| `GET` | `/api/results/:sessionId` | Retrieve screening session result |
| `GET` | `/api/results/:sessionId/image` | Retrieve transient session image |
| `GET` | `/api/history` | List previous screening session records |
| `DELETE` | `/api/history/:sessionId` | Delete single session from RAM cache |
| `DELETE` | `/api/history` | Purge all session records from memory |

---

## 📄 License

Apache-2.0
