'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  minImages?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  minImages = 1
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max size is 5MB`);
          continue;
        }

        const uploadedUrl = await uploadImageToS3(file);
        uploadedUrls.push(uploadedUrl);
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadImageToS3 = async (file: File): Promise<string> => {
    // TODO: Uncomment and implement when backend is ready
    /*
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'products');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
    */

    return new Promise((resolve) => {
      setTimeout(() => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      }, 1000);
    });
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= minImages) {
      toast.error(`You must have at least ${minImages} image(s)`);
      return;
    }

    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Image removed');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            Product Images {minImages > 0 && <span className="text-red-500">*</span>}
          </p>
          <p className="text-xs text-gray-500">
            Upload {minImages === 1 ? 'at least 1 image' : `${minImages}-${maxImages} images`}
            {' '}(Max 5MB each, JPG/PNG)
          </p>
        </div>
        <Button
          type="button"
          onClick={handleUploadClick}
          disabled={uploading || images.length >= maxImages}
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {images.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-500 mb-2">No images uploaded yet</p>
            <Button
              type="button"
              onClick={handleUploadClick}
              variant="outline"
              size="sm"
              disabled={uploading}
            >
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {images.length < maxImages && (
            <Card
              className="border-dashed cursor-pointer hover:border-gray-400 transition-colors"
              onClick={handleUploadClick}
            >
              <CardContent className="p-0">
                <div className="aspect-square flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Add More</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
        <div className="mt-0.5">ℹ️</div>
        <div>
          <p className="font-medium text-blue-900 mb-1">Image Upload Notes:</p>
          <ul className="space-y-1">
            <li>• The first image will be used as the primary thumbnail</li>
            <li>• Drag images to reorder (coming soon)</li>
            <li>• Recommended size: 800x800px or larger</li>
            <li>• Backend S3 upload integration is ready (commented in code)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
