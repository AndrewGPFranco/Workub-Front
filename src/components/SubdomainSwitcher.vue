<template>
  <div class="subdomain-switcher">
    <Select
        v-model="selectedSubdomainKey"
        :options="subdomainOptions"
        option-label="label"
        option-value="value"
        :placeholder="t('subdomain.selectPlaceholder')"
        :loading="subdomainStore.isLoading"
        :disabled="subdomainStore.isLoading || subdomainOptions.length === 0"
        :aria-label="t('subdomain.select')"
        class="subdomain-select"
    >
      <template #value="{value, placeholder}">
        <div v-if="selectedOption(value)" class="subdomain-option compact">
          <img v-if="selectedOption(value)?.urlPhoto" :src="selectedOption(value)?.urlPhoto ?? undefined" alt="">
          <span v-else><i class="pi pi-sitemap"/></span>
          <strong>{{ selectedOption(value)?.label }}</strong>
        </div>
        <span v-else>{{ placeholder }}</span>
      </template>

      <template #option="{option}">
        <div class="subdomain-option">
          <img v-if="option.urlPhoto" :src="option.urlPhoto" alt="">
          <span v-else><i class="pi pi-sitemap"/></span>
          <strong>{{ option.label }}</strong>
        </div>
      </template>
    </Select>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue';
import Select from 'primevue/select';
import {useLanguage} from '@/composables/use-language.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import type {Subdomain} from '@/types/subdomain/Subdomain.ts';

interface SubdomainOption {
  value: string;
  label: string;
  urlPhoto: string | null;
}

const {t} = useLanguage();
const subdomainStore = useSubdomainStore();

const subdomainKey = (subdomain: Subdomain) => subdomain.id ?? subdomain.name;
const subdomainOptions = computed<SubdomainOption[]>(() =>
    subdomainStore.subdomains.map((subdomain) => ({
      value: subdomainKey(subdomain),
      label: subdomain.name,
      urlPhoto: subdomain.urlPhoto ?? null,
    })),
);
const selectedSubdomainKey = computed({
  get: () => subdomainStore.selectedSubdomainKey,
  set: (value: string | null) => subdomainStore.selectSubdomain(value),
});

const selectedOption = (value: string | null | undefined) =>
    subdomainOptions.value.find((option) => option.value === value) ?? null;

onMounted(() => {
  subdomainStore.fetchSubdomains();
});
</script>

<style scoped>
.subdomain-switcher {
  min-width: 150px;
}

.subdomain-select {
  width: 100%;
}

.subdomain-switcher :deep(.p-select) {
  border-color: rgba(33, 59, 49, 0.12);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.72);
}

.subdomain-switcher :deep(.p-select-label) {
  padding-block: 8px;
}

.subdomain-option {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.subdomain-option img, .subdomain-option span {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border-radius: 8px;
}

.subdomain-option img {
  object-fit: cover;
}

.subdomain-option span {
  display: grid;
  place-items: center;
  color: #377b67;
  background: #f1f4ef;
  font-size: 0.75rem;
}

.subdomain-option strong {
  overflow: hidden;
  color: #26332f;
  font-size: 0.76rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subdomain-option.compact strong {
  max-width: 104px;
}

:global(.app-dark) .subdomain-switcher :deep(.p-select) {
  border-color: rgba(214, 220, 244, 0.14);
  background: rgba(16, 21, 34, 0.78);
}

:global(.app-dark) .subdomain-option span {
  color: #70c6ac;
  background: #101522;
}

:global(.app-dark) .subdomain-option strong {
  color: #e8efec;
}

@media (max-width: 700px) {
  .subdomain-switcher {
    min-width: 46px;
    width: 46px;
  }

  .subdomain-switcher :deep(.p-select-label) {
    padding-inline: 8px;
  }

  .subdomain-option.compact strong {
    display: none;
  }
}
</style>
