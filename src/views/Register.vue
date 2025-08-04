<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6">Registro de Usuario</h2>

      <form @submit.prevent="registrar" class="space-y-4">
        <input
          v-model="nombre"
          type="text"
          placeholder="Nombre completo"
          class="w-full border px-3 py-2 rounded-lg"
          required
        />
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
        <select v-model="rol" class="w-full border px-3 py-2 rounded-lg" required>
          <option value="">Seleccione un rol</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Operador">Operador</option>
        </select>

        <button
          type="submit"
          class="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
        >
          Registrarse
        </button>
      </form>

      <p v-if="mensaje" :class="mensajeColor" class="mt-4 text-center font-semibold">{{ mensaje }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const nombre = ref('')
const email = ref('')
const password = ref('')
const rol = ref('')
const mensaje = ref('')
const mensajeColor = ref('')

const registrar = async () => {
  mensaje.value = ''

  // ✅ Verificar si el correo ya existe en tabla users
  const { data: existe } = await supabase.from('users').select('email').eq('email', email.value).maybeSingle()
  if (existe) {
    mensaje.value = 'El correo ya está registrado'
    mensajeColor.value = 'text-red-500'
    return
  }

  // ✅ Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if (error) {
    mensaje.value = `Error: ${error.message}`
    mensajeColor.value = 'text-red-500'
    return
  }

  // ✅ Insertar datos en la tabla users
  const { error: errorInsert } = await supabase.from('users').insert([
    {
      id: data.user.id,
      nombre: nombre.value,
      rol: rol.value,
      estado: true
    }
  ])

  if (errorInsert) {
    mensaje.value = 'Error al guardar en la base de datos'
    mensajeColor.value = 'text-red-500'
    return
  }

  mensaje.value = 'Usuario registrado con éxito'
  mensajeColor.value = 'text-green-600'

  setTimeout(() => router.push('/login'), 2000)
}
</script>
