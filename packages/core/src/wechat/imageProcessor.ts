import type { Asset, Diagnostic, WechatOptions } from '../types.js';

export async function processImages(
  doc: Document,
  options: WechatOptions
): Promise<{ assets: Asset[]; diagnostics: Diagnostic[] }> {
  const assets: Asset[] = [];
  const diagnostics: Diagnostic[] = [];
  const images = doc.querySelectorAll('img');

  Array.from(images).forEach((img) => {
    const src = img.getAttribute('src') ?? '';
    if (!src) return;

    const asset: Asset = {
      id: `img-${assets.length}`,
      type: 'image',
      originalUrl: src,
      currentSrc: src,
      requiresUpload: false,
    };

    if (src.startsWith('http')) {
      if (options.imageMode === 'upload') {
        asset.requiresUpload = true;
        diagnostics.push({
          level: 'warning',
          message: `外部图片需要上传: ${src}`,
          source: 'imageProcessor',
        });
      } else if (options.imageMode === 'placeholder') {
        asset.currentSrc = createPlaceholder(src, img.getAttribute('alt') ?? '');
        img.setAttribute('data-original-src', src);
        diagnostics.push({
          level: 'info',
          message: `外部图片已替换为占位符: ${src}`,
          source: 'imageProcessor',
        });
      } else {
        diagnostics.push({
          level: 'info',
          message: `保留外部图片 URL: ${src}`,
          source: 'imageProcessor',
        });
      }
    }

    if (asset.currentSrc !== src) {
      img.setAttribute('src', asset.currentSrc);
    }

    // Enforce WeChat-compatible image styles
    let style = img.getAttribute('style') ?? '';
    if (!style.includes('max-width')) {
      style += '; max-width: 100%;';
    }
    if (!style.includes('height')) {
      style += '; height: auto;';
    }
    if (!style.includes('display')) {
      style += '; display: block;';
    }
    if (!style.includes('margin')) {
      style += '; margin: 0 auto;';
    }
    img.setAttribute('style', style.replace(/^;\s*/, ''));

    assets.push(asset);
  });

  return { assets, diagnostics };
}

function createPlaceholder(_originalSrc: string, alt: string): string {
  const text = alt || 'Image';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
    <rect width="400" height="200" fill="#f0f0f0" rx="8"/>
    <text x="200" y="95" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#999">${escapeXml(text)}</text>
    <text x="200" y="120" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#bbb">[外链图片]</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
