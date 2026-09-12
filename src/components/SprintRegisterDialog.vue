<template>
  <Dialog v-model:visible="visible" modal :header="t('demands.registerSprint')"
          :closable="!isSaving" :close-on-escape="!isSaving"
          :style="{width: '28rem', maxWidth: 'calc(100vw - 2rem)'}">
    <form class="sprint-form" @submit.prevent="saveSprint">
      <p>{{ t('demands.sprintSubdomain') }}:
        <strong>{{ subdomainStore.selectedSubdomain?.name ?? t('demands.noSubdomain') }}</strong></p>
      <label for="sprint-title">{{ t('demands.sprintTitle') }}</label>
      <InputText id="sprint-title" v-model="title" required autofocus :disabled="isSaving" fluid/>
      <label for="sprint-date">{{ t('demands.sprintDateToUse') }}</label>
      <InputText id="sprint-date" v-model="dateToUse" type="date" required :disabled="isSaving" fluid/>
      <div class="sprint-actions">
        <Button type="button" :label="t('demands.cancel')" severity="secondary" outlined
                :disabled="isSaving" @click="visible = false"/>
        <Button type="submit" :label="t('demands.registerSprint')" :loading="isSaving"
                :disabled="isSaving || !title.trim() || !dateToUse"/>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import {useToast} from 'primevue/usetoast';
import {useSprintStore} from '@/stores/sprint-store.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import {useLanguage} from '@/composables/use-language.ts';
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';

const visible = defineModel<boolean>('visible', {default: false});
const title = ref('');
const dateToUse = ref('');
const isSaving = ref(false);
const sprintStore = useSprintStore();
const subdomainStore = useSubdomainStore();
const toast = useToast();
const {t} = useLanguage();

watch(visible, (value) => {
  if (value) {
    title.value = '';
    dateToUse.value = '';
  }
});

const saveSprint = async () => {
  if (isSaving.value) return;
  const idSubdomain = subdomainStore.selectedSubdomainId;
  if (!title.value.trim() || !dateToUse.value) {
    showErrorToast(toast, t('demands.sprintFieldsRequired'));
    return;
  }

  isSaving.value = true;
  try {
    const result = await sprintStore.registerSprint({
      title: title.value.trim(),
      idSubdomain,
      dateToUse: dateToUse.value
    });
    if (result.isError) {
      showErrorToast(toast, result.response || t('demands.sprintRegisterError'));
      return;
    }
    visible.value = false;
    showSuccessToast(toast, result.response || t('demands.sprintRegisterSuccess'));
    const refreshed = await sprintStore.fetchSprints();
    if (refreshed.isError)
      showErrorToast(toast, t('demands.sprintLoadError'));
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.sprint-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sprint-form p {
  margin: 0 0 0.5rem;
}

.sprint-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>
