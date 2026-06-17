'use client';

import { useEffect, useState } from 'react';
import { fetchInventory, fetchRecentActivity } from '@/lib/inventoryService';
import { createClient } from '@/lib/supabase/client';
import type { Product, ActivityLog } from '@/types';
import { Package, AlertTriangle, XCircle, DollarSign, TrendingUp, Clock, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#f97316', '#fb923c', '#f59e0b', '#fbbf24', '#fdba74', '#ea580c'];

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [prods, acts] = await Promise.all([
        fetchInventory(),
        fetchRecentActivity(8),
      ]);
      setProducts(prods);
      setActivity(acts);
      setLoading(false);
    };
    load();

    // Feature 3: REALTIME — Subscribe to product changes
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        // Refresh data when any product changes
        fetchInventory().then(setProducts);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock_quantity, 0);
  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;

  // Category data for pie chart
  const categoryMap: Record<string, number> = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Stock level data for bar chart
  const stockData = products
    .slice(0, 8)
    .map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name, stock: p.stock_quantity }));

  const stats = [
    { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { label: 'Inventory Value', value: `$${totalValue.toLocaleString()}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Out of Stock', value: outOfStockCount, icon: XCircle, color: 'text-danger', bg: 'bg-danger/10' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted mt-0.5">Overview of your inventory</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span className="font-medium">Real-time enabled</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 hover:border-orange-500/20 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Levels Bar Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Stock Levels</h3>
          {stockData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stockData}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a25',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="stock" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted">
              No products yet — add some to see charts!
            </div>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-4">Categories</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1a25',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-muted">
              No categories yet
            </div>
          )}
          {/* Legend */}
          {categoryData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-2">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span className="text-xs text-muted">{cat.name} ({cat.value})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-semibold">Recent Activity</h3>
        </div>
        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((act) => (
              <div key={act.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm font-medium">{act.action}</p>
                  {act.product_name && (
                    <p className="text-xs text-muted">{act.product_name} — {act.details}</p>
                  )}
                </div>
                <span className="text-xs text-slate-600 shrink-0 ml-4">
                  {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-8">
            No activity yet — start adding products!
          </p>
        )}
      </div>
    </div>
  );
}
