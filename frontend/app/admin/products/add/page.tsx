"use client";

import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '@/lib/api';
import { ArrowLeft, Plus, X, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    stock: '',
    badge: '',
    inStock: true,
    rating: '4.5',
    reviews: '0'
  });

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await categoryAPI.getAll();
        if (response.status === 'success') {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    }
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        brand: formData.brand,
        stock: parseInt(formData.stock),
        inStock: formData.inStock,
        rating: parseFloat(formData.rating),
        reviews: parseInt(formData.reviews),
        badge: formData.badge || null,
        images: imageUrl ? [{ url: imageUrl, alt: formData.name }] : [],
        isActive: true
      };

      const response = await productAPI.create(productData);
      
      if (response.status === 'success') {
        alert('Product created successfully!');
        router.push('/');
      }
    } catch (error: any) {
      alert('Error creating product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Add New Product
            </span>
          </h1>
          <p className="text-slate-400 mt-2">Fill in the details to add a new product to your store</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 md:p-8 border border-slate-700">
          <div className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="e.g., Bosch Professional Drill"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="Detailed product description..."
              />
            </div>

            {/* Price & Original Price */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Price (₾) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="99.99"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Original Price (₾)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="129.99 (for discount)"
                />
              </div>
            </div>

            {/* Category & Brand */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Brand *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="e.g., Bosch, DeWalt"
                />
              </div>
            </div>

            {/* Stock & Badge */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Badge</label>
                <select
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                >
                  <option value="">No badge</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                  <option value="Popular">Popular</option>
                  <option value="Best Seller">Best Seller</option>
                </select>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-slate-300 font-semibold mb-2">Product Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                placeholder="https://images.unsplash.com/photo-..."
              />
              <p className="text-slate-500 text-sm mt-2">Enter image URL (from Unsplash, your server, etc.)</p>
            </div>

            {/* In Stock Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="inStock"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-orange-500 focus:ring-orange-500"
              />
              <label htmlFor="inStock" className="text-slate-300 font-medium">Product is in stock</label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-bold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Product'}
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
