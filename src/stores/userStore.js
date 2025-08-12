// src/stores/userStore.js
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'
import {
  getUserProfile,
  loginUser,
  logoutUser,
  normalizeRole,
  persistSessionToLocal,
  clearLocalSession
} from '@/services/authService'

export const useUserStore = defineStore('user', {
  state: () => ({
    session: null,
    profile: null,
    isLoaded: false
  }),
  getters: {
    user:   (s) => s.session?.user || null,
    rol:    (s) => s.profile?.rol || null, // ya normalizado
    nombre: (s) => s.profile?.nombre || null
  },
  actions: {
    async loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session || null

      if (session?.user) {
        const prof = await getUserProfile(session.user.id)
        if (prof && prof.estado !== false) {
          const nrol = normalizeRole(prof.rol)
          this.profile = { ...prof, rol: nrol } // guarda normalizado
          persistSessionToLocal(session.user, nrol)
        } else {
          this.profile = null
        }
      } else {
        this.profile = null
      }
      this.isLoaded = true
    },

    async ensureLoaded() {
      if (!this.isLoaded) await this.loadUser()
    },

    async login(email, password) {
      const { data, error } = await loginUser(email, password)
      if (!error) await this.loadUser()
      return { data, error }
    },

    async logout() {
      await logoutUser()
      this.session = null
      this.profile = null
      clearLocalSession()
      window.location.href = '/login'
    }
  }
})
