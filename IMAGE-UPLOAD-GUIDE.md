# Image Upload Feature Guide

## Overview

The ZSIndia Product Management Platform now supports **multiple image uploads** for each product with S3 integration ready.

## Features

### Multi-Image Upload
- Upload **1-5 images per product** (configurable)
- Minimum 1 image required
- Maximum file size: **5MB per image**
- Supported formats: **JPG, PNG, WebP**

### Image Management
- **Primary Image**: First image is automatically set as primary/thumbnail
- **Preview**: Live preview of all uploaded images
- **Remove**: Delete individual images (minimum 1 must remain)
- **Drag & Drop**: Interface ready for drag-to-reorder (future enhancement)

### User Interface
- Dedicated "Images" tab in product form
- Grid layout showing all product images
- Visual indicator for primary image
- Upload progress feedback
- Error handling with toast notifications

## Backend Integration (Ready)

### S3 Upload Endpoint (Commented Code)

The upload functionality is ready to integrate with your backend. Located in:
**`components/image-upload.tsx`** - Line 52-67

```typescript
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
  return data.imageUrl;  // Backend should return the S3 URL
  */

  // Current implementation: Base64 preview (for testing)
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
```

### Backend Requirements

Your backend should provide an endpoint: **POST `/api/v1/upload`**

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `image`: File (the image file)
  - `folder`: String (e.g., "products")

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://your-bucket.s3.amazonaws.com/products/unique-filename.jpg"
}
```

### Enabling Backend Upload

To switch from dummy preview to actual S3 upload:

1. Open `components/image-upload.tsx`
2. Uncomment lines 54-67 (the S3 upload code)
3. Remove/comment out lines 69-77 (the base64 preview code)
4. Ensure your backend `/upload` endpoint is ready

## Product Schema Changes

### Updated Interface

```typescript
export interface Product {
  // ... other fields
  thumbnail: string;      // Primary image URL (auto-set from first image)
  images: string[];       // Array of all image URLs
  // ... other fields
}
```

### Database Updates

If using MongoDB, update your product schema:

```javascript
{
  thumbnail: String,           // Primary image
  images: [String],           // Array of image URLs
  // ... other fields
}
```

## Current Implementation (Dummy Mode)

In dummy data mode:
- Images are converted to Base64 for preview
- Changes persist in memory only
- No actual file upload occurs
- Perfect for testing UI/UX

## Testing the Feature

### How to Test

1. Navigate to **Dashboard → Products → Add Product**
2. Click on the **"Images"** tab
3. Click **"Upload Images"**
4. Select 1-5 images (JPG/PNG, max 5MB each)
5. Watch upload progress
6. See live preview
7. Remove images if needed (minimum 1 required)
8. Complete the form and save

### Validation

The system validates:
- ✅ File type (must be image)
- ✅ File size (max 5MB)
- ✅ Minimum images (1 required)
- ✅ Maximum images (5 allowed)
- ✅ Image display on view page
- ✅ Image display on public verification page

## Display Locations

Images are displayed in:

1. **Product Form** (`/dashboard/products/new` or `/edit`)
   - Dedicated Images tab with upload interface

2. **Product View** (`/dashboard/products/[id]`)
   - Grid layout showing all images
   - Primary indicator on first image

3. **Public Verification** (`/verify/[id]`)
   - 2-column grid layout
   - All product images visible

4. **QR Code Page**
   - Uses primary/thumbnail image

## Configuration

Adjust limits in `components/product-form.tsx`:

```typescript
<ImageUpload
  images={formData.images}
  onChange={(images) => setFormData((prev) => ({ ...prev, images }))}
  maxImages={5}      // Change maximum
  minImages={1}      // Change minimum
/>
```

## Future Enhancements

Planned features:
- 🔄 Drag and drop to reorder images
- ✂️ Client-side image cropping/resizing
- 🖼️ Image zoom on click
- 📦 Bulk upload
- 🗑️ Bulk delete

## Notes

- First image is always used as the product thumbnail
- Thumbnail field auto-updates when images change
- All dummy products now include 2-3 sample images
- Upload simulation includes realistic delay (1 second per image)
