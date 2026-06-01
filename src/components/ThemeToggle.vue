<template>
  <Button
      :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
      text
      rounded
      :aria-label="isDark ? t('theme.light') : t('theme.dark')"
      :title="isDark ? t('theme.light') : t('theme.dark')"
      @click="toggleTheme"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import {useTheme} from '@/composables/use-theme.ts';
import {useLanguage} from '@/composables/use-language.ts';

const {isDark, toggleTheme} = useTheme();
const {t} = useLanguage();
</script>
