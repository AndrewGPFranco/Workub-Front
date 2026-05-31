<template>
  <div class="demands-page">
    <header class="topbar">
      <RouterLink :to="{name: 'Demands'}" class="brand">
        <span class="brand-mark">W</span>
        <span>Workhub</span>
      </RouterLink>

      <div class="profile">
        <div class="profile-copy">
          <strong>{{ userName }}</strong>
          <span>{{ authStore.userLogged?.email }}</span>
        </div>
        <Button icon="pi pi-sign-out" severity="secondary" text rounded aria-label="Sair" @click="logout"/>
      </div>
    </header>

    <main class="workspace">
      <section class="hero">
        <div>
          <p class="eyebrow">Minhas demandas</p>
          <h1>Organize o que precisa ser entregue.</h1>
          <p class="hero-description">
            Registre atividades, acompanhe prioridades e mantenha seu trabalho visível.
          </p>
        </div>
        <Button label="Nova demanda" icon="pi pi-plus" class="new-demand-button" @click="focusForm"/>
      </section>

      <section class="summary-grid" aria-label="Resumo das demandas exibidas">
        <article class="summary-card">
          <span class="summary-icon blue"><i class="pi pi-list-check"/></span>
          <div>
            <span>Na página atual</span>
            <strong>{{ demandStore.demands.length }}</strong>
          </div>
        </article>
        <article class="summary-card">
          <span class="summary-icon purple"><i class="pi pi-spinner"/></span>
          <div>
            <span>Em andamento</span>
            <strong>{{ ongoingCount }}</strong>
          </div>
        </article>
        <article class="summary-card">
          <span class="summary-icon orange"><i class="pi pi-exclamation-circle"/></span>
          <div>
            <span>Urgentes</span>
            <strong>{{ urgentCount }}</strong>
          </div>
        </article>
        <article class="summary-card">
          <span class="summary-icon green"><i class="pi pi-check-circle"/></span>
          <div>
            <span>Concluídas</span>
            <strong>{{ doneCount }}</strong>
          </div>
        </article>
      </section>

      <section class="content-grid">
        <aside ref="formCard" class="form-card">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Cadastro rápido</p>
              <h2>Nova demanda</h2>
            </div>
            <span class="heading-icon"><i class="pi pi-plus"/></span>
          </div>

          <form class="demand-form" @submit.prevent="registerDemand">
            <label>
              <span>Título</span>
              <InputText v-model.trim="form.title" placeholder="Ex.: Revisar endpoint de clientes" required fluid/>
            </label>

            <label>
              <span>Descrição</span>
              <Textarea
                  v-model.trim="form.description"
                  placeholder="Descreva o que precisa ser realizado"
                  rows="5"
                  required
                  fluid
              />
            </label>

            <label>
              <span>Anotação para review <small>opcional</small></span>
              <Textarea
                  v-model.trim="form.observationToReview"
                  placeholder="Registre contexto, decisões ou o resultado esperado para consultar no review"
                  rows="4"
                  fluid
              />
            </label>

            <label>
              <span>Prazo</span>
              <InputText v-model="form.deadline" type="date" fluid/>
            </label>

            <div class="form-row">
              <label>
                <span>Status</span>
                <Select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" fluid/>
              </label>
              <label>
                <span>Prioridade</span>
                <Select
                    v-model="form.priority"
                    :options="priorityOptions"
                    option-label="label"
                    option-value="value"
                    fluid
                />
              </label>
            </div>

            <Button
                type="submit"
                label="Registrar demanda"
                icon="pi pi-plus"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="submit-button"
            />
          </form>
        </aside>

        <section class="list-card">
          <div class="section-heading list-heading">
            <div>
              <p class="eyebrow">Acompanhamento</p>
              <h2>Demandas registradas</h2>
            </div>
            <Button
                icon="pi pi-refresh"
                severity="secondary"
                text
                rounded
                aria-label="Atualizar demandas"
                :loading="demandStore.isLoading"
                @click="loadDemands(demandStore.currentPage)"
            />
          </div>

          <div v-if="demandStore.isLoading" class="empty-state">
            <i class="pi pi-spin pi-spinner"/>
            <span>Carregando demandas...</span>
          </div>

          <div v-else-if="demandStore.demands.length === 0" class="empty-state">
            <i class="pi pi-inbox"/>
            <strong>Nenhuma demanda nesta página.</strong>
            <span>Registre sua primeira atividade para iniciar o acompanhamento.</span>
          </div>

          <div v-else class="demand-list">
            <article v-for="demand in demandStore.demands" :key="demand.id" class="demand-item">
              <div class="demand-main">
                <div class="demand-title-row">
                  <h3>{{ demand.title }}</h3>
                  <span :class="['badge', `priority-${demand.priority.toLowerCase()}`]">
                    {{ priorityLabels[demand.priority] }}
                  </span>
                </div>
                <p>{{ demand.description }}</p>
                <p v-if="demand.observationToReview" class="review-note">
                  <i class="pi pi-bookmark"/>
                  {{ demand.observationToReview }}
                </p>
                <div class="demand-meta">
                  <span><i class="pi pi-calendar"/>{{ formatDeadline(demand.deadline) }}</span>
                  <span><i class="pi pi-clock"/>{{ formatDate(demand.createdAt) }}</span>
                </div>
              </div>
              <span :class="['badge', `status-${demand.status.toLowerCase()}`]">
                {{ statusLabels[demand.status] }}
              </span>
            </article>
          </div>

          <footer class="pagination">
            <span>Página {{ demandStore.currentPage + 1 }}</span>
            <div>
              <Button
                  icon="pi pi-angle-left"
                  severity="secondary"
                  outlined
                  aria-label="Página anterior"
                  :disabled="demandStore.currentPage === 0 || demandStore.isLoading"
                  @click="loadDemands(demandStore.currentPage - 1)"
              />
              <Button
                  icon="pi pi-angle-right"
                  severity="secondary"
                  outlined
                  aria-label="Próxima página"
                  :disabled="!demandStore.canGoForward || demandStore.isLoading"
                  @click="loadDemands(demandStore.currentPage + 1)"
              />
            </div>
          </footer>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import {useToast} from 'primevue/usetoast';
import router from '@/router';
import {useAuthStore} from '@/stores/auth-store.ts';
import {useDemandStore} from '@/stores/demand-store.ts';
import type {DemandPriority, DemandStatus, RegisterDemand} from '@/types/demands/Demand.ts';

const toast = useToast();
const isSubmitting = ref(false);
const authStore = useAuthStore();
const demandStore = useDemandStore();
const formCard = ref<HTMLElement | null>(null);

const statusLabels: Record<DemandStatus, string> = {
  PENDING: 'Pendente',
  ONGOING: 'Em andamento',
  BLOCKED: 'Bloqueada',
  DONE: 'Concluída',
};

const priorityLabels: Record<DemandPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({value, label}));
const priorityOptions = Object.entries(priorityLabels).map(([value, label]) => ({value, label}));

const emptyForm = (): RegisterDemand => ({
  title: '',
  description: '',
  deadline: null,
  status: 'PENDING',
  priority: 'MEDIUM',
  observationToReview: null,
});

const form = reactive<RegisterDemand>(emptyForm());

const userName = computed(() => {
  const user = authStore.userLogged;
  return user ? `${user.firstName} ${user.lastName}` : 'Usuário';
});
const ongoingCount = computed(() => demandStore.demands.filter(({status}) => status === 'ONGOING').length);
const urgentCount = computed(() => demandStore.demands.filter(({priority}) => priority === 'URGENT').length);
const doneCount = computed(() => demandStore.demands.filter(({status}) => status === 'DONE').length);

const loadDemands = async (page = 0) => {
  const result = await demandStore.fetchDemands(page);

  if (result.isError) {
    toast.add({severity: 'error', detail: 'Não foi possível carregar suas demandas.', life: 3500});
  }
};

const registerDemand = async () => {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  const result = await demandStore.registerDemand({...form});

  if (result.isError) {
    toast.add({severity: 'error', detail: result.response, life: 3500});
    isSubmitting.value = false;
    return;
  }

  Object.assign(form, emptyForm());
  toast.add({severity: 'success', detail: result.response, life: 3500});
  await loadDemands(0);
  isSubmitting.value = false;
};

const formatDeadline = (deadline: string | null) => {
  if (!deadline)
    return 'Sem prazo definido';

  return new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(new Date(`${deadline}T00:00:00Z`));
};

const formatDate = (date: string) => new Intl.DateTimeFormat('pt-BR').format(new Date(date));

const focusForm = () => {
  formCard.value?.scrollIntoView({behavior: 'smooth', block: 'start'});
};

const logout = async () => {
  authStore.logout();
  await router.push({name: 'Login'});
};

onMounted(() => loadDemands());
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.demands-page {
  min-height: 100dvh;
  color: #eef4ff;
  background: radial-gradient(circle at 12% 0%, rgba(53, 119, 255, 0.22), transparent 30%),
  radial-gradient(circle at 90% 92%, rgba(125, 55, 255, 0.18), transparent 28%),
  #050817;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 6vw;
  border-bottom: 1px solid rgba(112, 133, 196, 0.2);
  background: rgba(7, 11, 28, 0.84);
  backdrop-filter: blur(18px);
}

.brand, .profile, .profile-copy, .summary-card, .demand-meta, .pagination, .pagination div {
  display: flex;
  align-items: center;
}

.brand {
  gap: 11px;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 13px;
  background: linear-gradient(135deg, #7c3aed, #1d8cff);
}

.profile {
  gap: 10px;
}

.profile-copy {
  align-items: flex-end;
  flex-direction: column;
  font-size: 0.82rem;
}

.profile-copy span {
  color: #8f9ab8;
  font-size: 0.74rem;
}

.workspace {
  width: min(1440px, 100%);
  margin: 0 auto;
  padding: 46px 6vw 56px;
}

.hero, .section-heading, .demand-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #50a4ff;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1, h2, h3, p {
  margin: 0;
}

h1 {
  max-width: 680px;
  font-size: clamp(2rem, 4vw, 3.35rem);
  letter-spacing: -0.055em;
}

.hero-description {
  margin-top: 15px;
  color: #a4aec8;
  line-height: 1.65;
}

.new-demand-button, .submit-button {
  border: 0;
  background: linear-gradient(135deg, #7c3aed, #1d8cff);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 34px 0 20px;
}

.summary-card, .form-card, .list-card {
  border: 1px solid rgba(105, 124, 184, 0.2);
  background: rgba(10, 16, 38, 0.72);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.16);
}

.summary-card {
  gap: 13px;
  padding: 17px;
  border-radius: 16px;
}

.summary-card div {
  display: grid;
  gap: 3px;
}

.summary-card span:not(.summary-icon) {
  color: #99a6c7;
  font-size: 0.78rem;
}

.summary-card strong {
  font-size: 1.45rem;
}

.summary-icon, .heading-icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
}

.blue {
  color: #66b7ff;
  background: rgba(29, 140, 255, 0.14);
}

.purple {
  color: #ae8aff;
  background: rgba(124, 58, 237, 0.16);
}

.orange {
  color: #ffae69;
  background: rgba(255, 132, 59, 0.14);
}

.green {
  color: #67dba4;
  background: rgba(42, 190, 121, 0.14);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(290px, 0.36fr) minmax(0, 0.64fr);
  gap: 20px;
  align-items: start;
}

.form-card, .list-card {
  border-radius: 20px;
  overflow: hidden;
}

.form-card {
  padding: 22px;
}

h2 {
  color: #fff;
  font-size: 1.3rem;
}

.heading-icon {
  color: #7fafff;
  background: rgba(46, 123, 255, 0.15);
}

.demand-form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.demand-form label {
  display: grid;
  gap: 7px;
  min-width: 0;
  color: #cbd7f4;
  font-size: 0.82rem;
  font-weight: 800;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.demand-form :deep(.p-inputtext), .demand-form :deep(.p-textarea), .demand-form :deep(.p-select) {
  width: 100%;
  border-color: rgba(100, 122, 190, 0.35);
  border-radius: 10px;
  color: #eef4ff;
  background: rgba(4, 8, 24, 0.82);
}

.submit-button {
  margin-top: 5px;
}

.list-heading {
  padding: 22px;
  border-bottom: 1px solid rgba(105, 124, 184, 0.18);
}

.empty-state {
  display: grid;
  min-height: 330px;
  padding: 35px;
  place-items: center;
  align-content: center;
  gap: 12px;
  color: #95a2c4;
  text-align: center;
}

.empty-state i {
  color: #5f8ddd;
  font-size: 2rem;
}

.demand-list {
  display: grid;
}

.demand-item {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 19px 22px;
  border-bottom: 1px solid rgba(105, 124, 184, 0.14);
}

.demand-main {
  min-width: 0;
}

.demand-title-row {
  justify-content: flex-start;
}

.demand-item h3 {
  overflow: hidden;
  color: #f5f8ff;
  font-size: 0.98rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demand-item p {
  display: -webkit-box;
  margin-top: 7px;
  overflow: hidden;
  color: #9da9c5;
  font-size: 0.86rem;
  line-height: 1.52;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.demand-item .review-note {
  color: #b9a7eb;
  font-size: 0.78rem;
}

.review-note i {
  margin-right: 6px;
}

.demand-meta {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
  color: #7785a8;
  font-size: 0.74rem;
}

.demand-meta span {
  display: flex;
  gap: 6px;
}

.badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  width: fit-content;
  height: fit-content;
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 900;
}

.priority-low {
  color: #93a5c9;
  background: rgba(133, 151, 188, 0.13);
}

.priority-medium {
  color: #70b9ff;
  background: rgba(29, 140, 255, 0.14);
}

.priority-high {
  color: #ffc06b;
  background: rgba(255, 169, 55, 0.14);
}

.priority-urgent {
  color: #ff858c;
  background: rgba(255, 74, 86, 0.14);
}

.status-pending {
  color: #b4bfd7;
  background: rgba(150, 163, 196, 0.13);
}

.status-ongoing {
  color: #72baff;
  background: rgba(29, 140, 255, 0.14);
}

.status-blocked {
  color: #ff8a91;
  background: rgba(255, 74, 86, 0.14);
}

.status-done {
  color: #68dba5;
  background: rgba(42, 190, 121, 0.14);
}

.pagination {
  justify-content: space-between;
  padding: 15px 22px;
  color: #8997ba;
  font-size: 0.78rem;
}

.pagination div {
  gap: 8px;
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .workspace {
    padding: 32px 18px 42px;
  }

  .topbar {
    padding: 0 18px;
  }

  .profile-copy {
    display: none;
  }

  .hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .demand-item {
    flex-direction: column;
  }
}

@media (max-width: 430px) {
  .summary-card {
    padding: 13px;
  }

  .summary-icon {
    display: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
