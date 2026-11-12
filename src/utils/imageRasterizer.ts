/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Ensures an image string (such as an SVG data URL or raw vector)
 * is cleanly rasterized into a standard Base64 PNG data URL (data:image/png;base64,...)
 * compatible with both browser canvas and Gemini Vision API.
 */
export function ensureBase64Png(imageDataUrl: string): Promise<string> {
  // If already standard base64 PNG, WebP or JPEG, return directly
  if (
    imageDataUrl.startsWith('data:image/png;base64,') ||
    imageDataUrl.startsWith('data:image/jpeg;base64,') ||
    imageDataUrl.startsWith('data:image/webp;base64,')
  ) {
    return Promise.resolve(imageDataUrl);
  }

  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(imageDataUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 500;
        canvas.height = img.naturalHeight || img.height || 500;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          resolve(pngUrl);
        } else {
          resolve(imageDataUrl);
        }
      } catch (err) {
        console.warn('Rasterization fallback:', err);
        resolve(imageDataUrl);
      }
    };
    img.onerror = (err) => {
      console.warn('Image load error for rasterization:', err);
      resolve(imageDataUrl);
    };
    img.src = imageDataUrl;
  });
}
