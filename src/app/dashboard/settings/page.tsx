'use client';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { User, Moon, Sun, Shield, Bell, Key, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar (Desktop) */}
        <div className="hidden md:block space-y-1">
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium bg-brand-500/10 text-brand-400">
            Account Profile
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-surface-hover transition-colors">
            Appearance
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-surface-hover transition-colors">
            Notifications
          </button>
          <button className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-surface-hover transition-colors">
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border/50">
              <User className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-semibold">Account Profile</h2>
            </div>
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{user?.email?.split('@')[0]}</h3>
                <p className="text-sm text-slate-400">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-dark text-xs font-medium text-slate-300 border border-surface-border">
                  <Shield className="w-3 h-3 text-success" />
                  Free Plan
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-4 py-2.5 bg-surface-dark/50 border border-surface-border rounded-xl text-sm text-slate-400 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1.5">Contact support to change your email address.</p>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border/50">
              {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-400" /> : <Sun className="w-5 h-5 text-warning" />}
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white mb-1">Theme Preference</h3>
                <p className="text-sm text-slate-400">Toggle between light and dark mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-surface-dark border border-surface-border rounded-xl text-sm font-medium hover:border-brand-500/50 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4" />
                    Switch to Light
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    Switch to Dark
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="glass rounded-2xl p-6 border-danger/20">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-surface-border/50">
              <Key className="w-5 h-5 text-danger" />
              <h2 className="text-lg font-semibold text-danger">Danger Zone</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white mb-1">Sign Out</h3>
                <p className="text-sm text-slate-400">Log out of this device</p>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
