'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Product } from '@/lib/api';
import { Package, QrCode, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await api.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const stats = [
    {
      title: 'Total Products',
      value: products.length,
      icon: Package,
      description: 'Active in catalog',
      href: '/dashboard/products',
    },
    {
      title: 'Categories',
      value: Array.from(new Set(products.map((p) => p.category))).length,
      icon: TrendingUp,
      description: 'Product categories',
      href: '/dashboard/products',
    },
    {
      title: 'QR Codes',
      value: 456,
      icon: QrCode,
      description: 'Available to generate',
      href: '/dashboard/verify-product',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-blue-100">
          Welcome to ZSAcoustics Product Management System
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="border-blue-200 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50 cursor-pointer"
            onClick={() => router.push(stat.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">
                {stat.title}
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-700">{stat.value}</div>
              <p className="text-xs text-blue-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            Use the sidebar to navigate through the system:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
            <li>View and manage all products</li>
            <li>Create new products with detailed specifications</li>
            <li>Generate QR codes for product verification</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
