// src/stores/appStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

// ---------- utils ----------
function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0 }
function sortItems(items, { column, ascending }) {
  if (!column) return
  items.sort((x, y) => {
    const r = cmp(x?.[column] ?? null, y?.[column] ?? null)
    return ascending ? r : -r
  })
}

// ---------- CRUD Factory con Realtime ----------
function createCrudStore({ table, idCol = 'id', defaultOrder = { column: 'created_at', ascending: false } }) {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  let channel = null

  async function list({ select='*', match={}, order=defaultOrder, limit=null } = {}) {
    loading.value = true; error.value = null
    let q = supabase.from(table).select(select)
    Object.entries(match).forEach(([k, v]) => { if (v !== undefined && v !== null) q = q.eq(k, v) })
    if (order?.column) q = q.order(order.column, { ascending: !!order.ascending })
    if (limit) q = q.limit(limit)
    const { data, error:err } = await q
    if (err) { error.value = err; items.value = []; loading.value = false; return [] }
    items.value = data || []
    loading.value = false
    return items.value
  }

  async function insert(payload) {
    const { data, error:err } = await supabase.from(table).insert(payload).select().single()
    if (err) throw err
    // optimistic: si realtime llega duplicado, el handler lo reemplaza
    const i = items.value.findIndex(r => r[idCol] === data[idCol])
    if (i >= 0) items.value[i] = data
    else items.value.unshift(data)
    sortItems(items.value, defaultOrder)
    return data
  }

  async function update(id, payload) {
    const { data, error:err } = await supabase.from(table).update(payload).eq(idCol, id).select().single()
    if (err) throw err
    const i = items.value.findIndex(x => x[idCol] === id)
    if (i >= 0) items.value[i] = data
    else items.value.unshift(data)
    sortItems(items.value, defaultOrder)
    return data
  }

  async function remove(id) {
    const prev = items.value.slice()
    const { error:err } = await supabase.from(table).delete().eq(idCol, id)
    if (err) { items.value = prev; throw err }
    items.value = items.value.filter(x => x[idCol] !== id)
    return true
  }

  function handleRealtime(payload) {
    const { eventType, new: rowNew, old: rowOld } = payload
    if (eventType === 'INSERT') {
      const i = items.value.findIndex(r => r[idCol] === rowNew[idCol])
      if (i >= 0) items.value[i] = rowNew
      else items.value.unshift(rowNew)
      sortItems(items.value, defaultOrder)
    } else if (eventType === 'UPDATE') {
      const i = items.value.findIndex(r => r[idCol] === rowNew[idCol])
      if (i >= 0) items.value[i] = rowNew
      else items.value.unshift(rowNew)
      sortItems(items.value, defaultOrder)
    } else if (eventType === 'DELETE') {
      items.value = items.value.filter(r => r[idCol] !== rowOld[idCol])
    }
  }

  function subscribe({ schema='public', filter } = {}) {
    // evita canales duplicados
    if (channel) return channel
    const config = { schema, table }
    if (filter) Object.assign(config, filter)
    channel = supabase
      .channel(`realtime:${schema}:${table}`)
      .on('postgres_changes', { event: '*', schema, table }, handleRealtime)
      .subscribe()
    return channel
  }

  function unsubscribe() {
    if (!channel) return
    supabase.removeChannel(channel)
    channel = null
  }

  return { table, items, loading, error, list, insert, update, remove, subscribe, unsubscribe }
}

// ========== STORES ESPECÍFICOS ==========

// Máquinas
export const useMaquinas = defineStore('maquinas', () => {
  const base = createCrudStore({ table: 'maquinas', defaultOrder: { column: 'nombre', ascending: true } })
  return base
})

// Planes (con createPlan personalizado + realtime)
export const usePlanes = defineStore('planes', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)
  let channel = null

  async function list() {
    loading.value = true; error.value = null
    const { data, error:err } = await supabase
      .from('planes_produccion')
      .select('*')
      .order('fecha', { ascending: false })
    if (err) { error.value = err; items.value = []; loading.value = false; return [] }
    items.value = data || []; loading.value = false; return items.value
  }

  async function createPlan(form) {
    const { data:plan, error:e1 } = await supabase
      .from('planes_produccion')
      .insert({
        fecha: form.fecha,
        turno: form.turno,
        meta_ton: form.meta_ton,
        observaciones: form.observaciones || null,
        file_url: null
      })
      .select()
      .single()
    if (e1) throw e1

    if (Array.isArray(form.maquinas) && form.maquinas.length) {
      let ids = form.maquinas
      if (typeof ids[0] === 'string') {
        const { data:mm, error:e2 } = await supabase.from('maquinas').select('id,nombre').in('nombre', ids)
        if (e2) throw e2
        ids = (mm || []).map(m => m.id)
      }
      if (ids.length) {
        const rows = ids.map(mid => ({ plan_id: plan.id, maquina_id: mid }))
        const { error:e3 } = await supabase.from('plan_maquinas').insert(rows)
        if (e3) throw e3
      }
    }

    // optimistic
    items.value.unshift(plan)
    items.value.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    return plan
  }

  async function updatePlan(id, payload) {
    const { data, error:e } = await supabase.from('planes_produccion').update(payload).eq('id', id).select().single()
    if (e) throw e
    const i = items.value.findIndex(x => x.id === id)
    if (i >= 0) items.value[i] = data
    else items.value.unshift(data)
    items.value.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    return data
  }

  async function deletePlan(id) {
    const prev = items.value.slice()
    const { error:e } = await supabase.from('planes_produccion').delete().eq('id', id)
    if (e) { items.value = prev; throw e }
    items.value = items.value.filter(x => x.id !== id)
    return true
  }

  // Realtime para planes (y opcional para plan_maquinas si quieres rehidratar)
  function handleRealtime(payload) {
    const { eventType, new: rowNew, old: rowOld } = payload
    if (eventType === 'INSERT') {
      const i = items.value.findIndex(r => r.id === rowNew.id)
      if (i >= 0) items.value[i] = rowNew
      else items.value.unshift(rowNew)
      items.value.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    } else if (eventType === 'UPDATE') {
      const i = items.value.findIndex(r => r.id === rowNew.id)
      if (i >= 0) items.value[i] = rowNew
      else items.value.unshift(rowNew)
      items.value.sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    } else if (eventType === 'DELETE') {
      items.value = items.value.filter(r => r.id !== rowOld.id)
    }
  }

  function subscribe() {
    if (channel) return channel
    channel = supabase
      .channel('realtime:public:planes_produccion')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'planes_produccion' }, handleRealtime)
      .subscribe()
    return channel
  }
  function unsubscribe() {
    if (!channel) return
    supabase.removeChannel(channel)
    channel = null
  }

  return { items, loading, error, list, createPlan, updatePlan, deletePlan, subscribe, unsubscribe }
})

// Producción (real)
export const useProduccion = defineStore('produccion', () => {
  const base = createCrudStore({ table: 'produccion_real', defaultOrder: { column: 'fecha', ascending: false } })
  return base
})

// Horas por Máquina
export const useHoras = defineStore('horas', () => {
  const base = createCrudStore({ table: 'horas_maquina', defaultOrder: { column: 'fecha', ascending: false } })
  return base
})

// Mantenimiento
export const useMantenimiento = defineStore('mantenimiento', () => {
  const base = createCrudStore({ table: 'mantenimiento', defaultOrder: { column: 'fecha', ascending: false } })
  return base
})

// Paradas Técnicas
export const useParadas = defineStore('paradas', () => {
  const base = createCrudStore({ table: 'paradas_tecnicas', defaultOrder: { column: 'inicio', ascending: false } })
  return base
})

// Repuestos
export const useRepuestos = defineStore('repuestos', () => {
  const base = createCrudStore({ table: 'repuestos', defaultOrder: { column: 'created_at', ascending: false } })
  return base
})

// Calidad de Pellet
export const useCalidad = defineStore('calidad', () => {
  const base = createCrudStore({ table: 'calidad_pellet', defaultOrder: { column: 'fecha', ascending: false } })
  return base
})
