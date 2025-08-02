<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>

      <!-- FORMULARIO LOGIN -->
      <form @submit.prevent="login" class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Correo electrónico"
          class="w-full border px-3 py-2 rounded-lg"
          required
        />
        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="w-full border px-3 py-2 rounded-lg"
          required
        />
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
        >
          Iniciar Sesión
        </button>
      </form>

      <!-- MENSAJES -->
      <p v-if="mensaje" :class="mensajeColor" class="mt-4 text-center font-semibold">{{ mensaje }}</p>

      <!-- BOTÓN PARA REGISTRARSE -->
      <div class="mt-6 text-center">
        <button
          @click="mostrarModal = true"
          class="text-blue-600 hover:underline text-sm"
        >
          ¿No tienes cuenta? Registrarse
        </button>
      </div>

      <!-- MODAL PARA INGRESAR CÓDIGO -->
      <div
        v-if="mostrarModal"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center">
          <h3 class="text-lg font-bold mb-4">Código de acceso</h3>
          <input
            v-model="codigoPin"
            type="password"
            placeholder="Ingresa el código"
            class="w-full border px-3 py-2 rounded-lg mb-4"
          />
          <div class="flex gap-4">
            <button
              @click="verificarPin"
              class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Continuar
            </button>
            <button
              @click="cerrarModal"
              class="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
          <p v-if="errorPin" class="text-red-500 text-sm mt-2">{{ errorPin }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const mensaje = ref('')
const mensajeColor = ref('')
const mostrarModal = ref(false)
const codigoPin = ref('')
const errorPin = ref('')

const login = async () => {
  mensaje.value = ''
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    mensaje.value = `Error: ${error.message}`
    mensajeColor.value = 'text-red-500'
    return
  }

  mensaje.value = 'Inicio de sesión exitoso'
  mensajeColor.value = 'text-green-600'
  router.push('/dashboard')
}

// ✅ Verificar PIN fijo
const verificarPin = () => {
  if (codigoPin.value === 'FABRICA2025') {
    mostrarModal.value = false
    router.push('/register')
  } else {
    errorPin.value = 'Código incorrecto'
  }
}

// Cerrar modal
const cerrarModal = () => {
  mostrarModal.value = false
  codigoPin.value = ''
  errorPin.value = ''
}
</script>
