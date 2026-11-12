import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateImageInput,
  evaluateUncertainty,
  getColorMapRGB,
  calculateActivationIntensity,
  normalizeDistribution,
  MANDATORY_MEDICAL_DISCLAIMER,
  RESEARCH_MODELS,
} from './screeningLogic';

test('validates medical image inputs correctly', () => {
  assert.equal(validateImageInput('image/jpeg', 50000).valid, true);
  assert.equal(validateImageInput('image/png', 200000).valid, true);
  assert.equal(validateImageInput('image/svg+xml', 10000).valid, true);
  assert.equal(validateImageInput('application/pdf', 50000).valid, false);
  assert.equal(validateImageInput('image/jpeg', 15 * 1024 * 1024).valid, false);
  assert.equal(validateImageInput('image/jpeg', 500).valid, false);
});

test('evaluates uncertainty categories correctly', () => {
  assert.equal(evaluateUncertainty(0.92, [0.08]), 'confident');
  assert.equal(evaluateUncertainty(0.72, [0.28]), 'moderate_uncertainty');
  assert.equal(evaluateUncertainty(0.51, [0.49]), 'high_uncertainty');
  assert.equal(evaluateUncertainty(null, []), 'high_uncertainty');
  assert.equal(evaluateUncertainty(0.95, [], { blurDetected: true }), 'unassessable');
  assert.equal(evaluateUncertainty(0.95, [], { lowResolution: true }), 'unassessable');
});

test('calculates colormap RGB within valid 0-255 bounds', () => {
  for (const cm of ['jet', 'turbo', 'inferno'] as const) {
    for (const val of [0.0, 0.25, 0.5, 0.75, 1.0]) {
      const rgb = getColorMapRGB(val, cm);
      assert.equal(rgb.length, 3);
      assert.ok(rgb[0] >= 0 && rgb[0] <= 255);
      assert.ok(rgb[1] >= 0 && rgb[1] <= 255);
      assert.ok(rgb[2] >= 0 && rgb[2] <= 255);
    }
  }
});

test('calculates 2D activation intensity accurately with Gaussian decay', () => {
  const focalPoints = [{ x: 0.5, y: 0.5, intensity: 0.9, radius: 0.2 }];

  // Center should be highest
  const centerIntensity = calculateActivationIntensity(0.5, 0.5, focalPoints);
  assert.ok(centerIntensity >= 0.89);

  // Far away should decay towards zero
  const farIntensity = calculateActivationIntensity(0.0, 0.0, focalPoints);
  assert.ok(farIntensity < 0.05);

  // Empty points returns zero
  assert.equal(calculateActivationIntensity(0.5, 0.5, []), 0);
});

test('normalizes probability distribution safely', () => {
  const raw = [
    { className: 'pneumonia', displayName: 'Pneumonia Pattern', score: 3.5 },
    { className: 'normal', displayName: 'No Pattern Detected', score: 1.5 },
  ];
  const normalized = normalizeDistribution(raw);
  assert.equal(normalized[0].score, 0.7);
  assert.equal(normalized[1].score, 0.3);
});

test('ensures mandatory medical disclaimer is non-empty and safety compliant', () => {
  assert.ok(MANDATORY_MEDICAL_DISCLAIMER.includes('not a medical diagnosis'));
  assert.ok(MANDATORY_MEDICAL_DISCLAIMER.includes('consult a qualified healthcare professional'));
});

test('ensures research benchmark models are fully documented with metrics and limitations', () => {
  assert.ok(RESEARCH_MODELS['chexnet-dense121']);
  assert.ok(RESEARCH_MODELS['ham10000-resnet50']);
  assert.ok(RESEARCH_MODELS['chexnet-dense121'].limitations.length >= 3);
  assert.ok(RESEARCH_MODELS['ham10000-resnet50'].metrics.aucRoc > 0.8);
});
