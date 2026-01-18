'use client';

import { useState, useEffect } from 'react';
import { warrantyClaimsApi, WarrantyClaim, WarrantyClaimsFilters } from '@/lib/backend-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileSpreadsheet, FileText, Loader2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function WarrantyClaimsPage() {
  const [claims, setClaims] = useState<WarrantyClaim[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<WarrantyClaimsFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const response = await warrantyClaimsApi.getAll(filters);
      setClaims(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch warranty claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [filters.page]);

  const handleSearch = () => {
    setFilters({ ...filters, page: 1 });
    fetchClaims();
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: 10 });
    fetchClaims();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
      active: 'default',
      expired: 'destructive',
      cancelled: 'secondary',
    };

    const colors: Record<string, string> = {
      active: 'bg-green-500 hover:bg-green-600',
      expired: 'bg-red-500 hover:bg-red-600',
      cancelled: 'bg-gray-500 hover:bg-gray-600',
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getDaysRemaining = (claim: WarrantyClaim) => {
    if (claim.warranty.isExpired || claim.warranty.status === 'expired') {
      return <span className="text-red-600 font-medium">Expired</span>;
    }
    return <span className="text-green-600 font-medium">{claim.warranty.daysRemaining} days</span>;
  };

  const exportToXLSX = () => {
    try {
      let csv = 'Customer Name,Email,Phone,Product Name,Serial Number,Warranty Status,Start Date,End Date,Days Remaining,Claimed On\n';

      claims.forEach(claim => {
        const daysRemaining = claim.warranty.isExpired ? 'Expired' : claim.warranty.daysRemaining.toString();
        csv += `"${claim.customer.name}","${claim.customer.email}","${claim.customer.phone}","${claim.product?.name || 'N/A'}","${claim.serialNumber?.serialNumber || 'N/A'}","${claim.warranty.status}","${formatDate(claim.warranty.startDate)}","${formatDate(claim.warranty.endDate)}","${daysRemaining}","${formatDate(claim.createdAt)}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `warranty-claims-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.click();

      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  const exportToPDF = () => {
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to export PDF');
        return;
      }

      let tableRows = '';
      claims.forEach(claim => {
        const daysRemaining = claim.warranty.isExpired ? 'Expired' : `${claim.warranty.daysRemaining} days`;
        tableRows += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${claim.customer.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${claim.customer.email}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${claim.customer.phone}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${claim.product?.name || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${claim.serialNumber?.serialNumber || 'N/A'}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${claim.warranty.status}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(claim.warranty.startDate)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(claim.warranty.endDate)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${daysRemaining}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(claim.createdAt)}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Warranty Claims Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { background-color: #4a5568; color: white; padding: 10px; text-align: left; border: 1px solid #ddd; }
              td { padding: 8px; border: 1px solid #ddd; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              .meta { margin-bottom: 20px; color: #666; }
            </style>
          </head>
          <body>
            <h1>Warranty Claims Report</h1>
            <div class="meta">
              <p><strong>Generated:</strong> ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
              <p><strong>Total Records:</strong> ${pagination.totalRecords}</p>
              <p><strong>Page:</strong> ${pagination.currentPage} of ${pagination.totalPages}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Product Name</th>
                  <th>Serial Number</th>
                  <th>Warranty Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days Remaining</th>
                  <th>Claimed On</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
      }, 250);

      toast.success('PDF export initiated');
    } catch (error) {
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warranty Claims</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all customer warranty claims
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value === 'all' ? undefined : value as any })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Search by email..."
                value={filters.email || ''}
                onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="Search by phone..."
                value={filters.phone || ''}
                onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Claims ({pagination.totalRecords})
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportToXLSX} variant="outline" size="sm">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download XLSX
            </Button>
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No warranty claims found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Warranty Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days Remaining</TableHead>
                      <TableHead>Claimed On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim._id}>
                        <TableCell className="font-medium">{claim.customer.name}</TableCell>
                        <TableCell>{claim.customer.email}</TableCell>
                        <TableCell>{claim.customer.phone}</TableCell>
                        <TableCell>{claim.product?.name || 'N/A'}</TableCell>
                        <TableCell className="font-mono text-sm">{claim.serialNumber?.serialNumber || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(claim.warranty.status)}</TableCell>
                        <TableCell>{formatDate(claim.warranty.startDate)}</TableCell>
                        <TableCell>{formatDate(claim.warranty.endDate)}</TableCell>
                        <TableCell>{getDaysRemaining(claim)}</TableCell>
                        <TableCell>{formatDate(claim.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setFilters({ ...filters, page: filters.page! - 1 })}
                    disabled={!pagination.hasPrevPage || loading}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setFilters({ ...filters, page: filters.page! + 1 })}
                    disabled={!pagination.hasNextPage || loading}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
