import { Resource, User, Category, ResourceStatus, Review } from "../types";

// In production (Render), the API is served from the same domain, so we use a relative path.
// In development, if not proxied, we might use localhost, but Vite proxy handles '/api' too.
const API_URL = (import.meta as any).env.PROD ? "/api" : "http://localhost:5000/api";

// Helper to handle fetch errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'API request failed');
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (email: string, password: string): Promise<User> => {
    return fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(handleResponse);
  },

  register: async (userData: any): Promise<User> => {
    return fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(handleResponse);
  },

  updateProfile: async (id: string, name: string): Promise<User> => {
    return fetch(`${API_URL}/users/${id}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    }).then(handleResponse);
  },

  // Resources
  getResources: async (): Promise<Resource[]> => {
    return fetch(`${API_URL}/resources`).then(handleResponse);
  },

  createResource: async (resource: Partial<Resource>): Promise<Resource> => {
    return fetch(`${API_URL}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource)
    }).then(handleResponse);
  },

  updateResourceStatus: async (id: string, status: ResourceStatus): Promise<Resource> => {
    return fetch(`${API_URL}/resources/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse);
  },

  deleteResource: async (id: string): Promise<void> => {
    return fetch(`${API_URL}/resources/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Reviews
  getReviews: async (resourceId: string): Promise<Review[]> => {
    return fetch(`${API_URL}/resources/${resourceId}/reviews`).then(handleResponse);
  },

  addReview: async (resourceId: string, review: Partial<Review>): Promise<Review> => {
    return fetch(`${API_URL}/resources/${resourceId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    }).then(handleResponse);
  },

  // Users (Admin)
  getUsers: async (): Promise<User[]> => {
    return fetch(`${API_URL}/users`).then(handleResponse);
  },

  updateUser: async (user: User): Promise<User> => {
    return fetch(`${API_URL}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    }).then(handleResponse);
  },

  deleteUser: async (id: string): Promise<void> => {
    return fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }).then(handleResponse);
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return fetch(`${API_URL}/categories`).then(handleResponse);
  },

  saveCategory: async (category: Category): Promise<Category> => {
     const url = category.id.startsWith('cat-new') 
        ? `${API_URL}/categories` 
        : `${API_URL}/categories/${category.id}`;
     
     return fetch(url, {
        method: category.id.startsWith('cat-') && category.id.length > 10 ? 'POST' : 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
     }).then(handleResponse);
  },
  
  createCategory: async (category: Category): Promise<Category> => {
     return fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
     }).then(handleResponse);
  },
  
  updateCategory: async (category: Category): Promise<Category> => {
     return fetch(`${API_URL}/categories/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
     }).then(handleResponse);
  },

  deleteCategory: async (id: string): Promise<void> => {
     return fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' }).then(handleResponse);
  }
};
