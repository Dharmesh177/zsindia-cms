'use client';

import { ProductForm } from '@/components/product-form';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-500 mt-1">Add a new product to your catalog</p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
