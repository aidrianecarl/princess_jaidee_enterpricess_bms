'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, EyeOff, AlertCircle, CheckCircle, Loader } from 'lucide-react'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string
  address: string
  zip_code: string
  user_type: string
  branch?: {
    id: number
    name: string
    location: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        if (!token) {
          router.push('/admin')
          return
        }

        const response = await fetch(`${apiUrl}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setUser(data.data)
        setFormData(data.data)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setMessage({ type: 'error', text: 'Failed to load profile' })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [apiUrl, router])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        router.push('/admin')
        return
      }

      const response = await fetch(`${apiUrl}/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      setUser(data.data)
      setMessage({ type: 'success', text: 'Profile updated successfully' })
      
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        router.push('/admin')
        return
      }

      const response = await fetch(`${apiUrl}/profile/change-password`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          new_password_confirmation: passwordData.new_password_confirmation,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to change password')
      }

      setMessage({ type: 'success', text: 'Password changed successfully' })
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      })
      
      setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="animate-spin">
          <Loader size={32} className="text-red-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your account settings and security
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-slideDown ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            )}
            <span
              className={`text-sm font-medium ${
                message.type === 'success'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {message.text}
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-neutral-800 p-1 rounded-lg border border-neutral-200 dark:border-neutral-700 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-300 ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 md:p-8 shadow-lg animate-fadeIn">
            <div className="space-y-6">
              {/* User Info Display */}
              <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-600">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">User Type</p>
                <p className="text-neutral-900 dark:text-white capitalize font-medium">{user?.user_type}</p>
                {user?.branch && (
                  <>
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1 mt-3">Branch</p>
                    <p className="text-neutral-900 dark:text-white font-medium">{user.branch.name}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{user.branch.location}</p>
                  </>
                )}
              </div>

              {/* First Name */}
              <div className="animate-slideDown" style={{ animationDelay: '0.05s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Last Name */}
              <div className="animate-slideDown" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div className="animate-slideDown" style={{ animationDelay: '0.15s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Phone Number */}
              <div className="animate-slideDown" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Address */}
              <div className="animate-slideDown" style={{ animationDelay: '0.25s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Zip Code */}
              <div className="animate-slideDown" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Zip Code
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ''}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl animate-slideDown"
                style={{ animationDelay: '0.35s' }}
              >
                {saving ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 md:p-8 shadow-lg animate-fadeIn">
            <div className="space-y-6">
              {/* Current Password */}
              <div className="animate-slideDown" style={{ animationDelay: '0.05s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="animate-slideDown" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="animate-slideDown" style={{ animationDelay: '0.15s' }}>
                <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 pr-10 rounded-lg border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                  >
                    {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Change Password Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl animate-slideDown"
                style={{ animationDelay: '0.2s' }}
              >
                {saving ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Changing...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Change Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
