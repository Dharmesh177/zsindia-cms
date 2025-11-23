import { dummyProducts } from './dummy-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zoom-sounds-backend.onrender.com/api/v1';

const USE_DUMMY_DATA = false;

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
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data.products; // Explicitly return the products array
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
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch product');
    }
    return response.json();
  },

  async createProduct(product: ProductInput): Promise<Product> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    if (USE_DUMMY_DATA) {
      await delay(400);
      const newProduct: Product = {
        ...product,
        _id: String(nextId++),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localProducts = [...localProducts, newProduct];
      return { ...newProduct };
    }

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    return response.json();
  },

  async updateProduct(id: string, product: Partial<ProductInput>): Promise<Product> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token was not provided!');
    }

    if (USE_DUMMY_DATA) {
      await delay(400);
      const index = localProducts.findIndex(p => p._id === id);
      if (index === -1) {
        throw new Error('Product not found');
      }
      const updatedProduct: Product = {
        ...localProducts[index],
        ...product,
        updatedAt: new Date().toISOString(),
      };
      localProducts = [
        ...localProducts.slice(0, index),
        updatedProduct,
        ...localProducts.slice(index + 1),
      ];
      return { ...updatedProduct };
    }

    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    return response.json();
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
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete product');
    }
  },
};
