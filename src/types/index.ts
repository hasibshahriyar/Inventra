// =============================================
// Inventra — Type Definitions
// =============================================

export interface Product {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string;
  price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  image_url: string | null;
  status: 'active' | 'inactive' | 'discontinued';
  embedding?: number[];
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  product_name: string | null;
  details: string | null;
  created_at: string;
}

export interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  stock_quantity: number;
  category: string;
  price: number;
  image_url: string | null;
  similarity: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryCounts: Record<string, number>;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(quantity: number, threshold: number = 10): StockStatus {
  if (quantity === 0) return 'out_of_stock';
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}
