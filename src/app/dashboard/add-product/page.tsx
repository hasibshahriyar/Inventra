'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createProduct, updateProduct, fetchProduct, uploadProductImage, logActivity } from '@/lib/inventoryService';
import { useAuth } from '@/context/AuthContext';
import { Package, Image as ImageIcon, Save, ArrowLeft, Loader2, UploadCloud } from 'lucide-react';
import type { Product } from '@/types';

function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { user } = useAuth();

  const [loading, setLoading] = useState(editId ? true : false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'General',
    description: '',
    price: '0.00',
    cost_price: '0.00',
    stock_quantity: '0',
    low_stock_threshold: '10',
    status: 'active',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (editId) {
      fetchProduct(editId).then(prod => {
        if (prod) {
          setFormData({
            name: prod.name,
            sku: prod.sku || '',
            category: prod.category,
            description: prod.description || '',
            price: prod.price.toString(),
            cost_price: prod.cost_price.toString(),
            stock_quantity: prod.stock_quantity.toString(),
            low_stock_threshold: prod.low_stock_threshold.toString(),
            status: prod.status,
          });
          if (prod.image_url) setPreviewUrl(prod.image_url);
        }
        setLoading(false);
      });
    }
  }, [editId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    
    setSaving(true);
    setError('');

    try {
      let imageUrl = previewUrl;

      // Upload image if changed
      if (imageFile) {
        const { url, error: uploadErr } = await uploadProductImage(imageFile);
        if (uploadErr) throw new Error(`Image upload failed: ${uploadErr}`);
        imageUrl = url;
      }

      const productData = {
        user_id: user.id,
        name: formData.name,
        sku: formData.sku || null,
        category: formData.category,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        low_stock_threshold: parseInt(formData.low_stock_threshold) || 10,
        status: formData.status as any,
        image_url: imageUrl,
      };

      if (editId) {
        const { error: updateErr } = await updateProduct(editId, productData);
        if (updateErr) throw new Error(updateErr);
        await logActivity(user.id, 'Updated product', formData.name);
      } else {
        const { error: createErr } = await createProduct(productData);
        if (createErr) throw new Error(createErr);
        await logActivity(user.id, 'Created product', formData.name);
      }

      router.push('/dashboard/inventory');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-card border border-border hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{editId ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-muted mt-0.5">Fill in the details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-semibold border-b border-border/50 pb-3">Basic Information</h2>
              
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-placeholder focus:border-orange-500 transition-all"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-placeholder focus:border-orange-500 font-mono transition-all"
                    placeholder="PRD-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-placeholder focus:border-orange-500 transition-all"
                    placeholder="Electronics"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-placeholder focus:border-orange-500 transition-all resize-none"
                  placeholder="Product description and details..."
                />
              </div>
            </div>

            <div className="glass rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-semibold border-b border-border/50 pb-3">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Low Stock Alert At</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.low_stock_threshold}
                    onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-semibold border-b border-border/50 pb-3 mb-5">Product Image</h2>
              
              <div className="relative group rounded-xl border-2 border-dashed border-border overflow-hidden bg-background transition-all hover:border-orange-500/50 aspect-square flex flex-col items-center justify-center text-center cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="p-4">
                    <UploadCloud className="w-8 h-8 text-muted mx-auto mb-2 group-hover:text-orange-400 transition-colors" />
                    <p className="text-xs font-medium text-muted">Click or drag to upload</p>
                    <p className="text-[10px] text-slate-600 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-0">
                    <span className="text-xs font-semibold text-foreground px-3 py-1.5 rounded-lg bg-card">Change Image</span>
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h2 className="text-sm font-semibold border-b border-border/50 pb-3 mb-5">Status</h2>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-orange-500 transition-all appearance-none"
              >
                <option value="active">Active (Visible)</option>
                <option value="inactive">Inactive (Hidden)</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-semibold text-muted glass rounded-xl hover:text-foreground transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white gradient-orange rounded-xl hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    }>
      <AddProductContent />
    </Suspense>
  );
}
