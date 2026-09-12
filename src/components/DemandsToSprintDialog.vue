<template>
  <Dialog v-model:visible="visible" modal :header="t('demands.moveToSprint')"
          :closable="!isSaving" :close-on-escape="!isSaving"
          :style="{width: '34rem', maxWidth: 'calc(100vw - 2rem)'}">
    <form class="move-sprint-form" @submit.prevent="save">
      <p>{{ t('demands.sprintSubdomain') }}:
        <strong>{{ subdomainStore.selectedSubdomain?.name ?? t('demands.noSubdomain') }}</strong></p>
      <label for="destination-sprint">{{ t('demands.destinationSprint') }}</label>
      <Select input-id="destination-sprint" v-model="sprintTitle" :options="sprints" filter
              :placeholder="t('demands.selectSprint')" :empty-message="t('demands.noSprints')"
              :loading="isLoading" :disabled="isLoading || isSaving" fluid/>
      <label for="sprint-demands">{{ t('demands.demandsToMove') }}</label>
      <MultiSelect input-id="sprint-demands" v-model="idDemands" :options="availableDemands"
                   option-label="title" option-value="id" filter display="chip"
                   :placeholder="t('demands.selectDemands')" :disabled="isSaving"
                   :loading="loadingDemands" :pt="{listContainer: {onScroll: onDemandsScroll}}"
                   aria-describedby="move-sprint-hint" fluid>
        <template #footer>
          <div v-if="hasMore || loadingDemands" class="load-more-demands">
            <Button type="button" :label="t('demands.loadMore')" text fluid
                    :loading="loadingDemands" :disabled="loadingDemands || isSaving"
                    @click="requestMore"/>
          </div>
        </template>
      </MultiSelect>
      <small id="move-sprint-hint">{{ t('demands.moveSprintHint') }}</small>
      <div class="move-sprint-actions">
        <Button type="button" :label="t('demands.cancel')" severity="secondary" outlined
                :disabled="isSaving" @click="visible = false"/>
        <Button type="submit" :label="t('demands.moveSprintConfirm')" :loading="isSaving"
                :disabled="!canSave"/>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import {useToast} from 'primevue/usetoast';
import {useSprintStore} from '@/stores/sprint-store.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import type {Demand} from '@/types/demands/Demand.ts';
import {useLanguage} from '@/composables/use-language.ts';
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';

const props = defineProps<{ demands: Demand[]; hasMore: boolean; loadingDemands: boolean }>();
const emit = defineEmits<{ saved: []; 'load-more': [] }>();
const requestMore = () => {
  if (props.hasMore && !props.loadingDemands && !isSaving.value) emit('load-more');
};
const onDemandsScroll = (event: Event) => {
  const list = event.currentTarget as HTMLElement;
  if (list.scrollHeight - list.scrollTop - list.clientHeight <= 80) requestMore();
};
const visible = defineModel<boolean>('visible', {default: false});
const sprintStore = useSprintStore();
const subdomainStore = useSubdomainStore();
const toast = useToast();
const {t} = useLanguage();
const sprintTitle = ref('');
const idDemands = ref<string[]>([]);
const sprints = ref<string[]>([]);
const isLoading = ref(false);
const isSaving = ref(false);
const dialogSubdomainId = ref<string | null>(null);
const availableDemands = computed(() => props.demands.filter(demand =>
    !dialogSubdomainId.value || !demand.subdomainId || demand.subdomainId === dialogSubdomainId.value));
const canSave = computed(() => !isSaving.value && !isLoading.value
    && dialogSubdomainId.value === subdomainStore.selectedSubdomainId
    && sprints.value.includes(sprintTitle.value) && idDemands.value.length > 0
    && idDemands.value.every(id => availableDemands.value.some(demand => demand.id === id)));

watch(visible, async (value, _, onCleanup) => {
  if (!value) return;
  let stale = false;
  onCleanup(() => {
    stale = true;
  });
  dialogSubdomainId.value = subdomainStore.selectedSubdomainId;
  sprintTitle.value = '';
  idDemands.value = [];
  sprints.value = [];
  isLoading.value = true;
  try {
    const result = await sprintStore.fetchSprints(dialogSubdomainId.value);
    if (stale) return;
    if (result.isError) {
      showErrorToast(toast, t('demands.sprintLoadError'));
      return;
    }
    sprints.value = Array.isArray(result.response) ? result.response : [];
  } finally {
    if (!stale) isLoading.value = false;
  }
});

watch(() => subdomainStore.selectedSubdomainId, () => {
  visible.value = false;
});

const save = async () => {
  if (!canSave.value) return;
  isSaving.value = true;
  try {
    const result = await sprintStore.addDemandsToSprint({
      idSubdomain: dialogSubdomainId.value,
      sprintTitle: sprintTitle.value,
      idDemands: [...idDemands.value],
    });
    if (result.isError) {
      showErrorToast(toast, result.response || t('demands.moveSprintError'));
      return;
    }
    visible.value = false;
    showSuccessToast(toast, result.response || t('demands.moveSprintSuccess'));
    emit('saved');
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.load-more-demands {
  padding: 0.5rem;
  border-top: 1px solid var(--p-content-border-color);
}

.move-sprint-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.move-sprint-form p {
  margin: 0 0 0.5rem;
}

.move-sprint-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>
