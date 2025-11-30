'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { Download, QrCode, ArrowLeft, Plus, Ban } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import Link from 'next/link';

export default function SerialNumbersPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<SerialNumber | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [batchNumber, setBatchNumber] = useState('');

  // Get the base URL for QR codes
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

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

  const handleGenerate = async () => {
    if (quantity < 1 || quantity > 1000) {
      toast.error('Quantity must be between 1 and 1000');
      return;
    }

    try {
      setGenerating(true);
      const newSerials = await api.generateSerialNumbers(
        params.id as string,
        quantity,
        batchNumber || undefined
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
      setSerialNumbers(serialNumbers.map(s =>
        s._id === serialId ? { ...s, status: 'deactivated' } : s
      ));
      toast.success('Serial number deactivated');
    } catch (error) {
      console.error('Failed to deactivate:', error);
      toast.error('Failed to deactivate serial number');
    }
  };

  const downloadQR = (serial: SerialNumber) => {
    const svg = document.getElementById(`qr-${serial._id}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 1000;
    canvas.height = 1000;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 1000, 1000);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${product?.slug}-${serial.serialNumber}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadAllQRs = () => {
    serialNumbers.filter(s => s.status === 'active').forEach((serial, index) => {
      setTimeout(() => downloadQR(serial), index * 100);
    });
    toast.success('Downloading all QR codes...');
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

  const activeSerials = serialNumbers.filter(s => s.status === 'active');
  const deactivatedSerials = serialNumbers.filter(s => s.status === 'deactivated');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/products/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Serial Numbers & QR Codes</h1>
          <p className="text-gray-500 mt-1">{product.name}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadAllQRs} variant="outline" disabled={activeSerials.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Download All
          </Button>
          <Button onClick={() => setShowGenerateDialog(true)}>
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
              <Button onClick={() => setShowGenerateDialog(true)}>
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
                          disabled={serial.status === 'deactivated'}
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(serial._id)}
                          disabled={serial.status === 'deactivated'}
                        >
                          <Ban className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="hidden">
                        <QRCodeSVG
                          id={`qr-${serial._id}`}
                          value={`${baseUrl}/verify/${serial.serialNumber}`}
                          size={1000}
                          level="H"
                          includeMargin
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Serial Numbers</DialogTitle>
            <DialogDescription>
              Create unique serial numbers for product units
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
              <Label htmlFor="batch">Batch Number (Optional)</Label>
              <Input
                id="batch"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g., BATCH-2024-01"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
            <DialogDescription>
              Serial Number: {selectedSerial?.serialNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {selectedSerial && (
              <>
                <QRCodeSVG
                  value={`${baseUrl}/verify/${selectedSerial.serialNumber}`}
                  size={300}
                  level="H"
                  includeMargin
                />
                <p className="text-sm text-gray-600 text-center max-w-xs break-all">
                  {baseUrl}/verify/{selectedSerial.serialNumber}
                </p>
              </>
            )}
            <Button onClick={() => selectedSerial && downloadQR(selectedSerial)}>
              <Download className="mr-2 h-4 w-4" />
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
