<template>
  <RouterLink :to="{name: 'User Register', }">Registrar</RouterLink>

  <Button @click="logout" label="Deslogar"/>
</template>

<script lang="ts" setup>
import router from "@/router";
import Button from 'primevue/button';

const logout = async () => {
  localStorage.removeItem('token');

  await router.push({name: 'User Register'});
}
</script>