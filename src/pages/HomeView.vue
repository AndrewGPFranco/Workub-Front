<template>
  <div/>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue';
import router from '@/router';
import {hasValidStoredSession} from '@/stores/auth-store.ts';

onMounted(() => {
  const destination = hasValidStoredSession() ? 'Demands' : 'Login';
  router.replace({name: destination});
});
</script>
