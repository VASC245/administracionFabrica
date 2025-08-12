// src/services/repuestosService.js
import { supabase } from '@/lib/supabase'

/**
 * Busca repuestos por texto:
 * - si term está vacío: devuelve los primeros N ordenados por descripción
 * - si hay term: busca por sku y por descripción (ilike) y combina resultados
 */
export async function searchRepuestos(term = '', limit = 20) {
  const t = String(term || '').trim()

  if (!t) {
    const { data, error } = await supabase
      .from('repuestos')
      .select('id, sku, descripcion, stock, minimo')
      .order('descripcion', { ascending: true })
      .limit(limit)
    if (error) throw error
    return data || []
  }

  const [{ data: bySku, error: e1 }, { data: byDesc, error: e2 }] = await Promise.all([
    supabase.from('repuestos')
      .select('id, sku, descripcion, stock, minimo')
      .ilike('sku', `%${t}%`)
      .limit(limit),
    supabase.from('repuestos')
      .select('id, sku, descripcion, stock, minimo')
      .ilike('descripcion', `%${t}%`)
      .limit(limit)
  ])
  if (e1) throw e1
  if (e2) throw e2

  const map = new Map()
  ;[...(bySku || []), ...(byDesc || [])].forEach(r => map.set(r.id, r))
  return Array.from(map.values())
}

/**
 * Obtiene un repuesto por SKU exacto, o por coincidencia en descripción.
 */
export async function findRepuestoBySkuOrName(key) {
  const term = String(key || '').trim()
  if (!term) return null

  // 1) SKU exacto
  const { data: bySku, error: e1 } = await supabase
    .from('repuestos')
    .select('id, sku, descripcion, stock, minimo')
    .eq('sku', term)
    .maybeSingle()
  if (e1) throw e1
  if (bySku) return bySku

  // 2) Descripción aproximada (toma el primero)
  const { data: byDesc, error: e2 } = await supabase
    .from('repuestos')
    .select('id, sku, descripcion, stock, minimo')
    .ilike('descripcion', `%${term}%`)
    .limit(1)
  if (e2) throw e2
  return byDesc?.[0] || null
}

/**
 * Ajusta stock y registra un movimiento (positivo=entrada, negativo=salida).
 * Garantiza no bajar de 0 en stock.
 */
export async function adjustStockAndLog(repuestoId, delta, motivo, referencia = null) {
  // Lee stock actual
  const { data: cur, error: e1 } = await supabase
    .from('repuestos')
    .select('stock')
    .eq('id', repuestoId)
    .single()
  if (e1) throw e1

  const next = Math.max(0, Number(cur?.stock || 0) + Number(delta || 0))

  // 1) Actualiza stock
  const { error: e2 } = await supabase
    .from('repuestos')
    .update({ stock: next })
    .eq('id', repuestoId)
  if (e2) throw e2

  // 2) Inserta movimiento
  const { error: e3 } = await supabase
    .from('repuesto_movimientos')
    .insert([{
      repuesto_id: repuestoId,
      cantidad: Number(delta),
      motivo: motivo || null,
      referencia: referencia || null
    }])
  if (e3) throw e3

  return next
}
