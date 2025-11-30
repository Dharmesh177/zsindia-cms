# Serial Number System - Backend Implementation Guide

This document outlines the changes needed in your Node.js Express backend with MongoDB to support the serial number/QR code management system.

## Overview

The serial number system allows generating multiple unique serial numbers per product, each with its own QR code. This prevents QR code theft and counterfeiting by ensuring each physical product unit has a unique, traceable identifier.

### How QR Codes Work

Each QR code contains a URL in the format:
```
https://yourdomain.com/verify/ZSIN-XXXX-XXXX-XXXX
```

When scanned:
1. The user's phone opens the verification URL
2. The frontend displays loading state
3. Backend API verifies the serial number and returns product details
4. User sees product information, authenticity confirmation, and verification count
5. Backend increments the verification counter

**Security:** Deactivated serial numbers are rejected immediately, protecting against stolen/compromised QR codes.

---

## 1. Database Schema

### New Collection: `serialnumbers`

Create a new MongoDB collection with the following schema:

```javascript
{
  _id: ObjectId,
  serialNumber: String,        // Unique serial number (indexed, unique)
  productId: ObjectId,          // Reference to products collection
  isVerified: Boolean,          // Has this been scanned/verified?
  verifiedAt: Date,             // First verification timestamp
  verifiedCount: Number,        // How many times verified
  status: String,               // 'active' or 'deactivated'
  batchNumber: String,          // Optional batch identifier
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes Required

```javascript
// In MongoDB, create these indexes:
db.serialnumbers.createIndex({ serialNumber: 1 }, { unique: true })
db.serialnumbers.createIndex({ productId: 1 })
db.serialnumbers.createIndex({ status: 1 })
db.serialnumbers.createIndex({ batchNumber: 1 })
```

### Update Existing `products` Collection

Optionally add a field to track total serial numbers:

```javascript
{
  // ... existing fields
  totalSerialNumbers: Number  // Count of serial numbers generated
}
```

---

## 2. Mongoose Models

### SerialNumber Model

Create `models/SerialNumber.js`:

```javascript
const mongoose = require('mongoose');

const serialNumberSchema = new mongoose.Schema({
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  verifiedCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'deactivated'],
    default: 'active',
    index: true
  },
  batchNumber: {
    type: String,
    default: null,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
serialNumberSchema.index({ productId: 1, status: 1 });

module.exports = mongoose.model('SerialNumber', serialNumberSchema);
```

---

## 3. Utility Function - Serial Number Generator

Create `utils/serialNumberGenerator.js`:

```javascript
const crypto = require('crypto');

/**
 * Generate a unique serial number
 * Format: ZSIN-XXXX-XXXX-XXXX (16 characters + hyphens)
 */
function generateSerialNumber() {
  const randomBytes = crypto.randomBytes(6);
  const hex = randomBytes.toString('hex').toUpperCase();

  // Format: ZSIN-XXXX-XXXX-XXXX
  return `ZSIN-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

/**
 * Generate multiple unique serial numbers
 */
async function generateUniqueSerialNumbers(quantity, SerialNumber) {
  const serialNumbers = [];
  const maxAttempts = quantity * 2; // Prevent infinite loops
  let attempts = 0;

  while (serialNumbers.length < quantity && attempts < maxAttempts) {
    const serial = generateSerialNumber();

    // Check if it already exists
    const exists = await SerialNumber.findOne({ serialNumber: serial });

    if (!exists && !serialNumbers.includes(serial)) {
      serialNumbers.push(serial);
    }

    attempts++;
  }

  if (serialNumbers.length < quantity) {
    throw new Error('Failed to generate required number of unique serial numbers');
  }

  return serialNumbers;
}

module.exports = {
  generateSerialNumber,
  generateUniqueSerialNumbers
};
```

---

## 4. API Routes

### Create `routes/serialNumbers.js`:

```javascript
const express = require('express');
const router = express.Router();
const SerialNumber = require('../models/SerialNumber');
const Product = require('../models/Product');
const { generateUniqueSerialNumbers } = require('../utils/serialNumberGenerator');
const { authenticate } = require('../middleware/auth'); // Your auth middleware

/**
 * POST /api/v1/serial-numbers/generate
 * Generate multiple serial numbers for a product
 * Auth: Required
 */
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { productId, quantity, batchNumber } = req.body;

    // Validation
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    if (quantity < 1 || quantity > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be between 1 and 1000'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Generate unique serial numbers
    const serialNumberStrings = await generateUniqueSerialNumbers(quantity, SerialNumber);

    // Create serial number documents
    const serialNumberDocs = serialNumberStrings.map(serial => ({
      serialNumber: serial,
      productId: productId,
      batchNumber: batchNumber || null,
      status: 'active',
      isVerified: false,
      verifiedCount: 0
    }));

    // Insert into database
    const createdSerials = await SerialNumber.insertMany(serialNumberDocs);

    // Update product's total serial numbers count (optional)
    await Product.findByIdAndUpdate(productId, {
      $inc: { totalSerialNumbers: quantity }
    });

    res.status(201).json({
      success: true,
      message: `${quantity} serial numbers generated successfully`,
      serialNumbers: createdSerials
    });

  } catch (error) {
    console.error('Error generating serial numbers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate serial numbers',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/serial-numbers/product/:productId
 * Get all serial numbers for a product
 * Auth: Required
 */
router.get('/product/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const serialNumbers = await SerialNumber.find({ productId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: serialNumbers.length,
      serialNumbers
    });

  } catch (error) {
    console.error('Error fetching serial numbers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch serial numbers',
      error: error.message
    });
  }
});

/**
 * PATCH /api/v1/serial-numbers/:id/deactivate
 * Deactivate a serial number (mark as stolen/compromised)
 * Auth: Required
 */
router.patch('/:id/deactivate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const serialNumber = await SerialNumber.findByIdAndUpdate(
      id,
      { status: 'deactivated' },
      { new: true }
    );

    if (!serialNumber) {
      return res.status(404).json({
        success: false,
        message: 'Serial number not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Serial number deactivated successfully',
      serialNumber
    });

  } catch (error) {
    console.error('Error deactivating serial number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate serial number',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/serial-numbers/verify/:serialNumber
 * Verify a serial number (public endpoint for QR code scanning)
 * Auth: Not required (public verification)
 */
router.get('/verify/:serialNumber', async (req, res) => {
  try {
    const { serialNumber } = req.params;

    // Find the serial number
    const serial = await SerialNumber.findOne({ serialNumber });

    if (!serial) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Serial number not found'
      });
    }

    // Check if deactivated
    if (serial.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        valid: false,
        message: 'This serial number has been deactivated'
      });
    }

    // Update verification count
    serial.verifiedCount += 1;
    if (!serial.isVerified) {
      serial.isVerified = true;
      serial.verifiedAt = new Date();
    }
    await serial.save();

    // Get product details
    const product = await Product.findById(serial.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Associated product not found'
      });
    }

    res.status(200).json({
      success: true,
      valid: true,
      message: 'Serial number verified successfully',
      product,
      serialData: {
        _id: serial._id,
        serialNumber: serial.serialNumber,
        productId: serial.productId,
        isVerified: serial.isVerified,
        verifiedAt: serial.verifiedAt,
        verifiedCount: serial.verifiedCount,
        status: serial.status,
        batchNumber: serial.batchNumber,
        createdAt: serial.createdAt
      }
    });

  } catch (error) {
    console.error('Error verifying serial number:', error);
    res.status(500).json({
      success: false,
      valid: false,
      message: 'Verification failed',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/serial-numbers/:id
 * Delete a serial number (use with caution)
 * Auth: Required
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const serialNumber = await SerialNumber.findByIdAndDelete(id);

    if (!serialNumber) {
      return res.status(404).json({
        success: false,
        message: 'Serial number not found'
      });
    }

    // Update product's total serial numbers count
    await Product.findByIdAndUpdate(serialNumber.productId, {
      $inc: { totalSerialNumbers: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Serial number deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting serial number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete serial number',
      error: error.message
    });
  }
});

module.exports = router;
```

---

## 5. Register Routes in Main App

In your `app.js` or `server.js`:

```javascript
const serialNumberRoutes = require('./routes/serialNumbers');

// Register routes
app.use('/api/v1/serial-numbers', serialNumberRoutes);
```

---

## 6. Optional: Product Deletion Cascade

When a product is deleted, you may want to delete all associated serial numbers:

In your `routes/products.js` DELETE endpoint:

```javascript
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated serial numbers
    await SerialNumber.deleteMany({ productId: id });

    // Delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product and associated serial numbers deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});
```

---

## 7. Testing the API

### Generate Serial Numbers
```bash
POST /api/v1/serial-numbers/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 100,
  "batchNumber": "BATCH-2024-01"
}
```

### Get Product Serial Numbers
```bash
GET /api/v1/serial-numbers/product/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

### Verify Serial Number (Public)
```bash
GET /api/v1/serial-numbers/verify/ZSIN-A1B2-C3D4-E5F6
```

### Deactivate Serial Number
```bash
PATCH /api/v1/serial-numbers/507f1f77bcf86cd799439011/deactivate
Authorization: Bearer <token>
```

---

## 8. Security Considerations

1. **Rate Limiting**: Add rate limiting to the verify endpoint to prevent abuse
2. **Validation**: Validate all inputs thoroughly
3. **Logging**: Log all verification attempts for audit trails
4. **Alerts**: Set up alerts for suspicious activity (e.g., high verification counts)
5. **HTTPS**: Ensure all endpoints use HTTPS in production

---

## 9. Additional Features (Optional)

### Analytics Endpoint
```javascript
router.get('/analytics/:productId', authenticate, async (req, res) => {
  const { productId } = req.params;

  const stats = await SerialNumber.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalVerifications: { $sum: '$verifiedCount' }
      }
    }
  ]);

  res.json({ success: true, stats });
});
```

### Bulk Operations
```javascript
router.patch('/bulk/deactivate', authenticate, async (req, res) => {
  const { serialNumberIds } = req.body;

  await SerialNumber.updateMany(
    { _id: { $in: serialNumberIds } },
    { status: 'deactivated' }
  );

  res.json({ success: true, message: 'Serial numbers deactivated' });
});
```

---

## 10. Migration Strategy

If you have existing products with QR codes:

1. Keep the old verification endpoint working
2. Run a migration script to generate serial numbers for existing products
3. Gradually phase out old QR codes
4. Update old QR codes to redirect to new serial-based system

Example migration script:
```javascript
const Product = require('./models/Product');
const SerialNumber = require('./models/SerialNumber');
const { generateUniqueSerialNumbers } = require('./utils/serialNumberGenerator');

async function migrateExistingProducts() {
  const products = await Product.find({});

  for (const product of products) {
    // Generate one serial number per existing product
    const serials = await generateUniqueSerialNumbers(1, SerialNumber);

    await SerialNumber.create({
      serialNumber: serials[0],
      productId: product._id,
      status: 'active',
      batchNumber: 'MIGRATION-BATCH'
    });
  }

  console.log('Migration complete');
}
```

---

## 11. Frontend Integration

### QR Code Generation

The frontend generates QR codes with the full verification URL:

```typescript
// Format: https://yourdomain.com/verify/SERIAL-NUMBER
const qrCodeValue = `${window.location.origin}/verify/${serialNumber}`;
```

### Verification Page (`/verify/[serialNumber]`)

The frontend already has a verification page that:

1. **Extracts** the serial number from the URL path
2. **Calls** the backend API: `GET /api/v1/serial-numbers/verify/{serialNumber}`
3. **Displays**:
   - ✅ Product image and details (if valid)
   - ✅ Authenticity confirmation
   - ✅ Verification count and timestamp
   - ❌ Error message (if invalid or deactivated)

### Expected API Response

The verification endpoint should return:

**Success (200):**
```json
{
  "success": true,
  "valid": true,
  "message": "Serial number verified successfully",
  "product": {
    "_id": "...",
    "name": "Product Name",
    "model": "MODEL-123",
    "description": "Product description",
    "images": ["url1", "url2"],
    "category": "...",
    // ... other product fields
  },
  "serialData": {
    "_id": "...",
    "serialNumber": "ZSIN-XXXX-XXXX-XXXX",
    "productId": "...",
    "isVerified": true,
    "verifiedAt": "2024-01-15T10:30:00Z",
    "verifiedCount": 3,
    "status": "active",
    "batchNumber": "BATCH-2024-01",
    "createdAt": "2024-01-10T08:00:00Z"
  }
}
```

**Failure (404 or 403):**
```json
{
  "success": false,
  "valid": false,
  "message": "Serial number not found" // or "This serial number has been deactivated"
}
```

### Mobile Scanning Experience

1. User scans QR code with phone camera
2. Phone opens: `https://yourdomain.com/verify/ZSIN-XXXX-XXXX-XXXX`
3. Page loads and shows:
   - Loading spinner
   - Then product verification result
4. User sees authenticity confirmation

**No app installation required** - works directly in the browser!

---

## 12. CORS Configuration

Since verification happens from any device/domain, ensure your backend has proper CORS:

```javascript
const cors = require('cors');

// Allow all origins for verification endpoint (public)
app.use('/api/v1/serial-numbers/verify', cors({
  origin: '*',
  methods: ['GET']
}));

// Restrict other endpoints to your domain
app.use('/api/v1', cors({
  origin: process.env.FRONTEND_URL || 'https://yourdomain.com',
  credentials: true
}));
```

---

## Summary

This implementation provides:
- ✅ Unique serial numbers per product unit
- ✅ QR code generation with full verification URLs
- ✅ Public verification endpoint (works from any device)
- ✅ Deactivation capability for compromised codes
- ✅ Batch tracking
- ✅ Verification analytics
- ✅ Prevention of QR code theft/copying
- ✅ Mobile-friendly verification (no app needed)

Once implemented, each physical product will have its own unique, verifiable identity that cannot be duplicated by competitors. Customers can scan QR codes with any phone camera to instantly verify authenticity.
