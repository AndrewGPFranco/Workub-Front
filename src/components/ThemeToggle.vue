<template>
  <Button
      :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
      text
      rounded
      :aria-label="isDark ? t('theme.light') : t('theme.dark')"
      :title="isDark ? t('theme.light') : t('theme.dark')"
      @click="toggleTheme"
      class="theme-toggle"
  />
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import {useTheme} from '@/composables/use-theme.ts';
import {useLanguage} from '@/composables/use-language.ts';

const {isDark, toggleTheme} = useTheme();
const {t} = useLanguage();
</script>

<style scoped>
.theme-toggle {
  width: 42px;
  height: 42px;
  color: var(--wh-text-soft);
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.theme-toggle:hover {
  color: var(--wh-primary);
  background: var(--wh-primary-soft);
}

.theme-toggle:active {
  transform: scale(0.94);
}
</style>
