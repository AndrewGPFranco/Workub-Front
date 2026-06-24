<template>
  <label class="language-select">
    <i class="pi pi-globe"/>
    <span class="sr-only">{{ t('language.label') }}</span>
    <select v-model="language" :aria-label="t('language.label')" @change="setLanguage(language)">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useLanguage, type Language} from '@/composables/use-language.ts';

const {language, setLanguage, t} = useLanguage();
const options = computed<{ value: Language; label: string }[]>(() => [
  {value: 'pt-BR', label: t('language.pt-BR')},
  {value: 'en', label: t('language.en')},
]);
</script>

<style scoped>
.language-select {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: inherit;
}

.language-select select {
  max-width: 128px;
  border: 0;
  outline: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
}

.language-select option {
  color: #26332f;
  background: #ffffff;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

:global(.app-dark) .language-select option {
  color: #f7f5ef;
  background: #171b2b;
}
</style>
