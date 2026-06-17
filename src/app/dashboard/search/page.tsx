'use client';

import { useState } from 'react';
import { searchProductsWithAI } from '@/lib/searchService';
import type { SearchResult } from '@/types';
import { Search, Sparkles, Package, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    
    // Feature 6: Vector Search
    const data = await searchProductsWithAI(query.trim());
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-300 text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Semantic Search
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-3">Find anything instantly</h1>
        <p className="text-muted max-w-lg mx-auto">
          Describe what you're looking for naturally. Our AI understands context, not just exact keywords.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative flex items-center bg-card border border-border rounded-2xl overflow-hidden p-2">
          <Search className="w-6 h-6 text-muted ml-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. 'comfortable running shoes' or 'cheap electronics'..."
            className="flex-1 bg-transparent border-none text-foreground px-4 py-3 focus:outline-none placeholder:text-muted text-lg"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 text-sm font-semibold text-white gradient-orange rounded-xl hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
          </button>
        </div>
      </form>

      {/* Results */}
      {searched && !loading && (
        <div className="space-y-4 mt-10">
          <div className="flex items-center justify-between text-sm text-muted pb-2 border-b border-border/50">
            <span>Found {results.length} results for "{query}"</span>
            <div className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span>Ranked by AI relevance</span>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((product) => (
                <div key={product.id} className="glass rounded-2xl p-5 flex gap-4 hover:border-orange-500/30 transition-all group">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-background flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-foreground truncate pr-2">{product.name}</h3>
                      <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                        {(product.similarity * 100).toFixed(0)}% match
                      </span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2 mb-2">{product.description || 'No description available.'}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-bold text-sm">${product.price.toFixed(2)}</span>
                      <button
                        onClick={() => router.push(`/dashboard/add-product?edit=${product.id}`)}
                        className="text-xs font-medium text-orange-400 hover:text-orange-300"
                      >
                        Edit →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 glass rounded-2xl">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-lg font-semibold text-muted">No matching products found</p>
              <p className="text-sm text-slate-600 mt-1">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
