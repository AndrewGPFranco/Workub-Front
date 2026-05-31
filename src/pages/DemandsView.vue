<template>
  <div id="page-top" class="demands-page">
    <header class="site-header">
      <nav class="navbar" aria-label="Navegação principal">
        <RouterLink :to="{name: 'Demands'}" class="brand" aria-label="Workhub">
          <img src="/favicon.png" alt="" class="brand-logo">
          <span class="brand-copy">Work<span>hub</span></span>
        </RouterLink>

        <div class="navbar-center">
          <a class="nav-link active" href="#demands-list"><i class="pi pi-inbox"/><span>Demandas</span></a>
          <span class="nav-link muted" title="Review consolidado em breve"><i
              class="pi pi-bookmark"/><span>Review</span></span>
        </div>

        <div class="navbar-actions">
          <Button icon="pi pi-search" text rounded disabled aria-label="Pesquisa em breve"/>
          <span class="navbar-divider"/>
          <div class="profile-copy">
            <strong>{{ userName }}</strong>
            <span>{{ authStore.userLogged?.email }}</span>
          </div>
          <div class="avatar">{{ userInitials }}</div>
          <Button icon="pi pi-sign-out" text rounded aria-label="Sair" @click="logout"/>
        </div>
      </nav>
    </header>

    <main class="workspace">
      <header class="desk-header">
        <div>
          <p class="edition">Painel pessoal <span>/</span> {{ todayLabel }}</p>
          <h1>Demandas em<br><em>movimento.</em></h1>
        </div>
        <div class="header-aside">
          <p>Uma visão direta do trabalho que precisa avançar.</p>
          <Button label="Registrar demanda" icon="pi pi-plus" class="new-demand-button" @click="focusForm"/>
        </div>
      </header>

      <section class="pulse" aria-label="Resumo das demandas exibidas">
        <div class="pulse-label">
          <span class="live-dot"/>
          <strong>Recorte atual</strong>
        </div>
        <dl>
          <div>
            <dt>Itens</dt>
            <dd>{{ demandStore.demands.length }}</dd>
          </div>
          <div>
            <dt>Em curso</dt>
            <dd>{{ ongoingCount }}</dd>
          </div>
          <div>
            <dt>Urgentes</dt>
            <dd>{{ urgentCount }}</dd>
          </div>
          <div>
            <dt>Atrasadas</dt>
            <dd>{{ overdueCount }}</dd>
          </div>
          <div>
            <dt>Fechadas</dt>
            <dd>{{ doneCount }}</dd>
          </div>
        </dl>
      </section>

      <section class="content-grid">
        <section id="demands-list" class="list-board">
          <div class="section-heading list-heading">
            <div>
              <p class="kicker">Fila de trabalho</p>
              <h2>O que está na mesa</h2>
            </div>
            <Button
                icon="pi pi-refresh"
                text
                rounded
                aria-label="Atualizar demandas"
                :loading="demandStore.isLoading"
                @click="loadDemands(demandStore.currentPage)"
            />
          </div>

          <div v-if="demandStore.isLoading" class="empty-state">
            <i class="pi pi-spin pi-spinner"/>
            <span>Atualizando a fila...</span>
          </div>

          <div v-else-if="demandStore.demands.length === 0" class="empty-state">
            <strong>Fila livre.</strong>
            <span>Registre a próxima demanda para colocar o trabalho em movimento.</span>
          </div>

          <div v-else class="demand-list">
            <article v-for="(demand, index) in demandStore.demands" :key="demand.id" class="demand-item">
              <span class="demand-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="demand-main">
                <div class="demand-title-row">
                  <h3>{{ demand.title }}</h3>
                  <span :class="['priority-mark', `priority-${demand.priority.toLowerCase()}`]">
                    {{ priorityLabels[demand.priority] }}
                  </span>
                </div>
                <p>{{ demand.description }}</p>
                <p v-if="demand.observationsToReview" class="review-note">
                  <i class="pi pi-bookmark-fill"/>
                  {{ demand.observationsToReview }}
                </p>
                <div class="demand-meta">
                  <span><i class="pi pi-calendar"/>{{ formatDeadline(demand.deadline) }}</span>
                  <span><i class="pi pi-clock"/>{{ formatDate(demand.createdAt) }}</span>
                </div>
              </div>
              <div class="demand-actions">
                <span :class="['status-stamp', `status-${demand.status.toLowerCase()}`]">
                  {{ statusLabels[demand.status] }}
                </span>
                <Button icon="pi pi-pencil" text rounded aria-label="Editar demanda" @click="startEditing(demand)"/>
                <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    aria-label="Excluir demanda"
                    @click="confirmDeletion(demand)"
                />
              </div>
            </article>
          </div>

          <footer class="pagination">
            <span>Folha {{ demandStore.currentPage + 1 }}</span>
            <div>
              <Button
                  icon="pi pi-arrow-left"
                  text
                  aria-label="Página anterior"
                  :disabled="demandStore.currentPage === 0 || demandStore.isLoading"
                  @click="loadDemands(demandStore.currentPage - 1)"
              />
              <Button
                  icon="pi pi-arrow-right"
                  text
                  aria-label="Próxima página"
                  :disabled="!demandStore.canGoForward || demandStore.isLoading"
                  @click="loadDemands(demandStore.currentPage + 1)"
              />
            </div>
          </footer>
        </section>

        <aside ref="formCard" class="intake">
          <div class="intake-heading">
            <p class="kicker">{{ editingDemandId ? 'Ajuste de rota' : 'Entrada rápida' }}</p>
            <h2>{{ editingDemandId ? 'Editar demanda' : 'Nova demanda' }}</h2>
            <p>{{
                editingDemandId ? 'Atualize o registro conforme o trabalho avança.' : 'Capture agora. Refine enquanto executa.'
              }}</p>
          </div>

          <form class="demand-form" @submit.prevent="saveDemand">
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
                :label="editingDemandId ? 'Salvar alterações' : 'Registrar demanda'"
                :icon="editingDemandId ? 'pi pi-check' : 'pi pi-plus'"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="submit-button"
            />
            <Button
                v-if="editingDemandId"
                type="button"
                label="Cancelar edição"
                text
                class="cancel-button"
                @click="cancelEditing"
            />
          </form>
        </aside>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-brand">
        <img src="/favicon.png" alt="" class="brand-logo small">
        <div>
          <strong>workhub</strong>
          <span>Seu registro diário de entregas.</span>
        </div>
      </div>
      <p>Organize o presente. Documente o que avançou.</p>
      <a href="#page-top">Voltar ao topo <i class="pi pi-arrow-up"/></a>
    </footer>

    <Teleport to="body">
      <Transition name="delete-modal">
        <div
            v-if="isDeleteDialogVisible"
            class="delete-modal-backdrop"
            role="presentation"
            @click.self="closeDeleteDialog"
        >
          <section
              ref="deleteModal"
              class="delete-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
              aria-describedby="delete-modal-description"
              tabindex="-1"
          >
            <header class="delete-modal-header">
              <div>
                <p class="kicker">Ação permanente</p>
                <h2 id="delete-modal-title">Remover demanda</h2>
              </div>
              <button class="delete-modal-close" type="button" aria-label="Fechar" :disabled="isDeleting"
                      @click="closeDeleteDialog">
                <i class="pi pi-times"/>
              </button>
            </header>

            <div class="delete-modal-content">
              <span class="delete-modal-icon"><i class="pi pi-trash"/></span>
              <div>
                <strong>Retirar este item da fila?</strong>
                <p id="delete-modal-description">
                  A demanda <b>{{ demandToDelete?.title }}</b> será removida permanentemente.
                  Esta ação não poderá ser desfeita.
                </p>
              </div>
            </div>

            <footer class="delete-modal-footer">
              <button class="modal-button secondary" type="button" :disabled="isDeleting" @click="closeDeleteDialog">
                Manter demanda
              </button>
              <button class="modal-button destructive" type="button" :disabled="isDeleting" @click="deleteDemand">
                <i :class="isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'"/>
                {{ isDeleting ? 'Removendo...' : 'Remover demanda' }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref} from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import {useToast} from 'primevue/usetoast';
import router from '@/router';
import {useAuthStore} from '@/stores/auth-store.ts';
import {useDemandStore} from '@/stores/demand-store.ts';
import type {Demand, DemandPriority, DemandStatus, EditDemand, RegisterDemand} from '@/types/demands/Demand.ts';
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';

const toast = useToast();
const isSubmitting = ref(false);
const isDeleting = ref(false);
const isDeleteDialogVisible = ref(false);
const demandToDelete = ref<Demand | null>(null);
const deleteModal = ref<HTMLElement | null>(null);
const authStore = useAuthStore();
const demandStore = useDemandStore();
const formCard = ref<HTMLElement | null>(null);
const editingDemandId = ref<string | null>(null);

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
const userInitials = computed(() => {
  const user = authStore.userLogged;
  return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'WH';
});
const todayLabel = new Intl.DateTimeFormat('pt-BR', {day: '2-digit', month: 'long'}).format(new Date());
const ongoingCount = computed(() => demandStore.demands.filter(({status}) => status === 'ONGOING').length);
const urgentCount = computed(() => demandStore.demands.filter(({priority}) => priority === 'URGENT').length);
const doneCount = computed(() => demandStore.demands.filter(({status}) => status === 'DONE').length);
const overdueCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return demandStore.demands.filter(({deadline, status}) => deadline && deadline < today && status !== 'DONE').length;
});

const loadDemands = async (page = 0) => {
  const result = await demandStore.fetchDemands(page);

  if (result.isError) {
    showErrorToast(toast, 'Não foi possível carregar suas demandas.');
  }
};

const saveDemand = async () => {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  const result = editingDemandId.value
      ? await demandStore.editDemand(editingDemandId.value, toEditDemand())
      : await demandStore.registerDemand({...form});

  if (result.isError) {
    showErrorToast(toast, result.response);
    isSubmitting.value = false;
    return;
  }

  cancelEditing();
  showSuccessToast(toast, result.response);
  await loadDemands(demandStore.currentPage);
  isSubmitting.value = false;
};

const toEditDemand = (): EditDemand => ({
  title: form.title,
  description: form.description,
  deadline: form.deadline,
  status: form.status,
  priority: form.priority,
  observationsToReview: form.observationToReview,
});

const startEditing = (demand: Demand) => {
  editingDemandId.value = demand.id;
  Object.assign(form, {
    title: demand.title,
    description: demand.description,
    deadline: demand.deadline,
    status: demand.status,
    priority: demand.priority,
    observationToReview: demand.observationsToReview ?? null,
  });
  focusForm();
};

const cancelEditing = () => {
  editingDemandId.value = null;
  Object.assign(form, emptyForm());
};

const confirmDeletion = async (demand: Demand) => {
  demandToDelete.value = demand;
  isDeleteDialogVisible.value = true;
  await nextTick();
  deleteModal.value?.focus();
};

const closeDeleteDialog = () => {
  if (isDeleting.value)
    return;

  isDeleteDialogVisible.value = false;
  demandToDelete.value = null;
};

const deleteDemand = async () => {
  const demand = demandToDelete.value;
  if (!demand || isDeleting.value)
    return;

  isDeleting.value = true;
  const result = await demandStore.deleteDemand(demand.id);

  if (result.isError) {
    showErrorToast(toast, result.response);
    isDeleting.value = false;
    return;
  }

  if (editingDemandId.value === demand.id)
    cancelEditing();

  const page = demandStore.demands.length === 1 && demandStore.currentPage > 0
      ? demandStore.currentPage - 1
      : demandStore.currentPage;

  showSuccessToast(toast, result.response);
  await loadDemands(page);
  isDeleting.value = false;
  closeDeleteDialog();
};

const closeDeleteDialogOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape')
    closeDeleteDialog();
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

onMounted(() => {
  loadDemands();
  window.addEventListener('keydown', closeDeleteDialogOnEscape);
});

onBeforeUnmount(() => window.removeEventListener('keydown', closeDeleteDialogOnEscape));
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
}

.demands-page {
  min-height: 100dvh;
  scroll-margin-top: 16px;
  color: #17251f;
  background: #f1f0eb;
}

.site-header {
  padding: 22px clamp(18px, 5vw, 76px) 0;
  pointer-events: none;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1360px;
  min-height: 72px;
  margin: 0 auto;
  padding: 9px 12px;
  border: 1px solid rgba(33, 59, 49, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 253, 0.93);
  box-shadow: 0 15px 35px rgba(42, 55, 49, 0.1);
  backdrop-filter: blur(16px);
  pointer-events: auto;
}

.brand, .navbar-center, .navbar-actions, .profile-copy, .demand-meta, .pagination, .pagination div, .footer-brand {
  display: flex;
  align-items: center;
}

.brand {
  gap: 10px;
  color: #173e32;
  font-weight: 800;
  text-decoration: none;
}

.brand-logo {
  width: 50px;
  height: 50px;
  border-radius: 15px 15px 15px 5px;
  object-fit: cover;
  box-shadow: 0 5px 13px rgba(32, 43, 77, 0.2);
}

.brand-logo.small {
  width: 38px;
  height: 38px;
  border-radius: 11px 11px 11px 4px;
}

.brand-copy {
  font-size: 1.02rem;
  letter-spacing: -0.05em;
}

.brand-copy span {
  color: #f07849;
}

.navbar-center {
  gap: 5px;
  padding: 4px;
  border-radius: 17px;
  background: #f5f5f1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  border-radius: 13px;
  color: #778078;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: 160ms ease;
}

.nav-link:hover, .nav-link.active {
  color: #173e32;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(27, 53, 43, 0.07);
}

.nav-link.muted {
  cursor: default;
  opacity: 0.52;
}

.nav-link.muted:hover {
  color: #778078;
  background: transparent;
  box-shadow: none;
}

.navbar-actions {
  gap: 7px;
}

.navbar-actions :deep(.p-button) {
  color: #66726b;
}

.navbar-divider {
  width: 1px;
  height: 28px;
  margin: 0 7px;
  background: #e4e5df;
}

.profile-copy {
  align-items: flex-end;
  flex-direction: column;
  max-width: 170px;
  font-size: 0.76rem;
  line-height: 1.25;
}

.profile-copy span {
  overflow: hidden;
  max-width: 100%;
  color: #8c938e;
  font-size: 0.67rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.avatar {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  color: #ffffff;
  background: #ef774c;
  font-size: 0.72rem;
  font-weight: 900;
}

.workspace {
  width: min(1380px, 100%);
  margin: 0 auto;
  padding: 68px clamp(18px, 5vw, 76px) 80px;
}

.desk-header, .section-heading, .demand-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.edition, .kicker {
  color: #77857e;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.edition span {
  padding: 0 7px;
  color: #ef774c;
}

h1, h2, h3, p {
  margin: 0;
}

h1 {
  margin-top: 12px;
  color: #153c31;
  font-family: Georgia, serif;
  font-size: clamp(3.5rem, 8vw, 7.2rem);
  font-weight: 400;
  letter-spacing: -0.095em;
  line-height: 0.88;
}

h1 em {
  color: #ef774c;
  font-weight: 400;
}

.header-aside {
  display: grid;
  max-width: 270px;
  justify-items: start;
  gap: 20px;
  padding-top: 30px;
}

.header-aside p {
  color: #69766f;
  font-size: 0.91rem;
  line-height: 1.65;
}

.new-demand-button, .submit-button {
  border: 0;
  color: #dfff7a;
  background: #124b3a;
  font-weight: 800;
}

.new-demand-button:not(:disabled):hover, .submit-button:not(:disabled):hover {
  background: #0b3b2d;
}

.pulse {
  display: flex;
  align-items: stretch;
  gap: 26px;
  margin: 52px 0 28px;
  padding: 13px 20px;
  border-top: 1px solid #d2d5cf;
  border-bottom: 1px solid #d2d5cf;
}

.pulse-label {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 135px;
  color: #315248;
  font-size: 0.73rem;
  text-transform: uppercase;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9acb35;
  box-shadow: 0 0 0 4px rgba(154, 203, 53, 0.18);
}

.pulse dl {
  display: grid;
  width: 100%;
  margin: 0;
  grid-template-columns: repeat(5, 1fr);
}

.pulse dl div {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  padding: 3px 14px;
  border-left: 1px solid #d9dcd6;
}

.pulse dt {
  color: #85908b;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.pulse dd {
  margin: 0;
  color: #173e32;
  font-family: Georgia, serif;
  font-size: 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 355px);
  gap: 24px;
  align-items: start;
}

.list-board, .intake {
  border: 1px solid #dcddd8;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 252, 0.78);
  box-shadow: 0 15px 32px rgba(48, 66, 58, 0.05);
}

h2 {
  color: #173e32;
  font-family: Georgia, serif;
  font-size: 1.7rem;
  font-weight: 400;
  letter-spacing: -0.05em;
}

.list-heading {
  padding: 22px 24px;
  border-bottom: 1px solid #dcddd8;
}

.list-heading :deep(.p-button) {
  color: #54746a;
}

.empty-state {
  display: grid;
  min-height: 330px;
  padding: 35px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: #84908b;
  text-align: center;
}

.empty-state i {
  color: #719348;
  font-size: 1.7rem;
}

.demand-list {
  display: grid;
}

.demand-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) auto;
  gap: 14px;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e3df;
  transition: background 160ms ease;
}

.demand-item:hover {
  background: #fbfcf6;
}

.demand-index {
  color: #b7bdb7;
  font-family: Georgia, serif;
  font-size: 0.92rem;
}

.demand-main {
  min-width: 0;
}

.demand-title-row {
  justify-content: flex-start;
}

.demand-item h3 {
  overflow: hidden;
  color: #213b33;
  font-size: 0.94rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demand-item p {
  display: -webkit-box;
  margin-top: 7px;
  overflow: hidden;
  color: #748078;
  font-size: 0.82rem;
  line-height: 1.52;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.demand-item .review-note {
  color: #8f613e;
  font-size: 0.76rem;
}

.review-note i {
  margin-right: 6px;
  color: #ef774c;
}

.demand-meta {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 11px;
  color: #9ba39e;
  font-size: 0.68rem;
}

.demand-meta span {
  display: flex;
  gap: 5px;
}

.priority-mark, .status-stamp {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  height: fit-content;
  font-size: 0.61rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.priority-mark {
  padding-left: 8px;
  border-left: 2px solid currentColor;
}

.status-stamp {
  padding: 6px 8px;
  border: 1px solid currentColor;
  border-radius: 2px;
}

.demand-actions {
  display: grid;
  justify-items: end;
  align-content: start;
  gap: 6px;
}

.demand-actions :deep(.p-button) {
  width: 28px;
  height: 28px;
  color: #668178;
}

.demand-actions :deep(.p-button:hover) {
  color: #173e32;
  background: #eef1eb;
}

.priority-low {
  color: #8a9690;
}

.priority-medium {
  color: #66813c;
}

.priority-high {
  color: #c27033;
}

.priority-urgent {
  color: #c34843;
}

.status-pending {
  color: #7f8b86;
}

.status-ongoing {
  color: #377b67;
}

.status-blocked {
  color: #c34843;
}

.status-done {
  color: #66813c;
}

.pagination {
  justify-content: space-between;
  padding: 11px 18px;
  color: #8b9691;
  background: #fafaf7;
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.pagination div {
  gap: 3px;
}

.pagination :deep(.p-button) {
  color: #42685d;
}

.intake {
  position: sticky;
  top: 116px;
  padding: 22px;
  background: #173e32;
}

.intake-heading h2 {
  margin-top: 5px;
  color: #f7f4e8;
}

.intake-heading .kicker {
  color: #b6d261;
}

.intake-heading p:last-child {
  margin-top: 8px;
  color: #a8beb5;
  font-size: 0.78rem;
}

.demand-form {
  display: grid;
  gap: 14px;
  margin-top: 22px;
}

.demand-form label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: #d1e0d9;
  font-size: 0.71rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.demand-form small {
  color: #8ea79d;
  font-size: 0.64rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.demand-form :deep(.p-inputtext), .demand-form :deep(.p-textarea), .demand-form :deep(.p-select) {
  width: 100%;
  border-color: rgba(209, 224, 217, 0.18);
  border-radius: 3px;
  color: #f5f3eb;
  background: rgba(5, 39, 29, 0.72);
  font-size: 0.8rem;
}

.demand-form :deep(.p-select-label) {
  color: #f5f3eb;
}

.demand-form :deep(.p-inputtext::placeholder), .demand-form :deep(.p-textarea::placeholder) {
  color: #77968b;
}

.submit-button {
  margin-top: 4px;
  color: #173e32;
  background: #d8f06d;
}

.submit-button:not(:disabled):hover {
  color: #173e32;
  background: #e4fa83;
}

.cancel-button {
  color: #b5c9c1;
}

.cancel-button:not(:disabled):hover {
  color: #f4f1e7;
  background: rgba(244, 241, 231, 0.08);
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px clamp(18px, 5vw, 76px);
  color: #99afa6;
  background: #12382e;
}

.footer-brand {
  gap: 10px;
}

.footer-brand div {
  display: grid;
}

.footer-brand strong {
  color: #f5f2e8;
  font-size: 0.9rem;
}

.footer-brand span, .site-footer p, .site-footer a {
  color: #99afa6;
  font-size: 0.7rem;
}

.site-footer a {
  color: #d8f06d;
  font-weight: 800;
  text-decoration: none;
}

.delete-modal-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: min(18vh, 150px) 18px 24px;
  background: rgba(18, 56, 46, 0.48);
  backdrop-filter: blur(2px);
}

.delete-modal {
  width: min(100%, 500px);
  border: 1px solid #d7d9d3;
  border-radius: 4px;
  overflow: hidden;
  outline: 0;
  background: #fbfbf7;
  box-shadow: 0 24px 55px rgba(23, 62, 50, 0.22);
}

.delete-modal-header, .delete-modal-content, .delete-modal-footer {
  display: flex;
}

.delete-modal-header {
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 15px;
  border-bottom: 1px solid #e1e3de;
}

.delete-modal-header h2 {
  margin-top: 4px;
  font-size: 1.45rem;
}

.delete-modal-close {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: #789087;
  background: transparent;
  cursor: pointer;
}

.delete-modal-close:not(:disabled):hover {
  color: #173e32;
  background: #eef1eb;
}

.delete-modal-content {
  gap: 14px;
  align-items: flex-start;
  padding: 22px;
}

.delete-modal-icon {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(239, 119, 76, 0.28);
  border-radius: 50%;
  color: #c45436;
  background: #fff2ea;
}

.delete-modal-content strong {
  color: #213b33;
  font-family: Georgia, serif;
  font-size: 1.02rem;
  letter-spacing: -0.02em;
}

.delete-modal-content p {
  margin-top: 7px;
  color: #748078;
  font-size: 0.84rem;
  line-height: 1.55;
}

.delete-modal-footer {
  justify-content: flex-end;
  gap: 8px;
  padding: 14px 22px 18px;
  border-top: 1px solid #e1e3de;
  background: #f6f6f1;
}

.modal-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 13px;
  border: 1px solid transparent;
  border-radius: 3px;
  font-size: 0.78rem;
  font-weight: 800;
  cursor: pointer;
}

.modal-button:disabled, .delete-modal-close:disabled {
  cursor: wait;
  opacity: 0.66;
}

.modal-button.secondary {
  color: #6c7e77;
  background: transparent;
}

.modal-button.secondary:not(:disabled):hover {
  color: #173e32;
  background: #eaeee8;
}

.modal-button.destructive {
  border-color: #c45436;
  color: #ffffff;
  background: #c45436;
}

.modal-button.destructive:not(:disabled):hover {
  border-color: #aa432a;
  background: #aa432a;
}

.delete-modal-enter-active, .delete-modal-leave-active {
  transition: opacity 160ms ease;
}

.delete-modal-enter-active .delete-modal, .delete-modal-leave-active .delete-modal {
  transition: transform 160ms ease, opacity 160ms ease;
}

.delete-modal-enter-from, .delete-modal-leave-to {
  opacity: 0;
}

.delete-modal-enter-from .delete-modal, .delete-modal-leave-to .delete-modal {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 980px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .intake {
    position: static;
  }
}

@media (max-width: 700px) {
  .site-header {
    padding: 12px 12px 0;
  }

  .navbar {
    min-height: 62px;
    padding: 6px 8px;
    border-radius: 18px;
  }

  .brand-logo {
    width: 42px;
    height: 42px;
  }

  .brand-copy, .profile-copy, .navbar-divider, .navbar-actions > :deep(.p-button:first-child), .nav-link span {
    display: none;
  }

  .nav-link {
    padding: 10px 12px;
  }

  .workspace {
    padding: 46px 16px 52px;
  }

  .desk-header {
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: clamp(3.8rem, 18vw, 5.7rem);
  }

  .header-aside {
    max-width: 100%;
    padding-top: 0;
  }

  .pulse {
    display: grid;
    gap: 13px;
    margin-top: 36px;
    padding: 13px 0;
  }

  .pulse dl {
    grid-template-columns: repeat(5, auto);
  }

  .pulse dl div {
    display: grid;
    justify-content: start;
    gap: 3px;
    padding: 0 8px;
  }

  .demand-item {
    grid-template-columns: 24px minmax(0, 1fr);
    padding: 17px 15px;
  }

  .status-stamp {
    grid-column: auto;
  }

  .demand-actions {
    grid-column: 2;
    justify-items: start;
  }

  .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 430px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .pulse {
    overflow-x: auto;
  }

  .pulse dl {
    min-width: 430px;
  }
}
</style>
