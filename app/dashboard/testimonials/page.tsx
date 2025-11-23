'use client';

import { useEffect, useState } from 'react';
import { testimonialsApi, Testimonial } from '@/lib/backend-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Star, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    rating: 5,
    approved: false,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchTerm]);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const data = await testimonialsApi.getAll();
      setTestimonials(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch testimonials', {
        description: error.message,
      });
    }
    setLoading(false);
  };

  const filterTestimonials = () => {
    let filtered = testimonials;

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTestimonials(filtered);
  };

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    setFormData({ name: '', message: '', rating: 5, approved: false });
    setShowDialog(true);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      message: testimonial.message,
      rating: testimonial.rating || 5,
      approved: testimonial.approved,
    });
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTestimonial) {
        await testimonialsApi.update(editingTestimonial._id, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await testimonialsApi.create(formData);
        toast.success('Testimonial created successfully');
      }
      fetchTestimonials();
      setShowDialog(false);
    } catch (error) {
      toast.error(editingTestimonial ? 'Failed to update testimonial' : 'Failed to create testimonial');
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await testimonialsApi.toggleApproval(id, currentStatus);
      toast.success(currentStatus ? 'Testimonial unapproved' : 'Testimonial approved');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to update approval status');
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await testimonialsApi.delete(id);
      toast.success('Testimonial deleted');
      fetchTestimonials();
      setDeleteId(null);
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const renderStars = (rating?: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= (rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading testimonials...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Testimonials</h1>
            <p className="text-blue-100">Manage customer testimonials and reviews</p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={openCreateDialog}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTestimonials.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No testimonials found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTestimonials.map((testimonial) => (
            <Card
              key={testimonial._id}
              className={`hover:shadow-lg transition-shadow ${
                testimonial.approved ? 'border-green-200 bg-green-50/30' : 'border-gray-200'
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                    <div className="flex gap-1 mt-2">{renderStars(testimonial.rating)}</div>
                  </div>
                  <Badge variant={testimonial.approved ? 'default' : 'secondary'}>
                    {testimonial.approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-700 text-sm line-clamp-4">{testimonial.message}</p>
                <div className="text-xs text-gray-500">
                  {format(new Date(testimonial.createdAt), 'MMM dd, yyyy')}
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    size="sm"
                    variant={testimonial.approved ? 'outline' : 'default'}
                    onClick={() => toggleApproval(testimonial._id, testimonial.approved)}
                    className="flex-1"
                  >
                    {testimonial.approved ? (
                      <>
                        <X className="mr-1 h-3 w-3" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(testimonial)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteId(testimonial._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? 'Update the testimonial details'
                : 'Create a new customer testimonial'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingTestimonial ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteTestimonial(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
