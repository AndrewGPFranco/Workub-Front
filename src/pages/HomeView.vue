<template>
  <RouterLink :to="{name: 'Login'}">Entrar</RouterLink>
  <RouterLink :to="{name: 'User Register'}">Registrar</RouterLink>

  <Button @click="logout" label="Deslogar"/>
</template>

<script lang="ts" setup>
import router from "@/router";
import Button from 'primevue/button';
import {useAuthStore} from "@/stores/auth-store.ts";

const authStore = useAuthStore();

const logout = async () => {
  authStore.logout();

  await router.push({name: 'Login'});
}
</script>
