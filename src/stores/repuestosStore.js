// src/stores/repuestosStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useRepuestos = defineStore('repuestos', () => {
  // Busca repuesto por SKU o por nombre (case-insensitive)
  async function findOneBySkuOrName(codeOrName) {
    const sku = String(codeOrName).trim()
    // 1) intenta por SKU exacto
    let { data } = await supabase
      .from('inventario_repuestos')
      .select('id, sku, descripcion, stock, minimo')
      .eq('sku', sku)
      .maybeSingle()
    if (data) return data
    // 2) por nombre (ilike)
    const res = await supabase
      .from('inventario_repuestos')
      .select('id, sku, descripcion, stock, minimo')
      .ilike('descripcion', `%${sku}%`)
      .limit(1)
    return res.data?.[0] ?? null
  }

  async function listActive() {
    const { data, error } = await supabase
      .from('inventario_repuestos')
      .select('id, sku, descripcion, stock, minimo')
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }

  // CRUD básico (si lo necesitas desde componentes)
  async function create(payload) {
    return await supabase.from('inventario_repuestos').insert(payload).select()
  }
  async function update(id, payload) {
    return await supabase.from('inventario_repuestos').update(payload).eq('id', id).select()
  }
  async function remove(id) {
    return await supabase.from('inventario_repuestos').delete().eq('id', id).select()
  }

  return { findOneBySkuOrName, listActive, create, update, remove }
})

// Alias de compatibilidad
export { useRepuestos as useRepuestosStore }
