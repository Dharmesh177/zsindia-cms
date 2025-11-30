'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductInput, api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/image-upload';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormProps {
  product?: Product;
  mode: 'create' | 'edit';
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProductInput>({
    name: product?.name || '',
    slug: product?.slug || '',
    family: product?.family || '',
    category: product?.category || '',
    technology: product?.technology || '',
    thumbnail: product?.thumbnail || '',
    images: product?.images || [],
    overview: product?.overview || '',
    keyHighlights: product?.keyHighlights || [],
    features: product?.features || [],
    applications: product?.applications || [],
    idealFor: product?.idealFor || [],
    tags: product?.tags || [],
    specifications: {
      powerOutput: product?.specifications?.powerOutput || '',
      channels: product?.specifications?.channels || '',
      inputChannels: product?.specifications?.inputChannels || '',
      digitalPlayer: product?.specifications?.digitalPlayer || '',
      toneControl: {
        bass: product?.specifications?.toneControl?.bass || '',
        mid: product?.specifications?.toneControl?.mid || '',
        treble: product?.specifications?.toneControl?.treble || '',
      },
      speakerOutput: product?.specifications?.speakerOutput || '',
      frequencyResponse: product?.specifications?.frequencyResponse || '',
      snRatio: product?.specifications?.snRatio || '',
      powerSupply: product?.specifications?.powerSupply || '',
      dimensions: product?.specifications?.dimensions || '',
      weight: product?.specifications?.weight || '',
    },
    warranty: product?.warranty || '',
  });

  const [arrayInputs, setArrayInputs] = useState({
    keyHighlights: '',
    features: '',
    applications: '',
    idealFor: '',
    tags: '',
  });

  useEffect(() => {
    if (formData.images.length > 0 && formData.images[0] !== formData.thumbnail) {
      setFormData((prev) => ({ ...prev, thumbnail: formData.images[0] }));
    }
  }, [formData.images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'create') {
        await api.createProduct(formData, selectedFiles);
        toast.success('Product created successfully');
      } else if (mode === 'edit' && product?._id) {
        await api.updateProduct(product._id, formData, selectedFiles);
        toast.success('Product updated successfully');
      }

      router.push('/dashboard/products');
      router.refresh();
    } catch (error: any) {
      console.error(`Failed to ${mode} product:`, error);
      toast.error(error.message || `Failed to ${mode} product`);
    } finally {
      setLoading(false);
    }
  };


  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child, grandchild] = field.split('.');
      if (grandchild) {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: {
              ...(prev as any)[parent][child],
              [grandchild]: value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...(prev as any)[parent],
            [child]: value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addArrayItem = (field: keyof typeof arrayInputs) => {
    const value = arrayInputs[field].trim();
    if (value) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value],
      }));
      setArrayInputs((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const removeArrayItem = (field: keyof typeof arrayInputs, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="arrays">Features & Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="family">Family</Label>
                  <Input
                    id="family"
                    value={formData.family}
                    onChange={(e) => handleInputChange('family', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technology">Technology</Label>
                  <Input
                    id="technology"
                    value={formData.technology}
                    onChange={(e) => handleInputChange('technology', e.target.value)}
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                files={selectedFiles}
                maxImages={5}
                minImages={1}
                onChange={(files: File[]) => setSelectedFiles(files)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="overview">Overview</Label>
                <Textarea
                  id="overview"
                  value={formData.overview}
                  onChange={(e) => handleInputChange('overview', e.target.value)}
                  rows={6}
                  placeholder="Detailed product description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="warranty">Warranty</Label>
                <Input
                  id="warranty"
                  value={formData.warranty}
                  onChange={(e) => handleInputChange('warranty', e.target.value)}
                  placeholder="e.g., 1 year"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="powerOutput">Power Output</Label>
                  <Input
                    id="powerOutput"
                    value={formData.specifications.powerOutput}
                    onChange={(e) =>
                      handleInputChange('specifications.powerOutput', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channels">Channels</Label>
                  <Input
                    id="channels"
                    value={formData.specifications.channels}
                    onChange={(e) =>
                      handleInputChange('specifications.channels', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inputChannels">Input Channels</Label>
                  <Input
                    id="inputChannels"
                    value={formData.specifications.inputChannels}
                    onChange={(e) =>
                      handleInputChange('specifications.inputChannels', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="digitalPlayer">Digital Player</Label>
                  <Input
                    id="digitalPlayer"
                    value={formData.specifications.digitalPlayer}
                    onChange={(e) =>
                      handleInputChange('specifications.digitalPlayer', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tone Control</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bass" className="text-sm">
                      Bass
                    </Label>
                    <Input
                      id="bass"
                      value={formData.specifications.toneControl?.bass}
                      onChange={(e) =>
                        handleInputChange('specifications.toneControl.bass', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mid" className="text-sm">
                      Mid
                    </Label>
                    <Input
                      id="mid"
                      value={formData.specifications.toneControl?.mid}
                      onChange={(e) =>
                        handleInputChange('specifications.toneControl.mid', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treble" className="text-sm">
                      Treble
                    </Label>
                    <Input
                      id="treble"
                      value={formData.specifications.toneControl?.treble}
                      onChange={(e) =>
                        handleInputChange('specifications.toneControl.treble', e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speakerOutput">Speaker Output</Label>
                  <Input
                    id="speakerOutput"
                    value={formData.specifications.speakerOutput}
                    onChange={(e) =>
                      handleInputChange('specifications.speakerOutput', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequencyResponse">Frequency Response</Label>
                  <Input
                    id="frequencyResponse"
                    value={formData.specifications.frequencyResponse}
                    onChange={(e) =>
                      handleInputChange('specifications.frequencyResponse', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="snRatio">S/N Ratio</Label>
                  <Input
                    id="snRatio"
                    value={formData.specifications.snRatio}
                    onChange={(e) =>
                      handleInputChange('specifications.snRatio', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="powerSupply">Power Supply</Label>
                  <Input
                    id="powerSupply"
                    value={formData.specifications.powerSupply}
                    onChange={(e) =>
                      handleInputChange('specifications.powerSupply', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Dimensions</Label>
                  <Input
                    id="dimensions"
                    value={formData.specifications.dimensions}
                    onChange={(e) =>
                      handleInputChange('specifications.dimensions', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.specifications.weight}
                    onChange={(e) =>
                      handleInputChange('specifications.weight', e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arrays" className="space-y-4">
          {(['keyHighlights', 'features', 'applications', 'idealFor', 'tags'] as const).map(
            (field) => (
              <Card key={field}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={arrayInputs[field]}
                      onChange={(e) =>
                        setArrayInputs((prev) => ({ ...prev, [field]: e.target.value }))
                      }
                      placeholder={`Add ${field}...`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem(field);
                        }
                      }}
                    />
                    <Button type="button" onClick={() => addArrayItem(field)}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData[field].map((item, index) => (
                      <Badge key={index} variant="secondary" className="pr-1">
                        {item}
                        <button
                          type="button"
                          onClick={() => removeArrayItem(field, index)}
                          className="ml-2 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/products')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </Button>
      </div>
    </form>
  );
}
