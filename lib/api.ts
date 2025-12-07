import { dummyProducts } from './dummy-data';
import { dummySerialNumbers, generateDummySerialNumbers } from './dummy-serial-numbers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.zsindia.com/api/v1';

const USE_DUMMY_DATA = false;

// Temporary: Use dummy data for serial numbers until backend is updated
const USE_DUMMY_SERIAL_DATA = false;

// In-memory storage for dummy serial numbers
let localSerialNumbers = [...dummySerialNumbers];

export interface SerialNumber {
  _id: string;
  serialNumber: string;
  productId: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedCount: number;
  status: 'active' | 'deactivated';
  createdAt: string;
  batchNumber?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  family: string;
  category: string;
  technology: string;
  thumbnail: string;
  images: string[];
  overview: string;
  keyHighlights: string[];
  features: string[];
  applications: string[];
  idealFor: string[];
  tags: string[];
  specifications: {
    powerOutput?: string;
    channels?: string;
    inputChannels?: string;
    digitalPlayer?: string;
    toneControl?: {
      bass?: string;
      mid?: string;
      treble?: string;
    };
    speakerOutput?: string;
    frequencyResponse?: string;
    snRatio?: string;
    powerSupply?: string;
    dimensions?: string;
    weight?: string;
  };
  warranty?: string;
  isTopSellingProduct?: boolean;
  totalSerialNumbers?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductInput = Omit<Product, '_id' | 'createdAt' | 'updatedAt'>;

let localProducts = [...dummyProducts];
let nextId = 7;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async getProducts(): Promise<Product[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    if (USE_DUMMY_DATA) {
      await delay(300);
      return [...localProducts];
    }

    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        token,
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data.products;
  },

  async getProduct(id: string): Promise<Product> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    if (USE_DUMMY_DATA) {
      await delay(200);
      const product = localProducts.find(p => p._id === id);
      if (!product) {
        throw new Error('Product not found');
      }
      return { ...product };
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }

    const data = await response.json();
    return data.product || data;
  },

  // ✅ CREATE PRODUCT WITH FILES
  async createProduct(input: ProductInput, files: File[], thumbnailFile?: File | null) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    const form = new FormData();

    // --- Basic text fields (coerce undefined -> "") ---
    form.append('name', input.name);
    form.append('slug', input.slug);
    form.append('family', input.family ?? '');
    form.append('category', input.category ?? '');
    form.append('technology', input.technology ?? '');
    form.append('overview', input.overview ?? '');
    form.append('warranty', input.warranty ?? '');
    form.append('isTopSellingProduct', input.isTopSellingProduct ? 'true' : 'false');

    // --- Array fields (Multer/Express will treat multiple same-name fields as array) ---
    (input.keyHighlights || []).forEach(v => form.append('keyHighlights[]', v));
    (input.features || []).forEach(v => form.append('features[]', v));
    (input.applications || []).forEach(v => form.append('applications[]', v));
    (input.idealFor || []).forEach(v => form.append('idealFor[]', v));
    (input.tags || []).forEach(v => form.append('tags[]', v));

    // --- Specifications as nested fields (Express will parse as object) ---
    if (input.specifications?.powerOutput)
      form.append('specifications[powerOutput]', input.specifications.powerOutput);
    if (input.specifications?.channels)
      form.append('specifications[channels]', input.specifications.channels);
    if (input.specifications?.inputChannels)
      form.append('specifications[inputChannels]', input.specifications.inputChannels);
    if (input.specifications?.digitalPlayer)
      form.append('specifications[digitalPlayer]', input.specifications.digitalPlayer);
    if (input.specifications?.toneControl?.bass)
      form.append('specifications[toneControl][bass]', input.specifications.toneControl.bass);
    if (input.specifications?.toneControl?.mid)
      form.append('specifications[toneControl][mid]', input.specifications.toneControl.mid);
    if (input.specifications?.toneControl?.treble)
      form.append('specifications[toneControl][treble]', input.specifications.toneControl.treble);
    if (input.specifications?.speakerOutput)
      form.append('specifications[speakerOutput]', input.specifications.speakerOutput);
    if (input.specifications?.frequencyResponse)
      form.append('specifications[frequencyResponse]', input.specifications.frequencyResponse);
    if (input.specifications?.snRatio)
      form.append('specifications[snRatio]', input.specifications.snRatio);
    if (input.specifications?.powerSupply)
      form.append('specifications[powerSupply]', input.specifications.powerSupply);
    if (input.specifications?.dimensions)
      form.append('specifications[dimensions]', input.specifications.dimensions);
    if (input.specifications?.weight)
      form.append('specifications[weight]', input.specifications.weight);

    // --- Thumbnail file ---
    if (thumbnailFile) {
      form.append('thumbnail', thumbnailFile);
    }

    files.forEach(f => form.append('images', f));

    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        token,
        // ❌ DO NOT set 'Content-Type' here — browser sets multipart boundary
      },
      body: form,
    });

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error('Failed to parse server response');
    }

    if (!res.ok || data.status !== 'success') {
      throw new Error(data.message || 'Product creation failed');
    }

    return data.product as Product;
  },

  // ✅ UPDATE PRODUCT WITH FILES
  async updateProduct(id: string, input: ProductInput, files: File[], thumbnailFile?: File | null) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    const form = new FormData();

    // --- Basic text fields ---
    form.append('name', input.name);
    form.append('slug', input.slug);
    form.append('family', input.family ?? '');
    form.append('category', input.category ?? '');
    form.append('technology', input.technology ?? '');
    form.append('overview', input.overview ?? '');
    form.append('warranty', input.warranty ?? '');
    form.append('isTopSellingProduct', input.isTopSellingProduct ? 'true' : 'false');

    // --- Array fields ---
    (input.keyHighlights || []).forEach(v => form.append('keyHighlights[]', v));
    (input.features || []).forEach(v => form.append('features[]', v));
    (input.applications || []).forEach(v => form.append('applications[]', v));
    (input.idealFor || []).forEach(v => form.append('idealFor[]', v));
    (input.tags || []).forEach(v => form.append('tags[]', v));

    // --- Specifications as nested fields (Express will parse as object) ---
    if (input.specifications?.powerOutput)
      form.append('specifications[powerOutput]', input.specifications.powerOutput);
    if (input.specifications?.channels)
      form.append('specifications[channels]', input.specifications.channels);
    if (input.specifications?.inputChannels)
      form.append('specifications[inputChannels]', input.specifications.inputChannels);
    if (input.specifications?.digitalPlayer)
      form.append('specifications[digitalPlayer]', input.specifications.digitalPlayer);
    if (input.specifications?.toneControl?.bass)
      form.append('specifications[toneControl][bass]', input.specifications.toneControl.bass);
    if (input.specifications?.toneControl?.mid)
      form.append('specifications[toneControl][mid]', input.specifications.toneControl.mid);
    if (input.specifications?.toneControl?.treble)
      form.append('specifications[toneControl][treble]', input.specifications.toneControl.treble);
    if (input.specifications?.speakerOutput)
      form.append('specifications[speakerOutput]', input.specifications.speakerOutput);
    if (input.specifications?.frequencyResponse)
      form.append('specifications[frequencyResponse]', input.specifications.frequencyResponse);
    if (input.specifications?.snRatio)
      form.append('specifications[snRatio]', input.specifications.snRatio);
    if (input.specifications?.powerSupply)
      form.append('specifications[powerSupply]', input.specifications.powerSupply);
    if (input.specifications?.dimensions)
      form.append('specifications[dimensions]', input.specifications.dimensions);
    if (input.specifications?.weight)
      form.append('specifications[weight]', input.specifications.weight);

    // --- Thumbnail file ---
    if (thumbnailFile) {
      form.append('thumbnail', thumbnailFile);
    }

    // --- Files (only send if user picked new ones) ---
    if (files[0]) {
      form.append('imgCover', files[0]);
      files.forEach(f => form.append('images', f));
    }

    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT', // or 'PATCH' depending on your backend
      headers: {
        token,
      },
      body: form,
    });

    let data: any;
    try {
      data = await res.json();
    } catch {
      throw new Error('Failed to parse server response');
    }

    if (!res.ok || data.status !== 'success') {
      throw new Error(data.message || 'Product update failed');
    }

    return data.product as Product;
  },

  async deleteProduct(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    if (USE_DUMMY_DATA) {
      await delay(300);
      localProducts = localProducts.filter(p => p._id !== id);
      return;
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  },

  async generateSerialNumbers(productId: string, quantity: number, batchNumber?: string): Promise<SerialNumber[]> {
    // TEMPORARY: Using dummy data until backend is updated
    // if (USE_DUMMY_SERIAL_DATA) {
    //   await delay(500);
    //   const newSerials = generateDummySerialNumbers(productId, quantity, batchNumber);
    //   localSerialNumbers = [...newSerials, ...localSerialNumbers];
    //   return newSerials;
    // }

    // COMMENTED OUT: Uncomment when backend is ready
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    const response = await fetch(`${API_URL}/serial-numbers/generate`, {
      method: 'POST',
      headers: {
        token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId, quantity, batchNumber }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate serial numbers');
    }

    const data = await response.json();
    return data.serialNumbers;    
  },

  async getProductSerialNumbers(productId: string): Promise<SerialNumber[]> {
    // TEMPORARY: Using dummy data until backend is updated
    // if (USE_DUMMY_SERIAL_DATA) {
    //   await delay(300);
    //   return localSerialNumbers.filter(s => s.productId === productId);
    // }

    // COMMENTED OUT: Uncomment when backend is ready
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    const response = await fetch(`${API_URL}/serial-numbers/product/${productId}`, {
      method: 'GET',
      headers: {
        token,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch serial numbers');
    }

    const data = await response.json();
    return data.serialNumbers || [];
  },

  async deactivateSerialNumber(serialNumberId: string): Promise<void> {
    // TEMPORARY: Using dummy data until backend is updated
    // if (USE_DUMMY_SERIAL_DATA) {
    //   await delay(300);
    //   const index = localSerialNumbers.findIndex(s => s._id === serialNumberId);
    //   if (index !== -1) {
    //     localSerialNumbers[index].status = 'deactivated';
    //   }
    //   return;
    // }

    // COMMENTED OUT: Uncomment when backend is ready
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    const response = await fetch(`${API_URL}/serial-numbers/${serialNumberId}/deactivate`, {
      method: 'PATCH',
      headers: {
        token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to deactivate serial number');
    }
  },

  async verifySerialNumber(serialNumber: string): Promise<{ valid: boolean; product?: Product; serialData?: SerialNumber }> {
    // COMMENTED OUT: Uncomment when backend is ready
    const response = await fetch(`${API_URL}/serial-numbers/verify/${serialNumber}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to verify serial number');
    }

    const data = await response.json();
    return data;
  },
};
