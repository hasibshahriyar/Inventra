'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { User, Moon, Sun, Shield, Bell, Key, LogOut, Construction, Save, Loader2, Camera, Trash2 } from 'lucide-react';
import { uploadProductImage } from '@/lib/inventoryService';

type Tab = 'profile' | 'appearance' | 'notifications' | 'security';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, updateProfile, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Form states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // Delete Account states
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Account Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Key },
  ];

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsUploadingAvatar(true);
    setNameMessage('');
    
    try {
      const { url, error: uploadErr } = await uploadProductImage(file);
      if (uploadErr) throw new Error(uploadErr);
      if (url) {
        const { error } = await updateProfile({ data: { avatar_url: url } });
        if (error) throw new Error(error);
        setNameMessage('Profile picture updated!');
      }
    } catch (err: any) {
      setNameMessage(`Upload failed: ${err.message}`);
    } finally {
      setIsUploadingAvatar(false);
      setTimeout(() => setNameMessage(''), 3000);
    }
  };

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'delete') return;
    setIsDeletingAccount(true);
    setDeleteError('');
    const { error } = await deleteAccount();
    if (error) {
      setDeleteError(error);
      setIsDeletingAccount(false);
    }
    // If successful, the auth state change will automatically sign out and redirect
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
                    ? 'bg-blue-500/10 text-blue-400' 
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
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold">Account Profile</h2>
              </div>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-20 h-20 group">
                  {user?.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover shadow-lg border-2 border-border" 
                    />
                  ) : (
                    <div className="w-full h-full rounded-full gradient-blue flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {user?.user_metadata?.full_name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                    {isUploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAvatarUpload} 
                      disabled={isUploadingAvatar} 
                    />
                  </label>
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
                      className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-blue-500 transition-all"
                    />
                    <button 
                      onClick={handleUpdateName}
                      disabled={isSavingName || name === (user?.user_metadata?.full_name || '')}
                      className="px-4 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
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
                {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-warning" />}
                <h2 className="text-lg font-semibold">Appearance</h2>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground mb-1">Theme Preference</h3>
                  <p className="text-sm text-muted">Toggle between light and dark mode</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium hover:border-blue-500/50 transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-warning" />
                      Switch to Light
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-blue-400" />
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
                <Bell className="w-5 h-5 text-blue-400" />
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
                  <Key className="w-5 h-5 text-blue-400" />
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
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:border-blue-500 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleUpdatePassword}
                    disabled={isSavingPassword || !password}
                    className="px-4 py-2.5 mt-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
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
                    className="flex items-center gap-2 px-4 py-2 bg-surface text-foreground border border-border rounded-xl text-sm font-medium hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>

                {/* Delete Account */}
                <div className="flex flex-col md:flex-row md:items-start justify-between pt-6 mt-6 border-t border-border/50">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-medium text-foreground mb-1">Delete Account</h3>
                    <p className="text-sm text-muted max-w-sm">
                      Permanently delete your account and all of your data. This action cannot be undone.
                    </p>
                  </div>
                  {!isDeleting ? (
                    <button
                      onClick={() => setIsDeleting(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm font-medium hover:bg-danger/20 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </button>
                  ) : (
                    <div className="bg-danger/5 border border-danger/20 rounded-xl p-4 w-full md:max-w-xs">
                      <p className="text-sm text-foreground mb-3 font-medium">To confirm, type <span className="font-bold text-danger">delete</span> below:</p>
                      <input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type 'delete'"
                        className="w-full px-3 py-2 bg-background border border-danger/30 rounded-lg text-sm mb-3 focus:border-danger focus:ring-1 focus:ring-danger outline-none transition-all"
                      />
                      {deleteError && <p className="text-xs text-danger mb-3">{deleteError}</p>}
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setIsDeleting(false); setDeleteConfirmation(''); setDeleteError(''); }}
                          className="flex-1 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium hover:bg-surface-hover transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmation !== 'delete' || isDeletingAccount}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {isDeletingAccount ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
