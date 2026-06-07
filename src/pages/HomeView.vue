<template>
  <div/>
</template>

<script lang="ts" setup>
import {onMounted} from 'vue';
import router from '@/router';
import {hasValidStoredSession} from '@/stores/auth-store.ts';
import {getDefaultAuthorizedRouteName} from '@/composables/use-plan-resources.ts';

onMounted(() => {
  const destination = hasValidStoredSession() ? getDefaultAuthorizedRouteName() : 'Login';
  router.replace({name: destination});
});
</script>
