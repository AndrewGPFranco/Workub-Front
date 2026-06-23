<template>
  <div class="demand-create-page">
    <AppSidebar/>

    <main class="workspace create-workspace">
      <RouterLink :to="{name: 'Demands'}" class="back-link">
        <i class="pi pi-arrow-left"/>{{ t('demands.backToBoard') }}
      </RouterLink>

      <div class="create-layout">
        <section class="create-intro">
          <p class="kicker">{{ t('demands.newKicker') }}</p>
          <h1>{{ t('demands.createHeading') }}</h1>
          <p>{{ t('demands.createDescription') }}</p>
          <ul>
            <li><i class="pi pi-check-circle"/>{{ t('demands.createHintContext') }}</li>
            <li><i class="pi pi-check-circle"/>{{ t('demands.createHintPriority') }}</li>
            <li><i class="pi pi-check-circle"/>{{ t('demands.createHintDeadline') }}</li>
          </ul>
        </section>

        <section class="create-card">
          <header>
            <div>
              <p class="kicker">{{ t('demands.newKicker') }}</p>
              <h2>{{ t('demands.new') }}</h2>
            </div>
            <span class="status-preview">{{ statusLabel }}</span>
          </header>

          <form class="create-form" @submit.prevent="saveDemand">
            <label>
              <span>{{ t('demands.title') }}</span>
              <InputText v-model="form.title" :placeholder="t('demands.titlePlaceholder')" required fluid autofocus/>
            </label>

            <label>
              <span>{{ t('demands.description') }}</span>
              <Textarea v-model="form.description" :placeholder="t('demands.descriptionPlaceholder')" rows="6" required fluid/>
            </label>

            <label>
              <span>{{ t('demands.reviewNote') }} <small>{{ t('demands.optional') }}</small></span>
              <Textarea v-model="form.observationToReview" :placeholder="t('demands.reviewNotePlaceholder')" rows="3" fluid/>
            </label>

            <div class="form-row">
              <label>
                <span>{{ t('demands.status') }}</span>
                <Select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" fluid/>
              </label>
              <label>
                <span>{{ t('demands.priority') }}</span>
                <Select v-model="form.priority" :options="priorityOptions" option-label="label" option-value="value" fluid/>
              </label>
            </div>

            <label>
              <span>{{ t('demands.deadline') }} <small>{{ t('demands.optional') }}</small></span>
              <InputText v-model="form.deadline" type="date" fluid/>
            </label>

            <fieldset>
              <legend>{{ t('demands.observations') }} <small>{{ t('demands.optional') }}</small></legend>
              <div v-for="(_, index) in form.observations" :key="index" class="observation-row">
                <Textarea v-model="form.observations[index]" :placeholder="t('demands.observationPlaceholder')" rows="2" fluid/>
                <Button type="button" icon="pi pi-trash" text severity="danger"
                        :aria-label="t('demands.removeObservation')" @click="removeObservation(index)"/>
              </div>
              <Button type="button" :label="t('demands.addObservation')" icon="pi pi-plus" text
                      class="add-observation" @click="addObservation"/>
            </fieldset>

            <footer class="form-actions">
              <Button type="button" :label="t('demands.cancelCreate')" severity="secondary" outlined
                      @click="router.push({name: 'Demands'})"/>
              <Button type="submit" :label="t('demands.register')" icon="pi pi-plus" :loading="isSubmitting"
                      :disabled="isSubmitting"/>
            </footer>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue';
import {useRoute} from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import {useToast} from 'primevue/usetoast';
import AppSidebar from '@/components/AppSidebar.vue';
import {useLanguage} from '@/composables/use-language.ts';
import {hasStoredPlanResource} from '@/composables/use-plan-resources.ts';
import router from '@/router';
import {useDemandStore} from '@/stores/demand-store.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import type {DemandPriority, DemandStatus, RegisterDemand} from '@/types/demands/Demand.ts';
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';

const route = useRoute();
const toast = useToast();
const demandStore = useDemandStore();
const subdomainStore = useSubdomainStore();
const {t} = useLanguage();
const isSubmitting = ref(false);
const canAccessSubdomains = hasStoredPlanResource('SUBDOMAINS');
const statuses: DemandStatus[] = ['PENDING', 'ONGOING', 'BLOCKED', 'DONE'];
const priorities: DemandPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const requestedStatus = typeof route.query.status === 'string' && statuses.includes(route.query.status as DemandStatus)
    ? route.query.status as DemandStatus
    : 'PENDING';

const form = reactive({
  title: '',
  description: '',
  deadline: null as string | null,
  status: requestedStatus,
  priority: 'MEDIUM' as DemandPriority,
  observationToReview: null as string | null,
  observations: [] as string[],
});

const statusOptions = computed(() => statuses.map((value) => ({value, label: t(`status.${value}`)})));
const priorityOptions = computed(() => priorities.map((value) => ({value, label: t(`priority.${value}`)})));
const statusLabel = computed(() => t(`status.${form.status}`));

const addObservation = () => form.observations.push('');
const removeObservation = (index: number) => form.observations.splice(index, 1);

const saveDemand = async () => {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  const payload: RegisterDemand = {
    title: form.title.trim(),
    description: form.description.trim(),
    deadline: form.deadline,
    status: form.status,
    priority: form.priority,
    observationToReview: form.observationToReview?.trim() || null,
    observations: {textObservations: form.observations.map((item) => item.trim()).filter(Boolean)},
  };
  const result = await demandStore.registerDemand(payload);
  isSubmitting.value = false;

  if (result.isError) {
    showErrorToast(toast, result.response);
    return;
  }

  showSuccessToast(toast, result.response);
  await router.push({name: 'Demands'});
};

onMounted(async () => {
  if (canAccessSubdomains)
    await subdomainStore.fetchSubdomains();
});
</script>

<style scoped>
.demand-create-page { min-height: 100dvh; color: var(--wh-text); background: var(--wh-bg); }
.back-link, .form-actions { display: flex; align-items: center; }
.create-workspace { width: 100%; padding: 18px 20px 24px; }
.back-link { width: fit-content; gap: 8px; color: var(--wh-text-soft); font-size: .8rem; font-weight: 700; text-decoration: none; }
.back-link:hover { color: var(--wh-primary); }
.create-layout { display: grid; grid-template-columns: minmax(260px, .42fr) minmax(540px, 1fr); gap: 20px; margin-top: 18px; align-items: start; }
.kicker { margin: 0; color: var(--wh-primary); font-size: .68rem; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.create-intro { position: sticky; top: 18px; padding: 22px; border: 1px solid var(--wh-border); border-radius: var(--wh-radius-md); background: var(--wh-surface); }
.create-intro h1 { max-width: 520px; margin: 12px 0 16px; color: var(--wh-text); font-family: Georgia, serif; font-size: clamp(2.2rem, 3.5vw, 4rem); font-weight: 400; letter-spacing: -.06em; line-height: 1; }
.create-intro > p:last-of-type { color: var(--wh-text-soft); line-height: 1.65; }
.create-intro ul { display: grid; gap: 12px; margin: 22px 0 0; padding: 0; color: var(--wh-text-soft); font-size: .8rem; list-style: none; }
.create-intro li { display: flex; gap: 9px; align-items: center; }
.create-intro li i { color: var(--wh-primary); }
.create-card { overflow: hidden; border: 1px solid var(--wh-border); border-radius: var(--wh-radius-md); background: var(--wh-surface); box-shadow: var(--wh-shadow-sm); }
.create-card > header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 22px 24px; border-bottom: 1px solid var(--wh-border); }
.create-card h2 { margin: 5px 0 0; font-family: Georgia, serif; font-size: 1.65rem; font-weight: 400; }
.status-preview { padding: 6px 10px; border: 1px solid var(--wh-primary); border-radius: 20px; color: var(--wh-primary); font-size: .68rem; font-weight: 800; }
.create-form { display: grid; gap: 18px; padding: 24px; }
.create-form label { display: grid; gap: 7px; color: var(--wh-text-soft); font-size: .72rem; font-weight: 800; }
.create-form small, fieldset small { color: var(--wh-text-muted); font-weight: 500; }
.create-form :deep(.p-inputtext), .create-form :deep(.p-textarea), .create-form :deep(.p-select) { width: 100%; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
fieldset { display: grid; gap: 10px; min-width: 0; margin: 0; padding: 14px; border: 1px solid var(--wh-border); border-radius: var(--wh-radius-sm); }
legend { padding: 0 5px; color: var(--wh-text-soft); font-size: .72rem; font-weight: 800; }
.observation-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 6px; align-items: start; }
.add-observation { width: fit-content; padding-inline: 0; }
.form-actions { justify-content: flex-end; gap: 10px; padding-top: 6px; }
@media (max-width: 900px) { .create-layout { grid-template-columns: 1fr; } .create-intro { position: static; } .create-intro ul { display: none; } }
@media (max-width: 480px) { .create-workspace { padding: 14px 12px 18px; } .form-row { grid-template-columns: 1fr; } .create-card > header, .create-form, .create-intro { padding-inline: 16px; } .form-actions { align-items: stretch; flex-direction: column-reverse; } }
</style>
