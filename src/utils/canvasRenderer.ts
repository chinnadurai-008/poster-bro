import { PosterProject, CanvasElement, TextElement, ShapeElement, ImageElement, BadgeElement, LineElement, QrElement } from '../types/poster';
import { generateQrMatrix } from './qrCode';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draws rounded rectangle path on canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws multi-point star
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  points: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / points;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < points; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

export async function renderPosterToCanvas(project: PosterProject, scale: number = 2): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = project.width * scale;
  canvas.height = project.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Scale context for ultra-crisp HiDPI rendering
  ctx.scale(scale, scale);

  // 1. Draw Background
  const bg = project.background;
  ctx.fillStyle = bg.color || '#0a0a0c';
  ctx.fillRect(0, 0, project.width, project.height);

  if (bg.type === 'gradient' && bg.gradient) {
    const angleRad = ((bg.gradient.angle || 0) * Math.PI) / 180;
    const x2 = Math.cos(angleRad) * project.width;
    const y2 = Math.sin(angleRad) * project.height;
    const grad = ctx.createLinearGradient(0, 0, x2, y2);
    grad.addColorStop(0, bg.gradient.colors[0]);
    grad.addColorStop(1, bg.gradient.colors[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, project.width, project.height);
  } else if (bg.type === 'image' && bg.imageUrl) {
    try {
      const bgImg = await loadImage(bg.imageUrl);
      ctx.save();
      ctx.globalAlpha = bg.imageOpacity ?? 0.8;
      if (bg.imageBlur) {
        ctx.filter = `blur(${bg.imageBlur}px)`;
      }
      ctx.drawImage(bgImg, 0, 0, project.width, project.height);
      ctx.restore();
    } catch {
      // image fallback: solid color already painted
    }
  }

  // Draw background texture pattern if present
  if (bg.pattern && bg.pattern !== 'none') {
    ctx.save();
    ctx.globalAlpha = bg.patternOpacity ?? 0.12;
    if (bg.pattern === 'dots') {
      ctx.fillStyle = '#ffffff';
      const gap = 20;
      for (let x = 10; x < project.width; x += gap) {
        for (let y = 10; y < project.height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (bg.pattern === 'grid') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.75;
      const gap = 30;
      ctx.beginPath();
      for (let x = 0; x <= project.width; x += gap) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, project.height);
      }
      for (let y = 0; y <= project.height; y += gap) {
        ctx.moveTo(0, y);
        ctx.lineTo(project.width, y);
      }
      ctx.stroke();
    } else if (bg.pattern === 'grain') {
      // Subtle noise dots
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4000; i++) {
        const nx = Math.random() * project.width;
        const ny = Math.random() * project.height;
        ctx.fillRect(nx, ny, 1, 1);
      }
    }
    ctx.restore();
  }

  // 2. Pre-load all external images in the elements
  const imageMap = new Map<string, HTMLImageElement>();
  for (const el of project.elements) {
    if (el.type === 'image' && el.src) {
      try {
        const img = await loadImage(el.src);
        imageMap.set(el.id, img);
      } catch {
        // failed load handled gracefully
      }
    }
  }

  // Ensure fonts are loaded before painting
  try {
    await document.fonts.ready;
  } catch {
    // continue
  }

  // 3. Render Elements in layer order
  for (const el of project.elements) {
    if (el.hidden) continue;

    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;

    // Apply rotation around element center
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    ctx.translate(cx, cy);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }
    ctx.translate(-cx, -cy);

    // Apply drop shadow if defined
    if (el.shadow) {
      ctx.shadowColor = el.shadow.color;
      ctx.shadowBlur = el.shadow.blur;
      ctx.shadowOffsetX = el.shadow.offsetX;
      ctx.shadowOffsetY = el.shadow.offsetY;
    }

    if (el.type === 'shape') {
      renderShape(ctx, el);
    } else if (el.type === 'text') {
      renderText(ctx, el);
    } else if (el.type === 'image') {
      const img = imageMap.get(el.id);
      renderImage(ctx, el, img);
    } else if (el.type === 'badge') {
      renderBadge(ctx, el);
    } else if (el.type === 'line') {
      renderLine(ctx, el);
    } else if (el.type === 'qr') {
      renderQr(ctx, el);
    }

    ctx.restore();
  }

  return canvas;
}

function renderShape(ctx: CanvasRenderingContext2D, el: ShapeElement) {
  ctx.save();
  ctx.fillStyle = el.fillColor;
  ctx.strokeStyle = el.strokeColor || 'transparent';
  ctx.lineWidth = el.strokeWidth || 0;

  if (el.shape === 'rectangle') {
    if (el.borderRadius) {
      drawRoundedRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
      if (el.fillColor !== 'transparent') ctx.fill();
      if (el.strokeWidth > 0) ctx.stroke();
    } else {
      if (el.fillColor !== 'transparent') ctx.fillRect(el.x, el.y, el.width, el.height);
      if (el.strokeWidth > 0) ctx.strokeRect(el.x, el.y, el.width, el.height);
    }
  } else if (el.shape === 'pill') {
    const r = Math.min(el.width, el.height) / 2;
    drawRoundedRect(ctx, el.x, el.y, el.width, el.height, r);
    if (el.fillColor !== 'transparent') ctx.fill();
    if (el.strokeWidth > 0) ctx.stroke();
  } else if (el.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(el.x + el.width / 2, el.y + el.height / 2, Math.min(el.width, el.height) / 2, 0, Math.PI * 2);
    if (el.fillColor !== 'transparent') ctx.fill();
    if (el.strokeWidth > 0) ctx.stroke();
  } else if (el.shape === 'star') {
    drawStar(ctx, el.x + el.width / 2, el.y + el.height / 2, 5, el.width / 2, el.width / 4);
    if (el.fillColor !== 'transparent') ctx.fill();
    if (el.strokeWidth > 0) ctx.stroke();
  } else if (el.shape === 'star-burst') {
    drawStar(ctx, el.x + el.width / 2, el.y + el.height / 2, 16, el.width / 2, el.width / 2.6);
    if (el.fillColor !== 'transparent') ctx.fill();
    if (el.strokeWidth > 0) ctx.stroke();
  } else if (el.shape === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(el.x + el.width / 2, el.y);
    ctx.lineTo(el.x + el.width, el.y + el.height);
    ctx.lineTo(el.x, el.y + el.height);
    ctx.closePath();
    if (el.fillColor !== 'transparent') ctx.fill();
    if (el.strokeWidth > 0) ctx.stroke();
  } else if (el.shape === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(el.x + el.width / 2, el.y);
    ctx.lineTo(el.x + el.width, el.y + el.height / 2);
    ctx.lineTo(el.x + el.width / 2, el.y + el.height);
    ctx.lineTo(el.x, el.y + el.height / 2);
    ctx.closePath();
    if (el.fillColor !== 'transparent') ctx.fill();
    if (el.strokeWidth > 0) ctx.stroke();
  }
  ctx.restore();
}

function renderText(ctx: CanvasRenderingContext2D, el: TextElement) {
  ctx.save();
  const fontStyle = el.fontStyle === 'italic' ? 'italic ' : '';
  const fontWeight = el.fontWeight || '400';
  ctx.font = `${fontStyle}${fontWeight} ${el.fontSize}px "${el.fontFamily}", sans-serif`;
  ctx.fillStyle = el.color;
  ctx.textAlign = el.textAlign || 'left';
  ctx.textBaseline = 'top';

  let rawText = el.text;
  if (el.textTransform === 'uppercase') rawText = rawText.toUpperCase();
  if (el.textTransform === 'lowercase') rawText = rawText.toLowerCase();

  const lines = rawText.split('\n');
  const lineHeight = el.fontSize * (el.lineHeight || 1.15);

  let startX = el.x;
  if (el.textAlign === 'center') startX = el.x + el.width / 2;
  if (el.textAlign === 'right') startX = el.x + el.width;

  lines.forEach((line, index) => {
    const curY = el.y + index * lineHeight;
    if (el.stroke && el.stroke.width > 0) {
      ctx.strokeStyle = el.stroke.color;
      ctx.lineWidth = el.stroke.width * 2;
      ctx.strokeText(line, startX, curY);
    }
    ctx.fillText(line, startX, curY);
  });

  ctx.restore();
}

function renderImage(ctx: CanvasRenderingContext2D, el: ImageElement, img?: HTMLImageElement) {
  if (!img) {
    // Fallback styled rectangle
    ctx.fillStyle = '#27272a';
    ctx.fillRect(el.x, el.y, el.width, el.height);
    return;
  }

  ctx.save();
  if (el.filters) {
    const filters: string[] = [];
    if (el.filters.brightness !== undefined) filters.push(`brightness(${el.filters.brightness}%)`);
    if (el.filters.contrast !== undefined) filters.push(`contrast(${el.filters.contrast}%)`);
    if (el.filters.saturation !== undefined) filters.push(`saturate(${el.filters.saturation}%)`);
    if (el.filters.blur) filters.push(`blur(${el.filters.blur}px)`);
    if (el.filters.grayscale) filters.push(`grayscale(${el.filters.grayscale}%)`);
    if (el.filters.sepia) filters.push(`sepia(${el.filters.sepia}%)`);
    if (el.filters.invert) filters.push(`invert(${el.filters.invert}%)`);
    if (filters.length > 0) ctx.filter = filters.join(' ');
  }

  if (el.borderRadius) {
    drawRoundedRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
    ctx.clip();
  }

  ctx.drawImage(img, el.x, el.y, el.width, el.height);

  if (el.strokeWidth && el.strokeWidth > 0) {
    ctx.strokeStyle = el.strokeColor || '#ffffff';
    ctx.lineWidth = el.strokeWidth;
    if (el.borderRadius) {
      drawRoundedRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius);
      ctx.stroke();
    } else {
      ctx.strokeRect(el.x, el.y, el.width, el.height);
    }
  }

  ctx.restore();
}

function renderBadge(ctx: CanvasRenderingContext2D, el: BadgeElement) {
  ctx.save();
  const radius = el.badgeType === 'sale-pill' ? el.height / 2 : 8;

  // Background
  drawRoundedRect(ctx, el.x, el.y, el.width, el.height, radius);
  ctx.fillStyle = el.bgColor;
  ctx.fill();

  // Border/Accent
  ctx.strokeStyle = el.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Text
  ctx.fillStyle = el.textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${el.fontSize}px "Outfit", sans-serif`;

  if (el.secondaryText) {
    ctx.fillText(el.primaryText, el.x + el.width / 2, el.y + el.height * 0.38);
    ctx.font = `600 ${Math.max(9, el.fontSize * 0.6)}px "Outfit", sans-serif`;
    ctx.fillStyle = el.accentColor;
    ctx.fillText(el.secondaryText, el.x + el.width / 2, el.y + el.height * 0.72);
  } else {
    ctx.fillText(el.primaryText, el.x + el.width / 2, el.y + el.height / 2);
  }

  ctx.restore();
}

function renderLine(ctx: CanvasRenderingContext2D, el: LineElement) {
  ctx.save();
  ctx.strokeStyle = el.strokeColor;
  ctx.lineWidth = el.strokeWidth;
  if (el.lineStyle === 'dashed') ctx.setLineDash([8, 6]);
  if (el.lineStyle === 'dotted') ctx.setLineDash([2, 4]);

  ctx.beginPath();
  ctx.moveTo(el.x, el.y + el.height / 2);
  ctx.lineTo(el.x + el.width, el.y + el.height / 2);
  ctx.stroke();
  ctx.restore();
}

function renderQr(ctx: CanvasRenderingContext2D, el: QrElement) {
  ctx.save();
  // Background card
  drawRoundedRect(ctx, el.x, el.y, el.width, el.height, 8);
  ctx.fillStyle = el.lightColor;
  ctx.fill();

  // QR matrix
  const matrix = generateQrMatrix(el.value || 'https://posterbro.app', 25);
  const padding = el.height * 0.1;
  const qrSize = Math.min(el.width, el.height) - padding * 2;
  const cellSize = qrSize / 25;
  const startX = el.x + (el.width - qrSize) / 2;
  const startY = el.y + (el.height - qrSize) / 2;

  ctx.fillStyle = el.darkColor;
  for (let r = 0; r < 25; r++) {
    for (let c = 0; c < 25; c++) {
      if (matrix[r][c]) {
        ctx.fillRect(startX + c * cellSize, startY + r * cellSize, cellSize + 0.3, cellSize + 0.3);
      }
    }
  }

  ctx.restore();
}

export async function downloadPoster(project: PosterProject, format: 'png' | 'jpeg' = 'png', scale: number = 2) {
  const canvas = await renderPosterToCanvas(project, scale);
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = canvas.toDataURL(mime, 0.95);
  const link = document.createElement('a');
  link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-poster.${format}`;
  link.href = dataUrl;
  link.click();
}

export async function copyPosterToClipboard(project: PosterProject): Promise<boolean> {
  try {
    const canvas = await renderPosterToCanvas(project, 2);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return true;
  } catch (err) {
    console.error('Clipboard copy error:', err);
    return false;
  }
}
