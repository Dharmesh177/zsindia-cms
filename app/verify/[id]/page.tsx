'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Product } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function VerifyPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProduct(params.id as string);
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Verifying product...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
            <p className="text-gray-600">
              This product could not be verified. Please check the QR code or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-green-500">
          <CardContent className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Authentic Product Verified</h1>
            <p className="text-gray-600">
              This is a genuine ZSIndia product. See details below.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.family}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden shadow-md">
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-lg mb-2">Product Overview</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{product.overview}</p>
            </div>

            {product.keyHighlights.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Key Highlights</h3>
                <ul className="list-disc list-inside space-y-1">
                  {product.keyHighlights.map((highlight, index) => (
                    <li key={index} className="text-gray-700">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.powerOutput && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Power Output</span>
                    <span className="font-medium">{product.specifications.powerOutput}</span>
                  </div>
                )}
                {product.specifications.channels && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Channels</span>
                    <span className="font-medium">{product.specifications.channels}</span>
                  </div>
                )}
                {product.specifications.inputChannels && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Input Channels</span>
                    <span className="font-medium">{product.specifications.inputChannels}</span>
                  </div>
                )}
                {product.specifications.digitalPlayer && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Digital Player</span>
                    <span className="font-medium">{product.specifications.digitalPlayer}</span>
                  </div>
                )}
                {product.specifications.speakerOutput && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Speaker Output</span>
                    <span className="font-medium">{product.specifications.speakerOutput}</span>
                  </div>
                )}
                {product.specifications.frequencyResponse && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Frequency Response</span>
                    <span className="font-medium">{product.specifications.frequencyResponse}</span>
                  </div>
                )}
                {product.specifications.snRatio && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">S/N Ratio</span>
                    <span className="font-medium">{product.specifications.snRatio}</span>
                  </div>
                )}
                {product.specifications.powerSupply && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Power Supply</span>
                    <span className="font-medium">{product.specifications.powerSupply}</span>
                  </div>
                )}
                {product.specifications.dimensions && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Dimensions</span>
                    <span className="font-medium">{product.specifications.dimensions}</span>
                  </div>
                )}
                {product.specifications.weight && (
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">Weight</span>
                    <span className="font-medium">{product.specifications.weight}</span>
                  </div>
                )}
              </div>
            </div>

            {product.applications.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Applications</h3>
                <div className="flex flex-wrap gap-2">
                  {product.applications.map((app, index) => (
                    <Badge key={index} variant="outline">
                      {app}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.idealFor.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Ideal For</h3>
                <div className="flex flex-wrap gap-2">
                  {product.idealFor.map((item, index) => (
                    <Badge key={index} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {product.warranty && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Warranty</h3>
                <p className="text-gray-700">{product.warranty}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-6 text-center">
            <p className="text-sm text-gray-600">
              This product has been verified as authentic. For more information, visit{' '}
              <a
                href="https://zsindia.com"
                className="text-blue-600 hover:underline font-medium"
              >
                zsindia.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
