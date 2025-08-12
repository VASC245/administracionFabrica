import { supabase } from '@/lib/supabase'

export const ROLES = [
  { value: 'Super Amin', label: 'Administrador' },
  { value: 'Operador', label: 'Operador' },
  { value: 'Supervisor', label: 'Supervisor' }
]

export async function listUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, nombre, rol, estado, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function updateUser({ id, rol, estado }) {
  const { data, error } = await supabase
    .from('users')
    .update({ rol, estado })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
