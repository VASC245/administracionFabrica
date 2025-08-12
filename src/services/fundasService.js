// src/services/fundasService.js
import { supabase } from '@/lib/supabase'

export async function searchFundas(term = '', limit = 50) {
  const t = String(term || '').trim()
  let query = supabase.from('fundas_plasticas')
    .select('id, descripcion, medida, stock, minimo')
    .order('descripcion', { ascending: true })
    .limit(limit)
  if (t) {
    query = supabase.from('fundas_plasticas')
      .select('id, descripcion, medida, stock, minimo')
      .or(`descripcion.ilike.%${t}%,medida.ilike.%${t}%`)
      .order('descripcion', { ascending: true })
      .limit(limit)
  }
  const { data, error } = await query
  if (error) throw error
  return data || []
}

/**
 * Ajusta stock de una funda y deja movimiento con metadatos (precio, factura, tipo, referencia).
 * delta: +entrada, -salida (producción o rotura)
 * tipo: 'entrada' | 'produccion' | 'rotura' | 'ajuste'
 */
export async function adjustFundasAndLog({
  funda_id,
  delta,
  tipo,
  precio_unitario = null,
  factura = null,
  proveedor = null,
  referencia = null,
  observacion = null
}) {
  // 1) Stock actual
  const { data: cur, error: e1 } = await supabase
    .from('fundas_plasticas')
    .select('stock')
    .eq('id', funda_id)
    .single()
  if (e1) throw e1

  const next = Math.max(0, Number(cur?.stock || 0) + Number(delta || 0))

  // 2) Actualiza stock
  const { error: e2 } = await supabase
    .from('fundas_plasticas')
    .update({ stock: next })
    .eq('id', funda_id)
  if (e2) throw e2

  // 3) Movimiento
  const { error: e3 } = await supabase
    .from('fundas_movimientos')
    .insert([{
      funda_id,
      cantidad: Number(delta),
      tipo,
      precio_unitario: precio_unitario ?? null,
      factura: factura ?? null,
      proveedor: proveedor ?? null,
      referencia: referencia ?? null,
      observacion: observacion ?? null
    }])
  if (e3) throw e3

  return next
}
