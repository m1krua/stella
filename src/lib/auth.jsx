import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)
const DEMO_SESSION_KEY = 'stella-demo-session'
const DEMO_USERS_KEY = 'stella-demo-users'
const APP_REDIRECT_URL = 'http://localhost:5174'
const RESET_PASSWORD_REDIRECT_URL = `${APP_REDIRECT_URL}/reset-password`
export const DEMO_ADMIN_EMAIL = 'admin@stella.local'
export const DEMO_ADMIN_PASSWORD = 'Admin123!'
export const DEMO_ADMIN_NICK = 'StellaAdmin'

function readDemoSession() {
  try { return JSON.parse(localStorage.getItem(DEMO_SESSION_KEY) || 'null') } catch { return null }
}

function persistDemoSession(session) {
  if (!session) return
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session))
}

function readDemoUsers() {
  try { return JSON.parse(localStorage.getItem(DEMO_USERS_KEY) || '{}') } catch { return {} }
}

function persistDemoUsers(users) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users || {}))
}

function normalizeDemoEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function isEmailRateLimitError(authError) {
  const message = String(authError?.message || '').toLowerCase()
  return authError?.status === 429 || message.includes('rate limit') || message.includes('too many requests') || message.includes('email rate')
}

function getEmailRateLimitError() {
  return new Error('Слишком много писем отправлено. Подождите несколько минут и попробуйте снова. Не нажимайте кнопку повторно несколько раз.')
}

function makeDemoAdminSession() {
  const demoUser = {
    id: 'demo-admin',
    email: DEMO_ADMIN_EMAIL,
    user_metadata: { firstName: 'Админ', lastName: 'Система', nick: DEMO_ADMIN_NICK }
  }

  const demoProfile = {
    id: demoUser.id,
    email: DEMO_ADMIN_EMAIL,
    first_name: 'Админ',
    last_name: 'Система',
    nick: DEMO_ADMIN_NICK,
    role: 'admin'
  }

  return { user: demoUser, profile: demoProfile }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadProfile(authUser) {
    if (!authUser || !supabase) return null
    const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()
    if (profileError && profileError.code !== 'PGRST116') throw profileError
    return data
  }

  async function ensureProfile(authUser, overrides = {}) {
    if (!authUser || !supabase) return null

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const sessionUser = sessionData?.session?.user || authUser
    if (!sessionUser?.id) return null

    const existingProfile = await loadProfile(sessionUser)
    if (existingProfile) return existingProfile

    const payload = {
      id: sessionUser.id,
      email: sessionUser.email || authUser.email || '',
      first_name: String(overrides.firstName || sessionUser.user_metadata?.first_name || '').trim(),
      last_name: String(overrides.lastName || sessionUser.user_metadata?.last_name || '').trim(),
      role: overrides.role === 'translator' ? 'translator' : 'client',
      phone: overrides.phone || sessionUser.user_metadata?.phone || null,
      company: overrides.company || sessionUser.user_metadata?.company || null,
      city: overrides.city || sessionUser.user_metadata?.city || null,
    }

    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') return await loadProfile(sessionUser)
      if (insertError.code === '42501') {
        throw new Error('Роль пользователя не может создать запись в public.profiles. Проверьте политики RLS для INSERT/UPDATE на profiles и auth.uid() = id.')
      }
      throw insertError
    }

    return data
  }

  useEffect(() => {
    let active = true
    async function init() {
      try {
        if (!supabase) {
          const session = readDemoSession()
          if (active) { setUser(session?.user || null); setProfile(session?.profile || null) }
          return
        }
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user && active) { setUser(session.user); setProfile(await loadProfile(session.user)) }
        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
          if (!active) return
          setUser(nextSession?.user || null)
          try { setProfile(nextSession?.user ? await loadProfile(nextSession.user) : null) } catch (profileError) { setError(profileError.message) }
        })
        return () => listener.subscription.unsubscribe()
      } catch (authError) { if (active) setError(authError.message) } finally { if (active) setLoading(false) }
    }
    const cleanupPromise = init()
    return () => { active = false; cleanupPromise.then(cleanup => cleanup?.()) }
  }, [])

  async function signUp({ email, password, firstName, lastName, role }) {
    setError('')
    const safeRole = role === 'translator' ? 'translator' : 'client'
    const normalizedEmail = normalizeDemoEmail(email)
    const safeEmail = normalizedEmail || String(email || '').trim()

    if (!supabase) {
      const users = readDemoUsers()
      const userKey = normalizedEmail
      const existing = users[userKey]

      if (existing && existing.password === String(password || '')) {
        const session = { user: existing.user, profile: existing.profile }
        persistDemoSession(session)
        setUser(existing.user); setProfile(existing.profile)
        return session
      }

      const demoUser = {
        id: `demo-${Date.now()}`,
        email: normalizedEmail,
        password: String(password || ''),
        user_metadata: { firstName, lastName }
      }
      const demoProfile = { id: demoUser.id, email: normalizedEmail, first_name: firstName, last_name: lastName, role: safeRole }
      const session = { user: demoUser, profile: demoProfile }
      users[userKey] = { password: String(password || ''), user: demoUser, profile: demoProfile }
      persistDemoUsers(users)
      persistDemoSession(session)
      setUser(demoUser); setProfile(demoProfile)
      return session
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: safeEmail,
        password,
        options: {
          emailRedirectTo: APP_REDIRECT_URL,
          data: { first_name: firstName, last_name: lastName, role: safeRole }
        }
      })

      if (signUpError) {
        if (isEmailRateLimitError(signUpError)) throw getEmailRateLimitError()
        if (signUpError.message?.toLowerCase().includes('email not confirmed') || signUpError.message?.toLowerCase().includes('confirmation')) {
          throw new Error('Подтвердите email по ссылке из письма, затем войдите в аккаунт. Для мгновенного входа отключите подтверждение email в настройках Supabase Auth.')
        }
        throw signUpError
      }

      if (data.user) {
        const readyUser = data.session?.user || data.user

        if (readyUser?.id) {
          const nextProfile = await ensureProfile(readyUser, { firstName, lastName, role: safeRole })
          setUser(readyUser); setProfile(nextProfile)
          return { user: readyUser, profile: nextProfile }
        }

        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: safeEmail, password })
          if (signInError) {
            if (signInError.message?.toLowerCase().includes('email not confirmed') || signInError.message?.toLowerCase().includes('confirmation')) {
              throw new Error('Аккаунт создан, но вход не выполнен. В настройках Supabase Auth отключите подтверждение email, чтобы регистрация сразу открывала аккаунт.')
            }
            if (signInError.message?.toLowerCase().includes('invalid login credentials')) {
              throw new Error('Неверный email или пароль. Проверьте данные входа и убедитесь, что вы используете тот же Supabase проект.')
            }
            throw signInError
          }

          const nextProfile = await ensureProfile(signInData.user, { firstName, lastName, role: safeRole })
          setUser(signInData.user); setProfile(nextProfile)
          return { user: signInData.user, profile: nextProfile }
        } catch (loginError) {
          let nextProfile = null
          try {
            nextProfile = await loadProfile(data.user)
          } catch (profileError) {
            const code = profileError?.code || ''
            const message = String(profileError?.message || '')
            if (code !== 'PGRST116' && !message.includes('No rows found') && !message.includes('not found')) {
              throw profileError
            }
          }

          return { user: data.user, profile: nextProfile, requiresEmailConfirmation: true }
        }
      }

      throw new Error('Не удалось создать аккаунт. Проверьте введённые данные и попробуйте ещё раз.')
    } catch (authError) {
      throw authError
    }
  }

  async function signIn({ email, password }) {
    setError('')
    const normalizedEmail = normalizeDemoEmail(email)
    const normalizedPassword = String(password || '')

    if (normalizedEmail === DEMO_ADMIN_EMAIL && normalizedPassword === DEMO_ADMIN_PASSWORD) {
      const session = makeDemoAdminSession()
      persistDemoSession(session)
      setUser(session.user); setProfile(session.profile); return session
    }

    if (!supabase) {
      const users = readDemoUsers()
      const current = users[normalizedEmail]
      if (!current || current.password !== normalizedPassword) {
        throw new Error('Неверный email или пароль. Проверьте данные входа.')
      }

      const session = { user: current.user, profile: current.profile }
      persistDemoSession(session)
      setUser(current.user); setProfile(current.profile); return session
    }

    try {
      const preparedEmail = normalizeDemoEmail(email)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: preparedEmail, password })
      if (signInError) {
        if (String(signInError.message || '').toLowerCase().includes('email not confirmed')) throw new Error('Подтвердите email по ссылке из письма, затем войдите в аккаунт.')
        if (String(signInError.message || '').toLowerCase().includes('invalid login credentials')) throw new Error('Неверный email или пароль. Проверьте данные входа и убедитесь, что вы используете тот же Supabase проект.')
        throw signInError
      }
      const nextProfile = await ensureProfile(data.user, { firstName: data.user.user_metadata?.first_name || '', lastName: data.user.user_metadata?.last_name || '', role: 'client' })
      setUser(data.user); setProfile(nextProfile); return { ...data, profile: nextProfile }
    } catch (authError) {
      throw authError
    }
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    localStorage.removeItem(DEMO_SESSION_KEY); setUser(null); setProfile(null)
  }

  async function resetPasswordForEmail(email) {
    if (!supabase) return
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: RESET_PASSWORD_REDIRECT_URL })
    if (resetError) {
      if (isEmailRateLimitError(resetError)) throw getEmailRateLimitError()
      throw resetError
    }
  }

  async function updatePassword(password) {
    if (!supabase) return
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) throw updateError
  }

  const value = { user, profile, role: profile?.role || null, loading, error, isDemo: !supabase, signUp, signIn, signOut, resetPasswordForEmail, updatePassword }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
