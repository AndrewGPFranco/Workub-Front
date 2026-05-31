<template>
  <div/>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue';
import router from '@/router';

onMounted(() => {
  const destination = localStorage.getItem('token') ? 'Demands' : 'Login';
  router.replace({name: destination});
});
</script>
