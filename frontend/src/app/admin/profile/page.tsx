'use client'

import { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin/header'
import { AdminSidebar } from '@/components/admin/sidebar'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  address?: string
  zip_code?: string
  user_type: string
  branch?: {
    id: number
    name: string
    location?: string
  }
}

export default function ProfilePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'edit' | 'password'>('edit')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    zip_code: '',
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })

  useEffect(() => {
    checkAuth()
  }, [router])

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token')
    const userData = localStorage.getItem('admin_user')

    if (!token || !userData) {
      router.push('/admin')
      return
    }
    fetchProfile()
  }

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.get('/profile')
      const userData = response.data.data
      setUser(userData)
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone_number: userData.phone_number || '',
        address: userData.address || '',
        zip_code: userData.zip_code || '',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to load profile',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await apiClient.put('/profile', formData)
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!',
      })
      setTimeout(() => setMessage(null), 3000)
      await fetchProfile()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to update profile',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match',
      })
      return
    }
    try {
      setIsSaving(true)
      await apiClient.post('/profile/change-password', passwordData)
      setMessage({
        type: 'success',
        text: 'Password changed successfully!',
      })
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to change password',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
        <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-4 border-red-200 border-t-red-600 animate-spin mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      <AdminHeader user={user} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
              My Profile
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">Manage your account settings and security</p>
          </div>

          {/* Message Alert */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slideDown border ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <span
                className={
                  message.type === 'success'
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }
              >
                {message.text}
              </span>
            </div>
          )}

          {/* User Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">First Name</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{user?.first_name}</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Last Name</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{user?.last_name}</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">User Type</p>
              <p className="text-lg font-bold capitalize text-neutral-900 dark:text-white">{user?.user_type}</p>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Branch</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">{user?.branch?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Tabs Container */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-lg overflow-hidden">
            {/* Tab Buttons */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'edit'
                    ? 'text-red-600 border-b-2 border-red-600 dark:text-orange-400 dark:border-orange-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === 'password'
                    ? 'text-red-600 border-b-2 border-red-600 dark:text-orange-400 dark:border-orange-400'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Change Password
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 md:p-8">
              {/* Edit Profile Tab */}
              {activeTab === 'edit' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="animate-slideDown" style={{ animationDelay: '0.1s' }}>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition"
                      />
                    </div>
                    <div className="animate-slideDown" style={{ animationDelay: '0.2s' }}>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition"
                      />
                    </div>
                    <div className="animate-slideDown" style={{ animationDelay: '0.3s' }}>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition"
                      />
                    </div>
                    <div className="animate-slideDown" style={{ animationDelay: '0.4s' }}>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition"
                      />
                    </div>
                    <div className="animate-slideDown md:col-span-2" style={{ animationDelay: '0.5s' }}>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition"
                      />
                    </div>
                    <div className="animate-slideDown" style={{ animationDelay: '0.6s' }}>
                      <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        value={formData.zip_code}
                        onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <Save size={18} />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md animate-fadeIn">
                  <div className="animate-slideDown" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="animate-slideDown" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="animate-slideDown" style={{ animationDelay: '0.3s' }}>
                    <label className="block text-sm font-semibold text-neutral-900 dark:text-white mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.new_password_confirmation}
                        onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:border-red-500 dark:focus:border-orange-400 focus:outline-none transition pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <Save size={18} />
                      {isSaving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
