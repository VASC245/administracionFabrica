import { supabase } from '@/lib/supabase'

// Registrar usuario
export const registerUser = async (email, password) => {
  return await supabase.auth.signUp({ email, password })
}

// Iniciar sesión
export const loginUser = async (email, password) => {
  return await supabase.auth.signInWithPassword({ email, password })
}

// Cerrar sesión
export const logoutUser = async () => {
  return await supabase.auth.signOut()
}

// Obtener usuario actual
export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
