'use client';

import { useEffect, useState, useRef } from 'react';
import { api, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function VerifyProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        toast.error('Failed to fetch products');
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    setSelectedProduct(product || null);
  };

  const handleDownload = () => {
    if (!selectedProduct) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 512;
    canvas.height = 512;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `qr-${selectedProduct.slug}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('QR code downloaded');
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    if (!selectedProduct) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow pop-ups to print');
      return;
    }

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${selectedProduct.name}</title>
          <style>
            @media print {
              body {
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: Arial, sans-serif;
              }
              .print-container {
                text-align: center;
                padding: 20px;
              }
              h1 {
                margin-bottom: 10px;
                font-size: 24px;
              }
              p {
                margin-bottom: 20px;
                color: #666;
              }
              svg {
                width: 300px;
                height: 300px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${selectedProduct.name}</h1>
            <p>Scan to verify product authenticity</p>
            ${svgData}
            <p style="margin-top: 20px; font-size: 12px;">https://zsindia.com/verify/${selectedProduct._id}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const verificationUrl = selectedProduct
    ? `https://zsindia.com/verify/${selectedProduct._id}`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate QR Code</h1>
        <p className="text-gray-500 mt-1">
          Create QR codes for product verification
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Product</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select onValueChange={handleProductSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a product..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product._id} value={product._id}>
                  {product.name} - {product.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProduct && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span className="text-gray-700">{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <span className="text-gray-700">{selectedProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Family:</span>
                <span className="text-gray-700">{selectedProduct.family}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>QR Code Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                ref={qrRef}
                className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border"
              >
                <QRCodeSVG value={verificationUrl} size={256} level="H" />
                <p className="mt-4 text-sm text-gray-600 break-all max-w-md text-center">
                  {verificationUrl}
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download QR
                </Button>
                <Button onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print QR
                </Button>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">Usage Instructions:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Customers can scan this QR code to verify product authenticity</li>
                  <li>The QR code links to: {verificationUrl}</li>
                  <li>Print and attach to product packaging or documentation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
