import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, QrCode, Shield } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-2xl">
              <span className="text-blue-600 font-bold text-3xl">ZS</span>
            </div>
          </div>

          <div className="inline-block mb-6">
            <div className="px-6 py-2 rounded-full border border-cyan-400 bg-cyan-400/10">
              <p className="text-cyan-300 text-sm font-medium tracking-wide">PRODUCT MANAGEMENT</p>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="text-white">Pioneering</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Audio Excellence
            </span>
          </h1>

          <p className="text-xl text-blue-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Professional product authoring and QR verification platform for ZSAcoustics sound engineering products
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-10 py-7 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all">
                Admin Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2 border-white text-white hover:bg-white/10 shadow-xl hover:shadow-2xl transition-all">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mt-20">
          <Card className="border-2 border-blue-700 bg-blue-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-white">Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-blue-200">
                Create, edit, and manage your entire product catalog with detailed
                specifications and features
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-600 bg-cyan-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-cyan-500/20 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                  <QrCode className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-white">QR Code Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-cyan-200">
                Generate and print QR codes for product verification and authenticity
                checks
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-700 bg-blue-800/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-white">Product Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-blue-200">
                Customers can verify product authenticity by scanning QR codes to view
                full details
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-blue-300 text-sm">Sound Engineering Excellence Since 2000</p>
        </div>
      </div>
    </div>
  );
}
