import { supabase } from '@/lib/supabase'

// ==================== VIAJES (Despachos) ====================
export async function getViajes() {
  const { data, error } = await supabase.from('viajes_despacho').select('*').order('fecha', { ascending: false })
  if (error) throw error
  return data
}

export async function addViaje(viaje) {
  const { data, error } = await supabase.from('viajes_despacho').insert([viaje])
  if (error) throw error
  return data
}

// ==================== ASERRIN ====================
export async function getAserrin() {
  const { data, error } = await supabase.from('aserrin_ingresos').select('*').order('fecha', { ascending: false })
  if (error) throw error
  return data
}

// ==================== HORNO ====================
export async function getHorno() {
  const { data, error } = await supabase.from('horno_registros').select('*').order('fecha', { ascending: false })
  if (error) throw error
  return data
}

// ==================== ASISTENCIA ====================
export async function getAsistencia() {
  const { data, error } = await supabase.from('asistencia').select('*').order('fecha', { ascending: false })
  if (error) throw error
  return data
}
