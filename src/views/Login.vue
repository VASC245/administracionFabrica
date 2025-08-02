<template>
  <div class="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">
    <h2 class="text-2xl font-bold text-center mb-6">Iniciar Sesión</h2>
    <form @submit.prevent="loginUser" class="space-y-4">
      <div>
        <label class="block mb-1 font-semibold">Correo</label>
        <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Contraseña</label>
        <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
      </div>
      <button class="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700">Entrar</button>
    </form>
    <p class="text-center mt-4">
      ¿No tienes cuenta?
      <router-link to="/register" class="text-blue-600 font-semibold">Regístrate</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const loginUser = async () => {
  const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value });
  if (error) {
    alert('Error: ' + error.message);
  } else {
    router.push('/dashboard');
  }
};
</script>
