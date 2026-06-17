// =============================================
// Feature 6: VECTOR / AI SEARCH
// Semantic search using Supabase pgvector
// =============================================

import { createClient } from '@/lib/supabase/client';
import type { SearchResult } from '@/types';

const supabase = createClient();

// Mock embedding generator (in production: use OpenAI/Gemini API)
export const generateMockEmbedding = (text: string): number[] => {
  const vector = new Array(1536).fill(0);
  for (let i = 0; i < text.length; i++) {
    vector[i % 1536] += text.charCodeAt(i) / 1000;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => (magnitude > 0 ? val / magnitude : 0));
};

export const searchProductsWithAI = async (
  query: string
): Promise<SearchResult[]> => {
  const queryEmbedding = generateMockEmbedding(query);

  const { data, error } = await supabase.rpc('match_products', {
    query_embedding: queryEmbedding,
    match_threshold: -1.0,
    match_count: 10,
  });

  if (error) {
    console.warn('[VECTOR] RPC not available, falling back to text search:', error.message);
    return searchProductsByText(query);
  }

  return (data as SearchResult[]) || [];
};

// Fallback text search when vector not set up
export const searchProductsByText = async (query: string): Promise<SearchResult[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, stock_quantity, category, price, image_url')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,sku.ilike.%${query}%`);

  if (error) return [];
  return (data || []).map(item => ({ ...item, similarity: 0.9 })) as SearchResult[];
};
