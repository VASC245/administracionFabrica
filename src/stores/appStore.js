import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAppStore = defineStore('app', {
  state: () => ({
    aserrin: [],
    viajes: [],
    viajesDetalle: [],
    horno: [],
    asistencia: [],
    loading: false
  }),
  actions: {
    async loadAll() {
      this.loading = true
      try {
        const { data: aserrin } = await supabase.from('aserrin_ingresos').select('*').order('fecha')
        const { data: viajes } = await supabase.from('viajes_despacho').select('*').order('fecha')
        const { data: detalle } = await supabase.from('viajes_detalle').select('*')
        const { data: horno } = await supabase.from('horno_registros').select('*').order('fecha')
        const { data: asistencia } = await supabase.from('asistencia').select('*').order('fecha')

        this.aserrin = aserrin || []
        this.viajes = viajes || []
        this.viajesDetalle = detalle || []
        this.horno = horno || []
        this.asistencia = asistencia || []
      } finally {
        this.loading = false
      }
    },
    async addAserrin(record) {
      await supabase.from('aserrin_ingresos').insert([record])
      await this.loadAll()
    },
    async addHorno(record) {
      await supabase.from('horno_registros').insert([record])
      await this.loadAll()
    },
    async addViaje(record) {
      await supabase.from('viajes_despacho').insert([record])
      await this.loadAll()
    },
    async addDetalle(record) {
      await supabase.from('viajes_detalle').insert([record])
      await this.loadAll()
    },
    async addAsistencia(record) {
      await supabase.from('asistencia').insert([record])
      await this.loadAll()
    }
  }
})
