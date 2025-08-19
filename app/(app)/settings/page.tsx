'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Camera, User, FileText, Activity, Stethoscope, Calendar, CreditCard, TestTube, ClipboardList, BookOpen, Heart, Shield, Target, Utensils, AlertTriangle, BarChart3, Microscope, Clock, CheckCircle } from 'lucide-react'
import Toast from '@/components/Toast'
import { useAnalytics } from '@/hooks/useAnalytics'

interface ProfileForm {
  full_name: string
  city: string
  goal: 'lose' | 'maintain' | 'gain'
  dietary_prefs: string[]
  allergies: string[]
  avatar_url: string
}

export default function MePage() {
  const [form, setForm] = useState<ProfileForm>({
    full_name: 'John Doe',
    city: 'Mumbai',
    goal: 'maintain',
    dietary_prefs: ['Vegetarian'],
    allergies: ['Peanuts'],
    avatar_url: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [isAdmin, setIsAdmin] = useState(false)
  
  const { trackInteraction } = useAnalytics()

  // Load current profile on mount
  useEffect(() => {
    loadProfile()
    checkAdminRole()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/me')
      if (response.ok) {
        const data = await response.json()
        if (data.ok && data.data) {
          setForm(prev => ({
            ...prev,
            ...data.data
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    }
  }

  const checkAdminRole = async () => {
    try {
      const response = await fetch('/api/admin/check')
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.ok && data.data?.role === 'admin')
      }
    } catch (error) {
      console.error('Failed to check admin role:', error)
    }
  }

  const handleItemClick = (action: string) => {
    trackInteraction('click', 'me_screen', { action })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 p-4 max-w-screen-sm mx-auto">
        {/* Profile Header Card */}
        <div className="card p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-full flex items-center justify-center mx-auto">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-brand-600" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-lg">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{form.full_name}</h2>
          <p className="text-gray-600">{form.city}</p>
        </div>

        {/* Section 1: Basic Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">Profile</h3>
          
          <Link href="/settings" onClick={() => handleItemClick('basic_info')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <span className="font-medium text-gray-900">Basic Information</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('medical_info')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-900">Medical Info</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('lifestyle')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Lifestyle</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('reports')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Reports</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('diet_recall')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
              <span className="font-medium text-gray-900">Diet Recall</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('notes')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">Notes</span>
            </div>
          </Link>
        </div>

        {/* Section 2: Lab Tests */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">Lab Tests</h3>
          
          <Link href="/settings" onClick={() => handleItemClick('book_lab_tests')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                <TestTube className="w-5 h-5 text-rose-600" />
              </div>
              <span className="font-medium text-gray-900">Book Lab Tests</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('my_lab_tests')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <Microscope className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="font-medium text-gray-900">My Lab Tests</span>
            </div>
          </Link>
        </div>

        {/* Section 3: Sessions & Tasks */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">Activities</h3>
          
          <Link href="/settings" onClick={() => handleItemClick('my_sessions')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-cyan-50 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
              <span className="font-medium text-gray-900">My Sessions</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('my_tasks')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-amber-600" />
              </div>
              <span className="font-medium text-gray-900">My Tasks</span>
            </div>
          </Link>

          <Link href="/settings" onClick={() => handleItemClick('payment_history')}>
            <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Payment History</span>
            </div>
          </Link>
        </div>

        {/* Admin Section - Only show for admin users */}
        {isAdmin && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide px-1">Admin</h3>
            
            <Link href="/admin/support" onClick={() => handleItemClick('admin_support')}>
              <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium text-gray-900">Admin Support</span>
              </div>
            </Link>

            <Link href="/admin/recipes" onClick={() => handleItemClick('admin_recipes')}>
              <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
                <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="font-medium text-gray-900">Admin Recipes</span>
              </div>
            </Link>

            <Link href="/admin/plans" onClick={() => handleItemClick('admin_plans')}>
              <div className="flex gap-3 items-center p-4 bg-white rounded-2xl shadow-card">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <span className="font-medium text-gray-900">Admin Plans</span>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
