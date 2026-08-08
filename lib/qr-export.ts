import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export type QRExportFormat = 'pdf' | 'zip' | 'png';

export interface QRExportItem {
  serialNumber: string;
  batchNumber: string;
  verifyUrl: string;
}

export interface QRExportOptions {
  productName: string;
  productSlug: string;
  items: QRExportItem[];
  format: QRExportFormat;
  batchLabel: string;
  onProgress?: (current: number, total: number) => void;
}

const CANVAS_SIZE = 800;
const TEXT_AREA_HEIGHT = 130;

/** One QR code per A4 page for easy print-and-cut. */
export const QR_CODES_PER_A4_PAGE = 1;
const PDF_PAGE_WIDTH = 210;
const PDF_PAGE_HEIGHT = 297;
const PDF_MARGIN = 15;

function sanitizeFilename(value: string): string {
  return value.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated.length > 0 ? `${truncated}…` : text.slice(0, 1);
}

export async function createQRCanvas(
  verifyUrl: string,
  productName: string,
  serialNumber: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE + TEXT_AREA_HEIGHT;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, verifyUrl, {
    width: CANVAS_SIZE,
    margin: 2,
    errorCorrectionLevel: 'H',
  });
  ctx.drawImage(qrCanvas, 0, 0);

  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';

  ctx.font = 'bold 32px Arial, sans-serif';
  const productLine = truncateText(ctx, productName, CANVAS_SIZE - 40);
  ctx.fillText(productLine, CANVAS_SIZE / 2, CANVAS_SIZE + 42);

  ctx.font = '26px "Courier New", monospace';
  ctx.fillText(serialNumber, CANVAS_SIZE / 2, CANVAS_SIZE + 88);

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create image blob'));
    }, 'image/png');
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildExportBasename(productSlug: string, batchLabel: string): string {
  const slug = sanitizeFilename(productSlug);
  const batch = sanitizeFilename(batchLabel);
  return `${slug}-${batch}-qr-codes`;
}

function buildPngFilename(productSlug: string, batchNumber: string, serialNumber: string): string {
  return `${sanitizeFilename(productSlug)}-${sanitizeFilename(batchNumber)}-${serialNumber}.png`;
}

async function generateAllCanvases(
  productName: string,
  items: QRExportItem[],
  onProgress?: (current: number, total: number) => void
): Promise<HTMLCanvasElement[]> {
  const canvases: HTMLCanvasElement[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    canvases.push(
      await createQRCanvas(item.verifyUrl, productName, item.serialNumber)
    );
    onProgress?.(i + 1, items.length);
  }
  return canvases;
}

async function exportAsPdf(
  productName: string,
  productSlug: string,
  batchLabel: string,
  items: QRExportItem[],
  onProgress?: (current: number, total: number) => void
) {
  const canvases = await generateAllCanvases(productName, items, onProgress);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const usableWidth = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
  const usableHeight = PDF_PAGE_HEIGHT - PDF_MARGIN * 2;

  canvases.forEach((canvas, index) => {
    if (index > 0) pdf.addPage();

    const dataUrl = canvas.toDataURL('image/png');
    const aspectRatio = canvas.width / canvas.height;
    let imageWidth = usableWidth;
    let imageHeight = imageWidth / aspectRatio;

    if (imageHeight > usableHeight) {
      imageHeight = usableHeight;
      imageWidth = imageHeight * aspectRatio;
    }

    const x = (PDF_PAGE_WIDTH - imageWidth) / 2;
    const y = (PDF_PAGE_HEIGHT - imageHeight) / 2;
    pdf.addImage(dataUrl, 'PNG', x, y, imageWidth, imageHeight);
  });

  pdf.save(`${buildExportBasename(productSlug, batchLabel)}.pdf`);
}

async function exportAsZip(
  productSlug: string,
  items: QRExportItem[],
  canvases: HTMLCanvasElement[]
) {
  const zip = new JSZip();

  for (let i = 0; i < items.length; i++) {
    const blob = await canvasToBlob(canvases[i]);
    const filename = buildPngFilename(productSlug, items[i].batchNumber, items[i].serialNumber);
    zip.file(filename, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  return zipBlob;
}

async function exportAsSeparatePngs(
  productSlug: string,
  items: QRExportItem[],
  canvases: HTMLCanvasElement[]
) {
  for (let i = 0; i < items.length; i++) {
    const blob = await canvasToBlob(canvases[i]);
    const filename = buildPngFilename(productSlug, items[i].batchNumber, items[i].serialNumber);
    downloadBlob(blob, filename);
    if (i < items.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }
}

export async function exportQRCodes(options: QRExportOptions): Promise<void> {
  const { productName, productSlug, items, format, batchLabel, onProgress } = options;

  if (items.length === 0) {
    throw new Error('No QR codes to export');
  }

  if (format === 'pdf') {
    await exportAsPdf(productName, productSlug, batchLabel, items, onProgress);
    return;
  }

  const canvases = await generateAllCanvases(productName, items, onProgress);

  if (format === 'zip') {
    const zipBlob = await exportAsZip(productSlug, items, canvases);
    downloadBlob(zipBlob, `${buildExportBasename(productSlug, batchLabel)}.zip`);
    return;
  }

  await exportAsSeparatePngs(productSlug, items, canvases);
}

export function getUniqueBatches(
  serialNumbers: Array<{ batchNumber?: string; status: string }>
): string[] {
  const batches = new Set<string>();
  serialNumbers
    .filter((s) => s.status === 'active' && s.batchNumber)
    .forEach((s) => batches.add(s.batchNumber!));
  return Array.from(batches).sort();
}

export async function downloadSingleQR(
  verifyUrl: string,
  productName: string,
  productSlug: string,
  serialNumber: string,
  batchNumber: string
): Promise<void> {
  const canvas = await createQRCanvas(verifyUrl, productName, serialNumber);
  const blob = await canvasToBlob(canvas);
  downloadBlob(blob, buildPngFilename(productSlug, batchNumber, serialNumber));
}
