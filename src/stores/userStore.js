import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useUserStore = defineStore('user', {
  state: () => ({
    session: null,
    profile: null,
    isLoaded: false
  }),
  actions: {
    async loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      if (session) {
        const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single()
        this.profile = data
      }
      this.isLoaded = true
    },
    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) await this.loadUser()
      return { data, error }
    },
    async logout() {
      await supabase.auth.signOut()
      this.session = null
      this.profile = null
      window.location.href = '/login'
    }
  }
})
