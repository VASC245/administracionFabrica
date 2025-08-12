// src/services/authService.js
import { supabase } from '@/lib/supabase'

/* ==== Auth base (tu patrón) ==== */
export async function registerUser(email, password) {
  return await supabase.auth.signUp({ email, password })
}
export async function loginUser(email, password) {
  return await supabase.auth.signInWithPassword({ email, password })
}
export async function logoutUser() {
  return await supabase.auth.signOut()
}
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/* ==== Perfil desde public.users ==== */
export async function getUserProfile(userId) {
  if (!userId) return null
  const { data, error } = await supabase
    .from('users')
    .select('id, nombre, rol, estado') // sin email
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

/* ==== Normalización de roles (SOLO 3) ====
   'Super Admin' -> 'superadmin'
   'Supervisor'  -> 'supervisor'
   'Operador'    -> 'operador'
   Se aceptan variantes de mayúsculas/espacios.
*/
export function normalizeRole(rol) {
  if (!rol) return null
  const r = String(rol).trim().toLowerCase()
  if (r.replace(/\s+/g, '') === 'superadmin') return 'superadmin'
  if (r === 'supervisor') return 'supervisor'
  if (r === 'operador' || r === 'opera') return 'operador'
  // cualquier otro valor no es válido para permisos
  return null
}

/* ==== Local session helpers ==== */
export function persistSessionToLocal(user, role) {
  try {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    if (role) localStorage.setItem('role', role) // guardo el normalizado
  } catch {}
}
export function clearLocalSession() {
  try { localStorage.clear() } catch {}
}
