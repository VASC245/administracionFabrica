// src/services/fundasService.js
import { supabase } from '@/lib/supabase'

/** Lista fundas; si q='', trae todas */
export async function searchFundas(q = '') {
  let query = supabase
    .from('fundas_plasticas')
    .select('id, descripcion, medida, stock, minimo')
    .order('descripcion', { ascending: true })

  if (q) query = query.ilike('descripcion', `%${q}%`)

  const { data, error } = await query
  if (error) {
    console.error('[searchFundas]', error)
    return []
  }
  return data || []
}

/**
 * Ajusta stock y escribe log.
 * Devuelve { ok: boolean, error: SupabaseError|null }
 * NO usa .single(); tolera 0 filas devueltas por RLS.
 */
export async function adjustFundasAndLog({
  funda_id,
  delta,
  tipo,                 // 'entrada' | 'rotura' | 'uso'
  precio_unitario = null,
  factura = null,
  proveedor = null,
  observacion = null
}) {
  try {
    // 0) Validaciones mínimas
    if (!funda_id || !Number.isFinite(Number(delta))) {
      return { ok: false, error: { message: 'Parámetros inválidos (funda_id/delta)' } }
    }

    // 1) Leer stock actual (tolerante a RLS)
    let current = 0
    {
      const { data, error } = await supabase
        .from('fundas_plasticas')
        .select('stock')
        .eq('id', funda_id)
        .limit(1)
      if (error && error.code !== 'PGRST116') {
        console.error('[fundas_plasticas SELECT]', error)
        return { ok: false, error }
      }
      if (Array.isArray(data) && data.length) current = Number(data[0].stock || 0)
    }

    const newStock = current + Number(delta)

    // 2) Actualizar stock
    {
      const { error } = await supabase
        .from('fundas_plasticas')
        .update({ stock: newStock })
        .eq('id', funda_id)
        .select() // puede devolver array vacío por RLS; no pasa nada
      if (error && error.code !== 'PGRST116') {
        console.error('[fundas_plasticas UPDATE]', error)
        return { ok: false, error }
      }
    }

    // 3) Insertar en log (solo columnas presentes)
    const payload = {
      funda_id,
      fecha: new Date().toISOString(),
      tipo,
      cantidad: Math.abs(Number(delta)),
      observacion: observacion || null
    }
    if (precio_unitario != null) payload.precio_unitario = Number(precio_unitario)
    if (factura) payload.factura = String(factura)
    if (proveedor) payload.proveedor = String(proveedor)

    {
      const { error } = await supabase
        .from('fundas_log')
        .insert([payload])
        .select() // array o 0 filas
      if (error && error.code !== 'PGRST116') {
        console.error('[fundas_log INSERT]', error)
        // Si el log falla por columnas/políticas, avisamos pero conservamos el update de stock
        return { ok: false, error }
      }
    }

    return { ok: true, error: null }
  } catch (e) {
    console.error('[adjustFundasAndLog EXCEPTION]', e)
    return { ok: false, error: { message: e?.message || 'Error inesperado' } }
  }
}
