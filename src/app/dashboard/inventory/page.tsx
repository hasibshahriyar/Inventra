'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchInventory, deleteProduct, updateProduct, triggerLowStockAlert, logActivity } from '@/lib/inventoryService';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Product } from '@/types';
import { getStockStatus } from '@/types';
import { Package, Search, Trash2, Edit3, Plus, Minus, AlertTriangle, ChevronDown, Filter, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InventoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [realtimeEvent, setRealtimeEvent] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const data = await fetchInventory();
    setProducts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();

    // Feature 3: REALTIME — Live inventory updates
    const supabase = createClient();
    const channel = supabase
      .channel('inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        setRealtimeEvent(`${payload.eventType} at ${new Date().toLocaleTimeString()}`);
        loadProducts();
        setTimeout(() => setRealtimeEvent(null), 3000);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadProducts]);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    const { error } = await deleteProduct(product.id);
    if (!error && user) {
      await logActivity(user.id, 'Deleted product', product.name);
      loadProducts();
    }
  };

  const handleStockChange = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.stock_quantity + delta);
    const { error } = await updateProduct(product.id, { stock_quantity: newQty });
    if (!error) {
      // Feature 5: Edge Function — trigger low stock alert
      if (newQty <= product.low_stock_threshold) {
        await triggerLowStockAlert(product.name, newQty);
      }
      if (user) {
        await logActivity(user.id, `Stock ${delta > 0 ? 'increased' : 'decreased'}`, product.name, `${product.stock_quantity} → ${newQty}`);
      }
      loadProducts();
    }
  };

  // Filter logic
  const categories = ['all', ...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.sku?.toLowerCase().includes(filter.toLowerCase()) ||
      p.description?.toLowerCase().includes(filter.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'low' && p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold) ||
      (statusFilter === 'out' && p.stock_quantity === 0) ||
      (statusFilter === 'ok' && p.stock_quantity > p.low_stock_threshold);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusColor = (qty: number, threshold: number) => {
    const s = getStockStatus(qty, threshold);
    if (s === 'out_of_stock') return 'bg-danger/15 text-danger';
    if (s === 'low_stock') return 'bg-warning/15 text-warning';
    return 'bg-success/15 text-success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Realtime Banner */}
      {realtimeEvent && (
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl px-4 py-2.5 text-sm text-brand-300 flex items-center gap-2 animate-slide-up">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Live update: {realtimeEvent}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} products total</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/add-product')}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white gradient-brand rounded-xl hover:opacity-90 transition-all cursor-pointer"
        >
          <Package className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-surface-border rounded-xl text-sm text-white placeholder:text-slate-600"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-surface-card border border-surface-border rounded-xl text-sm text-white appearance-none cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 bg-surface-card border border-surface-border rounded-xl text-sm text-white appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>
      </div>

      {/* Product Table */}
      {filtered.length > 0 ? (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border/50">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Product</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">SKU</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Price</th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Stock</th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-surface-border/30 last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-brand-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 font-mono">{product.sku || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-brand-300 bg-brand-500/10 px-2.5 py-1 rounded-lg">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-semibold">${product.price.toFixed(2)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStockChange(product, -1)}
                          className="w-7 h-7 rounded-lg bg-surface-dark border border-surface-border flex items-center justify-center hover:bg-danger/10 hover:border-danger/30 hover:text-danger transition-all cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-10 text-center">{product.stock_quantity}</span>
                        <button
                          onClick={() => handleStockChange(product, 1)}
                          className="w-7 h-7 rounded-lg bg-surface-dark border border-surface-border flex items-center justify-center hover:bg-success/10 hover:border-success/30 hover:text-success transition-all cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusColor(product.stock_quantity, product.low_stock_threshold)}`}>
                        {getStockStatus(product.stock_quantity, product.low_stock_threshold).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => router.push(`/dashboard/add-product?edit=${product.id}`)}
                          className="p-2 rounded-lg hover:bg-brand-500/10 text-slate-400 hover:text-brand-400 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 rounded-lg hover:bg-danger/10 text-slate-400 hover:text-danger transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-12 text-center">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-lg font-semibold text-slate-400">No products found</p>
          <p className="text-sm text-slate-600 mt-1">
            {filter || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first product to get started'}
          </p>
        </div>
      )}
    </div>
  );
}
