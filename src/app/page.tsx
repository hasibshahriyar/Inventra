'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Package, BarChart3, Zap, Shield, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center">
            <Package className="w-5 h-5 text-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Inventra</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 text-sm font-medium text-blue-300 hover:text-foreground transition-colors cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/register')}
            className="px-5 py-2.5 text-sm font-semibold text-white gradient-blue rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="animate-fade-in max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm text-blue-300 font-medium">
            <Zap className="w-3.5 h-3.5" />
            Powered by Supabase — 6 Features Integrated
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
            Manage your inventory
            <br />
            <span className="gradient-blue-text">like never before</span>
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Real-time stock tracking, AI-powered search, and a stunning dashboard —
            all in one beautiful platform.
          </p>

          {/* CTA */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push('/register')}
              className="flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white gradient-blue rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3.5 text-base font-semibold text-muted glass rounded-2xl hover:text-foreground transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-20 animate-slide-up grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl">
          {[
            { icon: Shield, label: 'Auth & RLS', desc: 'Secure by default' },
            { icon: BarChart3, label: 'Real-time', desc: 'Live updates' },
            { icon: Package, label: 'Storage', desc: 'Image uploads' },
            { icon: Zap, label: 'AI Search', desc: 'Vector powered' },
          ].map((f) => (
            <div
              key={f.label}
              className="glass rounded-2xl p-5 text-center hover:border-blue-500/30 transition-all group cursor-default"
            >
              <f.icon className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold text-foreground">{f.label}</p>
              <p className="text-xs text-muted mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-600 border-t border-border/30">
        Built with Next.js, Tailwind CSS v4 & Supabase — Inventra © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
