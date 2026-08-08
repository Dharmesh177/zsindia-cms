'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Product, SerialNumber } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, ArrowLeft, Plus, Ban, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { QRExportFormat } from '@/lib/qr-export';
import { getUniqueBatches, QR_CODES_PER_A4_PAGE } from '@/lib/qr-batch-utils';

const QRExportOverlay = dynamic(
  () => import('@/components/qr-export-overlay').then((mod) => ({ default: mod.QRExportOverlay })),
  { ssr: false }
);

const ALL_BATCHES = 'all';

export default function SerialNumbersPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<SerialNumber | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [batchNumber, setBatchNumber] = useState('');
  const [downloadBatch, setDownloadBatch] = useState(ALL_BATCHES);
  const [downloadFormat, setDownloadFormat] = useState<QRExportFormat>('pdf');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [exportMessage, setExportMessage] = useState('Preparing QR codes for download...');
  const exportInProgressRef = useRef(false);

  const baseUrl = 'https://zsindia.com';

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productData, serialData] = await Promise.all([
        api.getProduct(params.id as string),
        api.getProductSerialNumbers(params.id as string),
      ]);
      setProduct(productData);
      setSerialNumbers(serialData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const activeSerials = useMemo(
    () => serialNumbers.filter((s) => s.status === 'active'),
    [serialNumbers]
  );

  const batches = useMemo(() => getUniqueBatches(serialNumbers), [serialNumbers]);

  const serialsForDownload = useMemo(() => {
    if (downloadBatch === ALL_BATCHES) return activeSerials;
    return activeSerials.filter((s) => s.batchNumber === downloadBatch);
  }, [activeSerials, downloadBatch]);

  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 1000) {
      toast.error('Quantity must be between 1 and 1000');
      return;
    }

    if (!batchNumber.trim()) {
      toast.error('Batch number is required');
      return;
    }

    try {
      setGenerating(true);
      const newSerials = await api.generateSerialNumbers(
        params.id as string,
        quantity,
        batchNumber.trim()
      );
      setSerialNumbers([...newSerials, ...serialNumbers]);
      toast.success(`${quantity} serial number(s) generated successfully`);
      setShowGenerateDialog(false);
      setQuantity(1);
      setBatchNumber('');
    } catch (error) {
      console.error('Failed to generate serial numbers:', error);
      toast.error('Failed to generate serial numbers');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeactivate = async (serialId: string) => {
    try {
      await api.deactivateSerialNumber(serialId);
      setSerialNumbers(
        serialNumbers.map((s) =>
          s._id === serialId ? { ...s, status: 'deactivated' } : s
        )
      );
      toast.success('Serial number deactivated');
    } catch (error) {
      console.error('Failed to deactivate:', error);
      toast.error('Failed to deactivate serial number');
    }
  };

  const handleDownloadSingle = async (serial: SerialNumber) => {
    if (!product || exportInProgressRef.current) return;

    exportInProgressRef.current = true;
    setDownloading(true);
    setExportMessage('Generating QR code...');
    setDownloadProgress({ current: 0, total: 1 });

    try {
      const { downloadSingleQR } = await import('@/lib/qr-export');
      await downloadSingleQR(
        `${baseUrl}/verify/${serial.serialNumber}`,
        product.name,
        product.slug,
        serial.serialNumber,
        serial.batchNumber || 'no-batch'
      );
      setDownloadProgress({ current: 1, total: 1 });
      toast.success('QR code downloaded');
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast.error('Failed to download QR code');
    } finally {
      exportInProgressRef.current = false;
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const handleBulkDownload = async () => {
    if (!product || serialsForDownload.length === 0 || exportInProgressRef.current) return;

    if (downloadFormat === 'png' && serialsForDownload.length > 20) {
      toast.warning('Separate PNG downloads may be blocked by the browser. ZIP is recommended for large batches.');
    }

    const batchLabel =
      downloadBatch === ALL_BATCHES ? 'all-batches' : downloadBatch;

    exportInProgressRef.current = true;
    setDownloading(true);
    setExportMessage(
      downloadFormat === 'pdf'
        ? 'Building PDF — one QR code per page...'
        : downloadFormat === 'zip'
          ? 'Creating ZIP archive...'
          : 'Downloading PNG files...'
    );
    setDownloadProgress({ current: 0, total: serialsForDownload.length });

    try {
      const { exportQRCodes } = await import('@/lib/qr-export');
      await exportQRCodes({
        productName: product.name,
        productSlug: product.slug,
        batchLabel,
        format: downloadFormat,
        items: serialsForDownload.map((serial) => ({
          serialNumber: serial.serialNumber,
          batchNumber: serial.batchNumber || 'no-batch',
          verifyUrl: `${baseUrl}/verify/${serial.serialNumber}`,
        })),
        onProgress: (current, total) => setDownloadProgress({ current, total }),
      });

      toast.success(
        downloadFormat === 'pdf'
          ? 'PDF downloaded successfully'
          : downloadFormat === 'zip'
            ? 'ZIP downloaded successfully'
            : 'QR codes downloaded'
      );
      setShowDownloadDialog(false);
    } catch (error) {
      console.error('Failed to export QR codes:', error);
      toast.error('Failed to export QR codes');
    } finally {
      exportInProgressRef.current = false;
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const deactivatedSerials = serialNumbers.filter((s) => s.status === 'deactivated');
  const estimatedPdfPages = Math.ceil(serialsForDownload.length / QR_CODES_PER_A4_PAGE);

  return (
    <div className="space-y-6" aria-busy={downloading}>
      <QRExportOverlay
        open={downloading}
        current={downloadProgress.current}
        total={downloadProgress.total}
        message={exportMessage}
      />
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/products/${params.id}`}>
          <Button variant="ghost" size="icon" disabled={downloading}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Serial Numbers & QR Codes</h1>
          <p className="text-gray-500 mt-1">{product.name}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowDownloadDialog(true)}
            variant="outline"
            disabled={activeSerials.length === 0 || downloading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Codes
          </Button>
          <Button onClick={() => setShowGenerateDialog(true)} disabled={downloading}>
            <Plus className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{serialNumbers.length}</CardTitle>
            <CardDescription>Total Serial Numbers</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">{activeSerials.length}</CardTitle>
            <CardDescription>Active</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">{deactivatedSerials.length}</CardTitle>
            <CardDescription>Deactivated</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Serial Numbers</CardTitle>
          <CardDescription>Manage unique serial numbers for each product unit</CardDescription>
        </CardHeader>
        <CardContent>
          {serialNumbers.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No serial numbers generated yet</p>
              <Button onClick={() => setShowGenerateDialog(true)} disabled={downloading}>
                <Plus className="mr-2 h-4 w-4" />
                Generate Serial Numbers
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified Count</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serialNumbers.map((serial) => (
                  <TableRow key={serial._id}>
                    <TableCell className="font-mono font-semibold">
                      {serial.serialNumber}
                    </TableCell>
                    <TableCell>{serial.batchNumber || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={serial.status === 'active' ? 'default' : 'destructive'}>
                        {serial.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {serial.verifiedCount > 0 ? (
                        <Badge variant="secondary">{serial.verifiedCount}</Badge>
                      ) : (
                        <span className="text-gray-400">Not verified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(serial.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSerial(serial);
                            setShowQRDialog(true);
                          }}
                          disabled={serial.status === 'deactivated' || downloading}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadSingle(serial)}
                          disabled={serial.status === 'deactivated' || downloading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(serial._id)}
                          disabled={serial.status === 'deactivated' || downloading}
                        >
                          <Ban className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={showGenerateDialog}
        onOpenChange={(open) => {
          if (!open && downloading) return;
          setShowGenerateDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Serial Numbers</DialogTitle>
            <DialogDescription>
              Create unique serial numbers for product units in a batch
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={1000}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                placeholder="Enter quantity"
              />
              <p className="text-xs text-gray-500">Maximum 1000 per batch</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch Number</Label>
              <Input
                id="batch"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g., Q1-2026 or BATCH-2024-01"
                required
              />
              <p className="text-xs text-gray-500">Required — used to group and download QR codes</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating || !batchNumber.trim()}>
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDownloadDialog}
        onOpenChange={(open) => {
          if (!open && downloading) return;
          setShowDownloadDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download QR Codes</DialogTitle>
            <DialogDescription>
              Select a batch and format. Batch number is included in the file name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Batch</Label>
              <Select value={downloadBatch} onValueChange={setDownloadBatch} disabled={downloading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_BATCHES}>
                    All batches ({activeSerials.length} codes)
                  </SelectItem>
                  {batches.map((batch) => {
                    const count = activeSerials.filter((s) => s.batchNumber === batch).length;
                    return (
                      <SelectItem key={batch} value={batch}>
                        {batch} ({count} codes)
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Format</Label>
              <RadioGroup
                value={downloadFormat}
                onValueChange={(value) => setDownloadFormat(value as QRExportFormat)}
                disabled={downloading}
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="pdf" id="format-pdf" className="mt-1" />
                  <Label htmlFor="format-pdf" className="font-normal cursor-pointer">
                    <span className="font-medium">Merged PDF</span>
                    <span className="block text-xs text-gray-500">
                      1 QR code per A4 page — ready to print
                      {serialsForDownload.length > 0 && ` (~${estimatedPdfPages} pages)`}
                    </span>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="zip" id="format-zip" className="mt-1" />
                  <Label htmlFor="format-zip" className="font-normal cursor-pointer">
                    <span className="font-medium">ZIP of PNGs</span>
                    <span className="block text-xs text-gray-500">
                      One download, separate PNG files inside
                    </span>
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="png" id="format-png" className="mt-1" />
                  <Label htmlFor="format-png" className="font-normal cursor-pointer">
                    <span className="font-medium">Separate PNG files</span>
                    <span className="block text-xs text-gray-500">
                      Individual downloads — use for small batches only
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {serialsForDownload.length > 0 && !downloading && (
              <p className="text-sm text-gray-600">
                {serialsForDownload.length} QR code(s) will be exported with product name and serial
                on each label.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDownloadDialog(false)} disabled={downloading}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkDownload}
              disabled={downloading || serialsForDownload.length === 0}
            >
              {downloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showQRDialog}
        onOpenChange={(open) => {
          if (!open && downloading) return;
          setShowQRDialog(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Download or print this QR code with product name and serial number
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {selectedSerial && (
              <>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <QRCodeSVG
                    value={`${baseUrl}/verify/${selectedSerial.serialNumber}`}
                    size={300}
                    level="H"
                    includeMargin
                  />
                  <p className="text-center font-bold text-base mt-3 text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-center font-mono font-bold text-sm mt-1 text-gray-700">
                    {selectedSerial.serialNumber}
                  </p>
                </div>
                <p className="text-sm text-gray-600 text-center max-w-xs break-all">
                  {baseUrl}/verify/{selectedSerial.serialNumber}
                </p>
              </>
            )}
            <Button
              onClick={() => selectedSerial && handleDownloadSingle(selectedSerial)}
              disabled={downloading}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
