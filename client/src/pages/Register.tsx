import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    abn: '',
    gst_registered: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [e.target.name]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      const res = await api.post('/auth/register', formData)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error
      setError(axiosMsg ?? 'Registration failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">TM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Free to use — no credit card needed</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg
                            text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                           focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                           focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                           focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ABN{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="abn"
                value={formData.abn}
                onChange={handleChange}
                placeholder="11 digit ABN"
                maxLength={14}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg
                           text-sm focus:outline-none focus:ring-2 focus:ring-green-500
                           focus:border-transparent"
              />
            </div>

            {/* GST toggle */}
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="gst_registered"
                name="gst_registered"
                checked={formData.gst_registered}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 text-green-600 rounded
                           focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="gst_registered" className="text-sm cursor-pointer">
                <span className="font-medium text-gray-700">
                  I am registered for GST
                </span>
                <span className="block text-gray-400 text-xs mt-0.5">
                  Required if annual turnover is $75,000+
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300
                         text-white font-medium py-2.5 rounded-lg text-sm
                         transition-colors mt-2"
            >
              {loading ? 'Creating account...' : 'Create free account'}
            </button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>

        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          🔒 Your financial data is encrypted and secure
        </p>

      </div>
    </div>
  )
}