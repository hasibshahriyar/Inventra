// =============================================
// Inventra — Inventory Service
// Features 2 (CRUD), 4 (Storage), 5 (Edge Functions)
// =============================================

import { createClient } from '@/lib/supabase/client';
import { generateMockEmbedding } from '@/lib/searchService';
import type { Product } from '@/types';

const supabase = createClient();

// =============================================
// Feature 2: DATABASE — CRUD Operations
// =============================================

export const fetchInventory = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[DB] fetchInventory error:', error.message);
    return [];
  }
  return data as Product[];
};

export const fetchProduct = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[DB] fetchProduct error:', error.message);
    return null;
  }
  return data as Product;
};

export const createProduct = async (
  product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'embedding'>
): Promise<{ data: Product | null; error: string | null }> => {
  const textToEmbed = `${product.name} ${product.description || ''} ${product.category || ''}`;
  const embedding = generateMockEmbedding(textToEmbed);

  const { data, error } = await supabase
    .from('products')
    .insert({ ...product, embedding })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Product, error: null };
};

export const updateProduct = async (
  id: string,
  updates: Partial<Product>
): Promise<{ error: string | null }> => {
  const payload: any = { ...updates };

  if (updates.name || updates.description || updates.category) {
    const { data: existing } = await supabase.from('products').select('name, description, category').eq('id', id).single();
    if (existing) {
      const textToEmbed = `${updates.name || existing.name} ${updates.description || existing.description || ''} ${updates.category || existing.category || ''}`;
      payload.embedding = generateMockEmbedding(textToEmbed);
    }
  }

  const { error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id);

  if (error) return { error: error.message };
  return { error: null };
};

export const deleteProduct = async (id: string): Promise<{ error: string | null }> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };
  return { error: null };
};

// =============================================
// Feature 4: STORAGE — Product Image Upload
// =============================================

export const uploadProductImage = async (
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const storagePath = `public/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error('[STORAGE] upload error:', uploadError.message);
    return { url: null, error: uploadError.message };
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(storagePath);

  return { url: urlData.publicUrl, error: null };
};

export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  const path = imageUrl.split('/product-images/')[1];
  if (!path) return;

  const { error } = await supabase.storage
    .from('product-images')
    .remove([path]);

  if (error) console.error('[STORAGE] delete error:', error.message);
};

// =============================================
// Feature 5: EDGE FUNCTIONS — Low Stock Alert
// =============================================

export const triggerLowStockAlert = async (
  productName: string,
  currentStock: number
): Promise<void> => {
  console.log(`[EDGE] Triggering alert for: ${productName} (stock: ${currentStock})`);

  const { data, error } = await supabase.functions.invoke('low-stock-alert', {
    body: {
      message: currentStock === 0
        ? `🚨 ALERT: "${productName}" is OUT OF STOCK!`
        : `⚠️  WARNING: "${productName}" is low in stock (${currentStock} remaining)`,
      product_name: productName,
      stock: currentStock,
      timestamp: new Date().toISOString(),
    },
  });

  if (error) {
    console.warn('[EDGE] low-stock-alert not available:', error.message);
  } else {
    console.log('[EDGE] Alert sent:', data);
  }
};

// =============================================
// Activity Log
// =============================================

export const logActivity = async (
  userId: string,
  action: string,
  productName?: string,
  details?: string
): Promise<void> => {
  const { error } = await supabase.from('activity_log').insert({
    user_id: userId,
    action,
    product_name: productName ?? null,
    details: details ?? null,
  });

  if (error) console.error('[DB] logActivity error:', error.message);
};

export const fetchRecentActivity = async (limit = 10) => {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
};
