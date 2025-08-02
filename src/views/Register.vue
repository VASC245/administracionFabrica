<template>
  <div class="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">
    <h2 class="text-2xl font-bold text-center mb-6">Registro</h2>
    <form @submit.prevent="registerUser" class="space-y-4">
      <!-- Código de acceso -->
      <div>
        <label class="block mb-1 font-semibold">Código de Registro</label>
        <input
          v-model="codigo"
          type="text"
          class="w-full border rounded px-3 py-2"
          placeholder="Ingrese el código"
          required
        />
      </div>

      <div v-if="codigoValido">
        <!-- Correo -->
        <div>
          <label class="block mb-1 font-semibold">Correo</label>
          <input
            v-model="email"
            type="email"
            class="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <!-- Contraseña -->
        <div>
          <label class="block mb-1 font-semibold">Contraseña</label>
          <input
            v-model="password"
            type="password"
            class="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <!-- Nombre -->
        <div>
          <label class="block mb-1 font-semibold">Nombre</label>
          <input
            v-model="nombre"
            type="text"
            class="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <!-- Seleccionar Rol -->
        <div>
          <label class="block mb-1 font-semibold">Rol</label>
          <select
            v-model="rol"
            class="w-full border rounded px-3 py-2"
            required
          >
            <option value="Super Admin">Super Admin</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Operador">Operador</option>
          </select>
        </div>

        <button class="bg-green-600 text-white w-full py-2 rounded-lg hover:bg-green-700">
          Registrar
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const nombre = ref('');
const rol = ref('');
const codigo = ref('');
const codigoValido = ref(false);
const router = useRouter();

const CODIGO_SECRETO = 'FABRICA2025';

const registerUser = async () => {
  if (!codigoValido.value) {
    if (codigo.value === CODIGO_SECRETO) {
      codigoValido.value = true;
    } else {
      alert('Código incorrecto');
    }
    return;
  }

  // Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  });

  if (error) {
    alert('Error: ' + error.message);
    return;
  }

  // Insertar datos en la tabla users
  await supabase.from('users').insert([
    {
      id: data.user.id,
      nombre: nombre.value,
      rol: rol.value,
      estado: true
    }
  ]);

  alert('Registro exitoso');
  router.push('/login');
};
</script>
