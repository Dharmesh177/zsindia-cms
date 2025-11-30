# QR Code Generation for Products with Multiple Qualities

## Overview
This guide explains how to generate unique QR codes for products that have multiple quality variants (e.g., different models, colors, sizes, or specifications).

## Current Implementation
The current QR code generation system creates one QR code per product using the product ID:
- URL format: `https://zsindia.com/verify/{productId}`
- Location: `/dashboard/verify-product`

## Recommended Approach for Multiple Qualities

### Option 1: URL Parameters (Recommended)
Add quality parameters to the verification URL to differentiate between product variants.

#### Implementation Steps:

1. **Extend Product Model**
   Add a `qualities` or `variants` field to your product schema:
   ```typescript
   qualities: [
     { id: string, name: string, description: string }
   ]
   ```

2. **Generate QR Codes with Quality Parameter**
   Update the QR code generation to include quality ID:
   ```typescript
   const verificationUrl = `https://zsindia.com/verify/${productId}?quality=${qualityId}`;
   ```

3. **UI Enhancement**
   Modify `/dashboard/verify-product` page:
   - After selecting a product, show a dropdown to select quality/variant
   - Generate unique QR code for each quality
   - Display quality name on the QR code label

4. **Verification Page**
   Update the verification page to:
   - Parse quality parameter from URL
   - Display specific quality information
   - Show which variant is being verified

#### Example Code:
```typescript
// In verify-product page
const [selectedQuality, setSelectedQuality] = useState<string>('');

const verificationUrl = selectedProduct && selectedQuality
  ? `https://zsindia.com/verify/${selectedProduct._id}?quality=${selectedQuality}`
  : `https://zsindia.com/verify/${selectedProduct?._id}`;

// UI to select quality
{selectedProduct?.qualities && selectedProduct.qualities.length > 0 && (
  <Select onValueChange={setSelectedQuality} value={selectedQuality}>
    <SelectTrigger>
      <SelectValue placeholder="Select quality variant..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="">Default (All Qualities)</SelectItem>
      {selectedProduct.qualities.map((quality) => (
        <SelectItem key={quality.id} value={quality.id}>
          {quality.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}
```

### Option 2: Separate Product Entries
Create separate product entries for each quality variant.

**Pros:**
- Simple to implement
- Each variant has full product details
- Easy to manage inventory separately

**Cons:**
- Data duplication
- More products to manage
- Harder to group related variants

### Option 3: QR Code with Embedded Data
Use QR code data payload to store quality information.

**Implementation:**
```typescript
const qrData = JSON.stringify({
  productId: selectedProduct._id,
  quality: selectedQuality,
  timestamp: Date.now(),
});

<QRCodeSVG value={qrData} />
```

**Note:** The verification page would need to parse JSON data instead of a URL.

## Recommended Implementation (Detailed)

### Step 1: Add Qualities to Product Form
Update `components/product-form.tsx` to include a qualities/variants section:

```typescript
// Add to form state
qualities: product?.qualities || [],

// Add UI section
<Card>
  <CardHeader>
    <CardTitle>Product Qualities/Variants</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {formData.qualities.map((quality, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input value={quality.name} readOnly />
          <Button
            type="button"
            variant="outline"
            onClick={() => removeQuality(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          placeholder="Quality name (e.g., Premium, Standard)"
          value={newQuality}
          onChange={(e) => setNewQuality(e.target.value)}
        />
        <Button type="button" onClick={addQuality}>
          Add Quality
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

### Step 2: Update QR Generation Page
Modify `/dashboard/verify-product/page.tsx`:

```typescript
const [selectedQuality, setSelectedQuality] = useState<string>('default');

// Generate appropriate URL
const verificationUrl = useMemo(() => {
  if (!selectedProduct) return '';
  const baseUrl = `https://zsindia.com/verify/${selectedProduct._id}`;
  return selectedQuality !== 'default'
    ? `${baseUrl}?quality=${selectedQuality}`
    : baseUrl;
}, [selectedProduct, selectedQuality]);

// Add quality selector after product selection
{selectedProduct && selectedProduct.qualities?.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Select Quality Variant</CardTitle>
    </CardHeader>
    <CardContent>
      <Select value={selectedQuality} onValueChange={setSelectedQuality}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default (All Qualities)</SelectItem>
          {selectedProduct.qualities.map((quality) => (
            <SelectItem key={quality.id} value={quality.id}>
              {quality.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardContent>
  </Card>
)}
```

### Step 3: Update Verification Page
Create or modify `/app/verify/[id]/page.tsx` to handle quality parameter:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id;
  const qualityId = searchParams.get('quality');

  // Fetch product and display appropriate quality information
  // ...
}
```

## Benefits of Recommended Approach

1. **Scalable**: Easy to add unlimited quality variants
2. **Maintainable**: Single product entry with multiple qualities
3. **Flexible**: Can add quality-specific information (price, specs, etc.)
4. **User-friendly**: Clear selection in admin panel
5. **Trackable**: Can track which quality variant is being verified
6. **SEO-friendly**: URL-based approach works with standard web infrastructure

## Implementation Priority

1. **High Priority**: Update product model to support qualities array
2. **High Priority**: Modify QR generation page to show quality selection
3. **Medium Priority**: Update product form to manage qualities
4. **Medium Priority**: Enhance verification page to show quality info
5. **Low Priority**: Add quality-specific analytics and tracking

## Testing Checklist

- [ ] QR code generates correctly with quality parameter
- [ ] QR code scans and redirects to correct URL
- [ ] Verification page displays correct quality information
- [ ] Print functionality includes quality name
- [ ] Download functionality saves with quality identifier in filename
- [ ] Multiple qualities can be selected and generate different QR codes
- [ ] Mobile and tablet views work correctly

## Additional Considerations

### Naming Convention for QR Downloads
```typescript
const filename = selectedQuality !== 'default'
  ? `qr-${selectedProduct.slug}-${selectedQuality}.png`
  : `qr-${selectedProduct.slug}.png`;
```

### Print Layout for Multiple Qualities
Include quality name prominently in print layout:
```html
<h1>${selectedProduct.name}</h1>
<p class="quality-badge">${qualityName}</p>
<p>Scan to verify product authenticity</p>
```

### Database Considerations
Add index on quality fields for faster queries:
```sql
CREATE INDEX idx_product_qualities ON products USING GIN (qualities);
```
