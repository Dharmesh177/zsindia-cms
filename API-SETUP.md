# API Configuration Guide

## Current Setup: Dummy Data Mode

The application is currently configured to use **dummy data** for demonstration purposes. This allows you to test all features without a backend connection.

## Switching Between Dummy Data and Real API

### Using Dummy Data (Current Configuration)

In `lib/api.ts`, the flag is set to:
```typescript
const USE_DUMMY_DATA = true;
```

With this setting:
- All CRUD operations work in-memory
- 6 sample products are pre-loaded
- Changes persist only during the current session
- No backend connection required

### Using Real Backend API

To connect to your MongoDB backend:

1. Open `lib/api.ts`
2. Change the flag to:
```typescript
const USE_DUMMY_DATA = false;
```

3. Ensure your backend is running at:
```
https://api.zsindia.com/api/v1
```

4. The application will now make real HTTP requests:
   - GET /products
   - POST /products
   - GET /products/:id
   - PUT /products/:id
   - DELETE /products/:id

## Sample Products Included

1. **ZS-PA250 Professional Amplifier** - 250W Class D amplifier
2. **ZS-MX120 Mixer Console** - 12-channel analog mixer
3. **ZS-SP800 Column Speaker System** - Line array speaker
4. **ZS-WM500 Wireless Microphone System** - UHF wireless system
5. **ZS-SUB15 Powered Subwoofer** - 15-inch active subwoofer
6. **ZS-DA60 Digital Audio Processor** - 6x6 DSP processor

All products include:
- Complete specifications
- Images from Pexels
- Key highlights and features
- Applications and ideal use cases
- Technical specifications
- Warranty information

## Testing the Application

You can test all features with dummy data:
- ✅ View product list with search and filters
- ✅ Create new products
- ✅ Edit existing products
- ✅ Delete products
- ✅ Generate QR codes
- ✅ View public verification page
- ✅ Print QR codes

When you're ready to connect to your real backend, simply change the `USE_DUMMY_DATA` flag to `false`.
