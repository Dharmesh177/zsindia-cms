'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, Package, QrCode, Menu, MessageSquare, Star, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from './protected-route';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Generate QR', href: '/dashboard/verify-product', icon: QrCode },
  { name: 'Contact Queries', href: '/dashboard/queries', icon: MessageSquare },
  { name: 'Testimonials', href: '/dashboard/testimonials', icon: Star },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  return (
    <ProtectedRoute>
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-gradient-to-b from-blue-600 to-blue-800 shadow-xl">
        <div className="flex items-center h-20 px-6 border-b border-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md">
              <span className="text-blue-600 font-bold text-lg">ZS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">ZSAcoustics</h1>
              <p className="text-xs text-blue-200">Admin Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start text-white hover:bg-blue-700 hover:text-white',
                    isActive && 'bg-blue-700 text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-blue-500 space-y-3">
          <div className="text-xs text-blue-200 text-center mb-2">
            <p className="font-medium">{user?.name}</p>
            <p className="text-blue-300 mt-1">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-blue-700 hover:text-white"
            onClick={() => signOut()}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
          <p className="text-xs text-blue-200 text-center">Sound Engineering Excellence</p>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-6 shadow-sm">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-blue-600 to-blue-800">
              <div className="flex items-center h-20 px-6 border-b border-blue-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">ZS</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">ZSAcoustics</h1>
                    <p className="text-xs text-blue-200">Admin Portal</p>
                  </div>
                </div>
              </div>
              <nav className="px-4 py-6 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full justify-start text-white hover:bg-blue-700',
                          isActive && 'bg-blue-700'
                        )}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Product Management System
            </h2>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
