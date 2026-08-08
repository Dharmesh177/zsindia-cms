'use client';

import { Loader2 } from 'lucide-react';

interface QRExportOverlayProps {
  open: boolean;
  current: number;
  total: number;
  message?: string;
}

export function QRExportOverlay({
  open,
  current,
  total,
  message = 'Preparing QR codes for download...',
}: QRExportOverlayProps) {
  if (!open) return null;

  const progress = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      aria-label="Exporting QR codes"
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">Exporting QR Codes</h2>
          <p className="mt-2 text-sm text-gray-500">{message}</p>
          {total > 0 && (
            <div className="mt-6 w-full space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                {current} of {total} ({progress}%)
              </p>
            </div>
          )}
          <p className="mt-4 text-xs text-gray-400">
            Please wait — do not close or refresh this page
          </p>
        </div>
      </div>
    </div>
  );
}
