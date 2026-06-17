'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { User, Moon, Sun, Shield, Bell, Key, LogOut, Construction, Save, Loader2 } from 'lucide-react';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Form states
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Account Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Key },
  ];

  const handleUpdateName = async () => {
    setIsSavingName(true);
    setNameMessage('');
    const { error } = await updateProfile({ data: { full_name: name } });
    if (error) setNameMessage(`Error: ${error}`);
    else setNameMessage('Profile updated successfully!');
    setIsSavingName(false);
    setTimeout(() => setNameMessage(''), 3000);
  };

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.');
      return;
    }
    
    setIsSavingPassword(true);
    setPasswordMessage('');
    const { error } = await updateProfile({ password });
    if (error) setPasswordMessage(`Error: ${error}`);
    else {
      setPasswordMessage('Password updated successfully!');
      setPassword('');
      setConfirmPassword('');
    }
    setIsSavingPassword(false);
    setTimeout(() => setPasswordMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-1 md:col-span-1 flex flex-row md:flex-col overflow-x-auto pb-2 md:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap md:whitespace-normal ${
                  isActive 
                    ? 'bg-brand-500/10 text-brand-400' 
                    : 'text-muted hover:text-foreground hover:bg-surface-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <User className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold">Account Profile</h2>
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                  </h3>
                  <p className="text-sm text-muted">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background text-xs font-medium text-muted border border-border">
                    <Shield className="w-3 h-3 text-success" />
                    Free Plan
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Display Name</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-brand-500 transition-all"
                    />
                    <button 
                      onClick={handleUpdateName}
                      disabled={isSavingName || name === (user?.user_metadata?.full_name || '')}
                      className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                      {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </div>
                  {nameMessage && (
                    <p className={`text-xs mt-2 ${nameMessage.includes('Error') ? 'text-danger' : 'text-success'}`}>
                      {nameMessage}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-muted cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted mt-1.5">Contact support to change your email address.</p>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Section */}
          {activeTab === 'appearance' && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-brand-400" /> : <Sun className="w-5 h-5 text-warning" />}
                <h2 className="text-lg font-semibold">Appearance</h2>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Theme Preference</h3>
                  <p className="text-sm text-muted">Toggle between light and dark mode</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:border-brand-500/50 transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-warning" />
                      Switch to Light
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-brand-400" />
                      Switch to Dark
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeTab === 'notifications' && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <Bell className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-semibold">Notifications</h2>
              </div>
              
              <div className="text-center py-8">
                <Construction className="w-12 h-12 text-muted mx-auto mb-3" />
                <h3 className="text-lg font-medium text-foreground">Coming Soon</h3>
                <p className="text-sm text-muted max-w-sm mx-auto mt-1">
                  We're working on giving you granular control over your email and push notifications.
                </p>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              {/* Change Password */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                  <Key className="w-5 h-5 text-brand-400" />
                  <h2 className="text-lg font-semibold">Change Password</h2>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-brand-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-brand-500 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isSavingPassword || !password}
                    className="px-4 py-2.5 mt-2 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Password
                  </button>
                  {passwordMessage && (
                    <p className={`text-xs mt-2 ${passwordMessage.includes('Error') || passwordMessage.includes('match') || passwordMessage.includes('characters') ? 'text-danger' : 'text-success'}`}>
                      {passwordMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="glass rounded-2xl p-6 border-danger/20">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                  <Key className="w-5 h-5 text-danger" />
                  <h2 className="text-lg font-semibold text-danger">Danger Zone</h2>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Sign Out</h3>
                    <p className="text-sm text-muted">Log out of this device securely</p>
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
          )}

        </div>
      </div>
    </div>
  );
}
