'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './ui/input';

interface ImageUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  existingImages?: string[];
  onRemoveExisting?: (index: number) => void;
  maxImages?: number;
  minImages?: number;
}

export function ImageUpload({
  files,
  onChange,
  existingImages = [],
  onRemoveExisting,
  maxImages = 5,
  minImages = 1
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Generate preview URLs only when files change
  useEffect(() => {
    // Cleanup old URLs
    previews.forEach(url => URL.revokeObjectURL(url));

    // Create new URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviewUrls);

    return () => newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;

    const selectedFiles = Array.from(selected);
    const totalImages = existingImages.length + files.length;
    const remainingSlots = maxImages - totalImages;

    if (selectedFiles.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s)`);
      e.target.value = '';
      return;
    }

    const validImages: File[] = [];
    selectedFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB`);
        return;
      }
      validImages.push(file);
    });

    if (validImages.length > 0) {
      onChange([...files, ...validImages]);
      toast.success(`${validImages.length} image(s) added successfully`);
    }

    e.target.value = '';
  };

  const handleRemoveImage = (index: number) => {
    const totalImages = existingImages.length + files.length;
    if (totalImages <= minImages) {
      toast.error(`You must have at least ${minImages} image(s)`);
      return;
    }

    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
    toast.success('Image removed');
  };

  const handleRemoveExistingImage = (index: number) => {
    const totalImages = existingImages.length + files.length;
    if (totalImages <= minImages) {
      toast.error(`You must have at least ${minImages} image(s)`);
      return;
    }

    if (onRemoveExisting) {
      onRemoveExisting(index);
      toast.success('Image removed');
    }
  };

  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <div className="space-y-4">
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {existingImages.length === 0 && files.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">No images selected</p>
            <Button type="button" onClick={openFilePicker} variant="outline" size="sm">
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {existingImages.map((src, i) => (
            <Card key={`existing-${i}`} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square">
                  <img src={src} alt={`Product ${i + 1}`} className="w-full h-full object-contain bg-white" />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(i)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {previews.map((src, i) => (
            <Card key={`new-${i}`} className="relative group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square">
                  <img src={src} alt={`New ${i + 1}`} className="w-full h-full object-contain bg-white" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(i)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-1 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}

          {(existingImages.length + files.length) < maxImages && (
            <Card className="border-dashed cursor-pointer hover:border-gray-400 transition-colors" onClick={openFilePicker}>
              <CardContent className="aspect-square flex flex-col items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">Add More</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
