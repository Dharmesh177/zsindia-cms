'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, ArrowLeft, QrCode } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';
import { OptimizedImage } from '@/components/optimized-image';

export default function ViewProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProduct(params.id as string);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const handleDelete = async () => {
    if (!product) return;

    try {
      await api.deleteProduct(product._id);
      toast.success('Product deleted successfully');
      router.push('/dashboard/products');
    } catch (error) {
      toast.error('Failed to delete product');
      console.error('Failed to delete product:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-gray-500">Product not found</p>
        <Link href="/dashboard/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500 mt-1">{product.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/products/${product._id}/serial-numbers`}>
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              QR Codes
            </Button>
          </Link>
          <Link href={`/dashboard/products/${product._id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{product.category}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Family</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{product.family}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Technology</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{product.technology}</p>
          </CardContent>
        </Card>
      </div>

      {product.images && product.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                  <OptimizedImage
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    containerClassName="w-full h-full"
                    className="bg-white"
                    objectFit="contain"
                    priority={index === 0}
                  />
                  {index === 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{product.overview}</p>
        </CardContent>
      </Card>

      {product.keyHighlights && product.keyHighlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {product.keyHighlights.map((highlight, index) => (
                <li key={index} className="text-gray-700">
                  {highlight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {product.features && product.features.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="text-gray-700">
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {product.specifications?.powerOutput && (
            <div className="flex justify-between">
              <span className="font-medium">Power Output:</span>
              <span className="text-gray-700">{product.specifications.powerOutput}</span>
            </div>
          )}
          {product.specifications?.channels && (
            <div className="flex justify-between">
              <span className="font-medium">Channels:</span>
              <span className="text-gray-700">{product.specifications.channels}</span>
            </div>
          )}
          {product.specifications?.inputChannels && (
            <div className="flex justify-between">
              <span className="font-medium">Input Channels:</span>
              <span className="text-gray-700">{product.specifications.inputChannels}</span>
            </div>
          )}
          {product.specifications?.digitalPlayer && (
            <div className="flex justify-between">
              <span className="font-medium">Digital Player:</span>
              <span className="text-gray-700">{product.specifications.digitalPlayer}</span>
            </div>
          )}
          {(product.specifications?.toneControl?.bass ||
            product.specifications?.toneControl?.mid ||
            product.specifications?.toneControl?.treble) && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium">Tone Control:</p>
                <div className="ml-4 space-y-1">
                  {product.specifications?.toneControl?.bass && (
                    <div className="flex justify-between">
                      <span>Bass:</span>
                      <span className="text-gray-700">
                        {product.specifications?.toneControl?.bass}
                      </span>
                    </div>
                  )}
                  {product.specifications?.toneControl?.mid && (
                    <div className="flex justify-between">
                      <span>Mid:</span>
                      <span className="text-gray-700">
                        {product.specifications?.toneControl?.mid}
                      </span>
                    </div>
                  )}
                  {product.specifications?.toneControl?.treble && (
                    <div className="flex justify-between">
                      <span>Treble:</span>
                      <span className="text-gray-700">
                        {product.specifications?.toneControl?.treble}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {product.specifications?.speakerOutput && (
            <div className="flex justify-between">
              <span className="font-medium">Speaker Output:</span>
              <span className="text-gray-700">{product.specifications?.speakerOutput}</span>
            </div>
          )}
          {product.specifications?.frequencyResponse && (
            <div className="flex justify-between">
              <span className="font-medium">Frequency Response:</span>
              <span className="text-gray-700">{product.specifications?.frequencyResponse}</span>
            </div>
          )}
          {product.specifications?.snRatio && (
            <div className="flex justify-between">
              <span className="font-medium">S/N Ratio:</span>
              <span className="text-gray-700">{product.specifications?.snRatio}</span>
            </div>
          )}
          {product.specifications?.powerSupply && (
            <div className="flex justify-between">
              <span className="font-medium">Power Supply:</span>
              <span className="text-gray-700">{product.specifications?.powerSupply}</span>
            </div>
          )}
          {product.specifications?.dimensions && (
            <div className="flex justify-between">
              <span className="font-medium">Dimensions:</span>
              <span className="text-gray-700">{product.specifications?.dimensions}</span>
            </div>
          )}
          {product.specifications?.weight && (
            <div className="flex justify-between">
              <span className="font-medium">Weight:</span>
              <span className="text-gray-700">{product.specifications?.weight}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {product.applications && product.applications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.applications.map((app, index) => (
                <Badge key={index} variant="outline">
                  {app}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {product.idealFor && product.idealFor.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ideal For</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.idealFor.map((item, index) => (
                <Badge key={index} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {product.tags && product.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index}>{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {product.warranty && (
        <Card>
          <CardHeader>
            <CardTitle>Warranty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{product.warranty}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
