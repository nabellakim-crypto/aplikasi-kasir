import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ShoppingBag, Eye, EyeOff, LogIn, AlertCircle, Shield, User } from 'lucide-react'

export function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Harap isi username dan password')
      triggerShake()
      return
    }

    const result = login(username, password)
    if (!result.success) {
      setError(result.error ?? 'Login gagal')
      triggerShake()
    }
  }

  function triggerShake() {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />
      <div className="login-bg-orb login-bg-orb-3" />

      <div className={`login-card ${shaking ? 'login-shake' : ''}`}>
        {/* Logo */}
        <div className="login-logo-wrap">
          <div className="login-logo">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="login-title">
            Nova<span>POS</span>
          </h1>
          <p className="login-subtitle">Point of Sale System</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Username */}
          <div className="login-field">
            <label htmlFor="login-username">Username</label>
            <div className="login-input-wrap">
              <User className="login-input-icon" />
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <Shield className="login-input-icon" />
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw(!showPw)}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" className="login-btn">
            <LogIn className="w-4 h-4" />
            Masuk
          </button>
        </form>

        {/* Credentials hint */}
        <div className="login-hint">
          <p className="login-hint-title">Demo Credentials</p>
          <div className="login-hint-grid">
            <div className="login-hint-card">
              <span className="login-hint-badge admin">Admin</span>
              <span className="login-hint-cred">admin / admin123</span>
            </div>
            <div className="login-hint-card">
              <span className="login-hint-badge staff">Staff</span>
              <span className="login-hint-cred">staff / staff123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
