// src/stores/maquinasStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useMaquinasActive = defineStore('maquinasActive', () => {
  const items = ref([])      // [{id, nombre, activo, codigo}]
  const loading = ref(false)
  let channel = null

  async function listActive() {
    loading.value = true
    const { data, error } = await supabase
      .from('maquinas')
      .select('id, nombre, activo, codigo')
      .eq('activo', true)
      .order('nombre', { ascending: true })
    if (!error) items.value = data || []
    loading.value = false
    return { data, error }
  }

  function subscribe() {
    if (channel) return
    channel = supabase
      .channel('maquinas-active-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maquinas' },
        async () => { await listActive() })
      .subscribe()
  }

  function unsubscribe() {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  return { items, loading, listActive, subscribe, unsubscribe }
})

// Alias de compatibilidad para componentes que importan useMaquinasStore
export { useMaquinasActive as useMaquinasStore }
