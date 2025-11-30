'use client';

import { useEffect, useState } from 'react';
import { contactQueriesApi, ContactQuery } from '@/lib/backend-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Mail, Phone, Calendar, Trash2, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function QueriesPage() {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [filteredQueries, setFilteredQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    filterQueries();
    setCurrentPage(1);
  }, [queries, searchTerm, typeFilter, statusFilter]);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const data : any = await contactQueriesApi.getAll();
      setQueries(data?.getAllReviews || []);
    } catch (error: any) {
      toast.error('Failed to fetch queries', {
        description: error.message,
      });
    }
    setLoading(false);
  };

  const filterQueries = () => {
    let filtered = queries;

    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((q) => q.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((q) => q.status === statusFilter);
    }

    setFilteredQueries(filtered);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await contactQueriesApi.updateStatus(id, status);
      toast.success('Status updated');
      fetchQueries();
      if (selectedQuery && selectedQuery._id === id) {
        setSelectedQuery({ ...selectedQuery, status } as ContactQuery);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      await contactQueriesApi.delete(id);
      toast.success('Query deleted');
      fetchQueries();
      setSelectedQuery(null);
    } catch (error) {
      toast.error('Failed to delete query');
    }
  };

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'new':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      case 'closed':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      contact: 'bg-blue-100 text-blue-800',
      product: 'bg-green-100 text-green-800',
      support: 'bg-orange-100 text-orange-800',
      sales: 'bg-teal-100 text-teal-800',
      partnership: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.general;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading queries...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-2">Contact Queries</h1>
        <p className="text-blue-100">Manage incoming queries from your website</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {filteredQueries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No queries found</p>
            </CardContent>
          </Card>
        ) : (
          filteredQueries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((query) => (
            <Card
              key={query._id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedQuery(query)}
            >
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{query.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail className="h-4 w-4" />
                      {query.email}
                      {query.phone && (
                        <>
                          <span>•</span>
                          <Phone className="h-4 w-4" />
                          {query.phone}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getTypeBadgeColor(query.type)}>{query.type}</Badge>
                    <Badge variant={getStatusBadgeVariant(query.status)}>
                      {query.status || 'new'}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-700 line-clamp-2 mb-3">{query.message}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(query.createdAt), 'MMM dd, yyyy • hh:mm a')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredQueries.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(filteredQueries.length / itemsPerPage)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(filteredQueries.length / itemsPerPage), prev + 1))}
            disabled={currentPage === Math.ceil(filteredQueries.length / itemsPerPage)}
          >
            Next
          </Button>
        </div>
      )}

      <Dialog open={!!selectedQuery} onOpenChange={() => setSelectedQuery(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
            <DialogDescription>View and manage this contact query</DialogDescription>
          </DialogHeader>
          {selectedQuery && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-gray-700">{selectedQuery.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-gray-700">{selectedQuery.email}</p>
                </div>
                {selectedQuery.phone && (
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="text-gray-700">{selectedQuery.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p>
                    <Badge className={getTypeBadgeColor(selectedQuery.type)}>
                      {selectedQuery.type}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Received</label>
                  <p className="text-gray-700">
                    {format(new Date(selectedQuery.createdAt), 'MMM dd, yyyy • hh:mm a')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Message</label>
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedQuery.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Update Status</label>
                <Select
                  value={selectedQuery.status || 'new'}
                  onValueChange={(value) => updateStatus(selectedQuery._id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => deleteQuery(selectedQuery._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Query
                </Button>
                <Button variant="outline" onClick={() => setSelectedQuery(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
