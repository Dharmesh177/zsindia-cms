# ZSAcoustics Product Management System

A professional product authoring and QR verification platform for ZSAcoustics sound engineering products. This modern web application enables administrators to manage product catalogs, generate QR codes, and provide customers with product verification capabilities.

![ZSAcoustics](https://img.shields.io/badge/ZSAcoustics-Sound%20Engineering-blue)
![Next.js](https://img.shields.io/badge/Next.js-13.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8)

## 🎯 Features

- **Product Management**: Create, edit, delete, and manage audio equipment products
- **Multi-Image Upload**: Upload 1-5 images per product with S3 integration ready
- **QR Code Generation**: Generate and print QR codes for product verification
- **Public Verification**: Customers can scan QR codes to verify product authenticity
- **Search & Filter**: Advanced search and category filtering
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional UI**: Modern glassmorphic design with ZSAcoustics branding

## 🛠️ Tech Stack

- **Framework**: [Next.js 13.5](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Codes**: [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher ([Download](https://nodejs.org/))
- **npm**: Version 9.x or higher (comes with Node.js)
- **Git**: For cloning the repository ([Download](https://git-scm.com/))

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd project
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, TypeScript, Tailwind CSS, and UI components.

### 3. Environment Configuration

The application is pre-configured with environment variables. Check the `.env` file:

```bash
cat .env
```

**Default Configuration:**
- API runs in **dummy data mode** by default
- No backend connection required for testing
- Sample products are pre-loaded

### 4. Start Development Server

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### 5. Access the Application

Open your browser and navigate to:

- **Home Page**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Products**: [http://localhost:3000/dashboard/products](http://localhost:3000/dashboard/products)
- **Generate QR**: [http://localhost:3000/dashboard/verify-product](http://localhost:3000/dashboard/verify-product)

## 📁 Project Structure

```
project/
├── app/                          # Next.js App Router
│   ├── dashboard/               # Admin dashboard pages
│   │   ├── products/           # Product management
│   │   │   ├── [id]/          # View/edit product
│   │   │   ├── new/           # Create product
│   │   │   └── page.tsx       # Products list
│   │   ├── verify-product/    # QR generation
│   │   └── layout.tsx         # Dashboard layout
│   ├── verify/                 # Public verification
│   │   └── [id]/              # Product verification page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                 # React components
│   ├── ui/                    # shadcn/ui components
│   ├── dashboard-layout.tsx   # Dashboard sidebar/nav
│   ├── image-upload.tsx       # Image upload component
│   └── product-form.tsx       # Product form
├── lib/                       # Utility functions
│   ├── api.ts                # API client & types
│   ├── dummy-data.ts         # Sample data
│   └── utils.ts              # Helper functions
├── hooks/                     # Custom React hooks
├── public/                    # Static assets
├── .env                       # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server (localhost:3000)

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## 🎨 Customization

### Changing Brand Colors

Edit `app/globals.css` to modify the color scheme:

```css
:root {
  --primary: 217 91% 60%;        /* Blue */
  --accent: 186 100% 50%;        /* Cyan */
  /* ... other color variables */
}
```

### Switching to Backend API

To connect to your MongoDB backend:

1. Open `lib/api.ts`
2. Change `USE_DUMMY_DATA` to `false`:

```typescript
const USE_DUMMY_DATA = false;
```

3. Ensure your backend is running at:
```
https://zoom-sounds-backend.onrender.com/api/v1
```

See [API-SETUP.md](./API-SETUP.md) for more details.

### Enabling Image Upload to S3

To enable actual S3 image uploads:

1. Open `components/image-upload.tsx`
2. Uncomment lines 54-67 (S3 upload code)
3. Comment out lines 69-77 (base64 preview)
4. Configure your backend `/upload` endpoint

See [IMAGE-UPLOAD-GUIDE.md](./IMAGE-UPLOAD-GUIDE.md) for detailed instructions.

## 📦 Sample Data

The application includes 6 pre-loaded sample products:

1. **ZS-PA250** - Professional Amplifier (250W Class D)
2. **ZS-MX120** - Mixer Console (12-channel analog)
3. **ZS-SP800** - Column Speaker System (Line array)
4. **ZS-WM500** - Wireless Microphone System (UHF)
5. **ZS-SUB15** - Powered Subwoofer (15-inch active)
6. **ZS-DA60** - Digital Audio Processor (6x6 DSP)

All products include:
- Multiple images
- Complete specifications
- Key highlights and features
- Applications and use cases
- Technical details

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Deploy automatically

### Other Platforms

Build the production version:

```bash
npm run build
npm run start
```

The application will run on port 3000.

## 🔐 Environment Variables

```bash
# API Configuration (Optional - uses dummy data by default)
NEXT_PUBLIC_API_URL=https://zoom-sounds-backend.onrender.com/api/v1
```

## 📱 Features Overview

### Admin Dashboard

**Product Management:**
- Create new products with detailed specifications
- Edit existing products
- Delete products
- Upload multiple product images
- Manage product categories and families

**QR Code System:**
- Generate QR codes for any product
- Print QR codes directly
- Batch QR generation support
- Customizable QR code sizes

### Public Features

**Product Verification:**
- Scan QR codes to verify products
- View complete product details
- Check authenticity
- Access specifications

## 🎯 Key Pages

### 1. Home Page (`/`)
- Brand introduction
- Feature overview
- Call-to-action to admin portal

### 2. Dashboard (`/dashboard`)
- Statistics overview
- Quick actions
- Recent products

### 3. Products List (`/dashboard/products`)
- View all products
- Search functionality
- Category filters
- Quick actions (view/edit/delete)

### 4. Add/Edit Product (`/dashboard/products/new` or `/dashboard/products/[id]/edit`)
- 5-tab form interface:
  - Basic Info
  - Images (1-5 images)
  - Details
  - Specifications
  - Features & Tags

### 5. Generate QR (`/dashboard/verify-product`)
- Select products
- Generate QR codes
- Print QR codes
- Download options

### 6. Verification Page (`/verify/[id]`)
- Public product verification
- Display all product details
- Show authenticity badge

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### TypeScript Errors

```bash
# Run type checking
npm run typecheck
```

## 📚 Additional Documentation

- [API Setup Guide](./API-SETUP.md) - Backend integration instructions
- [Image Upload Guide](./IMAGE-UPLOAD-GUIDE.md) - S3 upload configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for ZSAcoustics.

## 👥 Support

For support, email: support@zsacoustics.com

## 🎉 Acknowledgments

- ZSAcoustics team for design inspiration
- shadcn/ui for beautiful components
- Next.js team for the amazing framework
- Vercel for deployment platform

---

**Built with ❤️ for ZSAcoustics - Pioneering Audio Excellence**
