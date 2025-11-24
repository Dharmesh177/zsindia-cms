const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zoom-sounds-backend.onrender.com/api/v1';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'token': `${token}` } : {}),
  };
}

export type ContactQuery = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  type: 'contact' | 'product' | 'general' | 'support' | 'sales' | 'partnership';
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
};

export type Testimonial = {
  _id: string;
  name: string;
  message: string;
  rating?: number;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
};

export const contactQueriesApi = {
  getAll: async (): Promise<ContactQuery[]> => {
    const response = await fetch(`${API_URL}/query`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch queries');
    const data = await response.json();
    return data.data || data;
  },

  updateStatus: async (id: string, status: string): Promise<void> => {
    const response = await fetch(`${API_URL}/query/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/query/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete query');
  },
};

export const testimonialsApi = {
  getAll: async (): Promise<Testimonial[]> => {
    const response = await fetch(`${API_URL}/testinomial/all`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    const data = await response.json();
    return data.data || data;
  },

  create: async (testimonial: Omit<Testimonial, '_id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> => {
    const response = await fetch(`${API_URL}/testinomial`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testimonial),
    });
    if (!response.ok) throw new Error('Failed to create testimonial');
    const data = await response.json();
    return data.data || data;
  },

  update: async (id: string, testimonial: Partial<Testimonial>): Promise<void> => {
    const response = await fetch(`${API_URL}/testinomial/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(testimonial),
    });
    if (!response.ok) throw new Error('Failed to update testimonial');
  },

  toggleApproval: async (id: string, approved: boolean): Promise<void> => {
    const response = await fetch(`${API_URL}/testinomial/approve/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ approved: !approved }),
    });
    if (!response.ok) throw new Error('Failed to update approval status');
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/testinomial/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete testimonial');
  },
};
