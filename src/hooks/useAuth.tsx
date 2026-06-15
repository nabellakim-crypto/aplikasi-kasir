import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'

// ── Types ────────────────────────────────────────────────────
export type UserRole = 'admin' | 'staff'

export type AuthUser = {
  username: string
  displayName: string
  role: UserRole
}

type AuthContextType = {
  user: AuthUser | null
  login: (username: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  isAdmin: boolean
}

// ── Hardcoded credentials ────────────────────────────────────
const USERS: Record<string, { password: string; displayName: string; role: UserRole }> = {
  admin: { password: 'admin123', displayName: 'Admin', role: 'admin' },
  staff: { password: 'staff123', displayName: 'Staff', role: 'staff' },
}

const STORAGE_KEY = 'novapos_auth'

// ── Context ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return JSON.parse(stored) as AuthUser
    } catch {}
    return null
  })

  // Sync to localStorage
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = useCallback((username: string, password: string) => {
    const trimUser = username.trim().toLowerCase()
    const entry = USERS[trimUser]

    if (!entry) return { success: false, error: 'Username tidak ditemukan' }
    if (entry.password !== password) return { success: false, error: 'Password salah' }

    const authUser: AuthUser = {
      username: trimUser,
      displayName: entry.displayName,
      role: entry.role,
    }
    setUser(authUser)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
