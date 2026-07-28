import { useState, type ChangeEvent} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!isValidEmail) {
      setError('Please enter a valid email address')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', formData)
      if (rememberMe) {
        localStorage.setItem('taxmate_remember', formData.email)
      }
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err: unknown) {
      const axiosMsg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error
      setError(axiosMsg ?? 'Unable to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600
                      via-green-500 to-emerald-400 flex-col justify-between p-12">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl
                          flex items-center justify-center">
            <Wallet size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">TaxMate Easy</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your receipts,<br />organised for<br />AU tax time.
          </h2>
          <p className="text-green-100 text-lg mb-10">
            AI-powered receipt scanning built for Australian sole traders and tradies.
          </p>

          <div className="space-y-3">
            {[
              'Automatic GST calculation',
              'ATO-approved expense categories',
              'One-click CSV export for your accountant',
              'Secure cloud storage for 5 years'
            ].map(feature => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-green-200 flex-shrink-0" />
                <span className="text-green-50 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur
                        rounded-xl px-4 py-3 w-fit">
          <ShieldCheck size={18} className="text-green-200" />
          <span className="text-green-100 text-sm">
            256-bit SSL encrypted · ATO compliant
          </span>
        </div>

      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center
                      bg-gray-50 p-6">
        <div className="w-full max-w-md">

          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center
                            justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">TaxMate Easy</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50
                            border border-red-200 rounded-xl">
              <AlertCircle
                size={18}
                className="text-red-500 flex-shrink-0 mt-0.5"
              />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2
                             text-gray-400 pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => setEmailTouched(true)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-xl text-sm
                             bg-white transition-colors focus:outline-none
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             ${emailTouched && !isValidEmail && formData.email
                               ? 'border-red-300 bg-red-50'
                               : 'border-gray-300 hover:border-gray-400'
                             }`}
                />
                {isValidEmail && formData.email && (
                  <CheckCircle2
                    size={16}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2
                               text-green-500 pointer-events-none"
                  />
                )}
              </div>
              {emailTouched && !isValidEmail && formData.email && (
                <p className="text-red-500 text-xs mt-1.5">
                  Please enter a valid email address
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-green-600 hover:text-green-700
                             hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2
                             text-gray-400 pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300
                             rounded-xl text-sm bg-white hover:border-gray-400
                             transition-colors focus:outline-none focus:ring-2
                             focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded
                           focus:ring-green-500 cursor-pointer"
              />
              <label
                htmlFor="rememberMe"
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2
                         bg-green-500 hover:bg-green-600 active:bg-green-700
                         disabled:bg-green-300 disabled:cursor-not-allowed
                         text-white font-semibold py-2.5 rounded-xl text-sm
                         transition-all duration-150 shadow-sm
                         hover:shadow-md mt-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to TaxMate'
              )}
            </button>

          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">New to TaxMate?</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Link
            to="/register"
            className="w-full flex items-center justify-center
                       border border-gray-300 hover:border-green-400
                       hover:bg-green-50 text-gray-700 hover:text-green-700
                       font-medium py-2.5 rounded-xl text-sm
                       transition-all duration-150"
          >
            Create a free account
          </Link>

          <div className="flex items-center justify-center gap-2 mt-8">
            <ShieldCheck size={14} className="text-gray-300" />
            <p className="text-xs text-gray-400">
              Protected by 256-bit SSL encryption
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}