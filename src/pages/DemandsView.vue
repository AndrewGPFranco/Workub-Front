<template>
  <div id="page-top" class="demands-page">
    <header class="site-header">
      <nav class="navbar" :aria-label="t('demands.mainNav')">
        <RouterLink :to="{name: defaultRouteName}" class="brand" aria-label="Workhub">
          <img src="/favicon.png" alt="" class="brand-logo">
          <span class="brand-copy">Work<span>hub</span></span>
        </RouterLink>

        <div class="navbar-center">
          <RouterLink v-if="canAccess('DEMANDS')" class="nav-link active" :to="{name: 'Demands'}"><i
              class="pi pi-inbox"/><span>{{
              t('demands.nav')
            }}</span></RouterLink>
          <RouterLink v-if="canAccess('DAILY')" class="nav-link" :to="{name: 'Daily'}"><i class="pi pi-calendar-clock"/><span>{{
              t('daily.nav')
            }}</span></RouterLink>
          <RouterLink v-if="canAccess('FEEDBACK')" class="nav-link" :to="{name: 'Feedback'}"><i class="pi pi-comments"/><span>{{
              t('feedback.nav')
            }}</span></RouterLink>
          <RouterLink v-if="canAccess('SUBDOMAINS')" class="nav-link" :to="{name: 'Subdomain Register'}"><i
              class="pi pi-sitemap"/><span>{{
              t('subdomain.nav')
            }}</span></RouterLink>
        </div>

        <div class="navbar-actions">
          <SubdomainSwitcher v-if="canAccess('SUBDOMAINS')"/>
          <LanguageSelect/>
          <ThemeToggle/>
          <span class="navbar-divider"/>
          <div class="profile-copy">
            <strong>{{ userName }}</strong>
            <span>{{ authStore.userLogged?.email }}</span>
          </div>
          <div class="avatar">{{ userInitials }}</div>
          <Button icon="pi pi-sign-out" text rounded :aria-label="t('demands.logout')" @click="logout"/>
        </div>
      </nav>
    </header>

    <main class="workspace">
      <header class="desk-header">
        <div>
          <p class="edition">{{ t('demands.personalPanel') }} <span>/</span> {{ todayLabel }}</p>
          <h1>{{ t('demands.heading') }}<br><em>{{ t('demands.headingEmphasis') }}</em></h1>
        </div>
        <div class="header-aside">
          <p>{{ t('demands.intro') }}</p>
          <form class="search-form demand-search" role="search" @submit.prevent="searchDemands">
            <InputText
                v-model="searchTerm"
                type="search"
                :placeholder="t('demands.searchPlaceholder')"
                :aria-label="t('demands.search')"
                class="search-input"
            />
            <Button
                icon="pi pi-search"
                type="submit"
                :aria-label="t('demands.search')"
                :loading="demandStore.isLoading && isSearching"
            />
            <Button
                v-if="searchTerm"
                icon="pi pi-times"
                type="button"
                text
                :aria-label="t('demands.clearSearch')"
                :disabled="demandStore.isLoading"
                @click="clearSearch"
            />
          </form>
          <Button :label="t('demands.register')" icon="pi pi-plus" class="new-demand-button"
                  @click="openDemandCreation"/>
        </div>
      </header>

      <section class="pulse" :aria-label="t('demands.currentSlice')">
        <div class="pulse-label">
          <span class="live-dot"/>
          <strong>{{ t('demands.currentSlice') }}</strong>
        </div>
        <dl>
          <div>
            <dt>{{ t('demands.items') }}</dt>
            <dd>{{ demandStore.demands.length }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.ongoing') }}</dt>
            <dd>{{ ongoingCount }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.urgent') }}</dt>
            <dd>{{ urgentCount }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.overdue') }}</dt>
            <dd>{{ overdueCount }}</dd>
          </div>
          <div>
            <dt>{{ t('demands.closed') }}</dt>
            <dd>{{ doneCount }}</dd>
          </div>
        </dl>
      </section>

      <section :class="['content-grid', {'editing-grid': editingDemandId}]">
        <section id="demands-list" class="list-board">
          <div class="section-heading list-heading">
            <div>
              <p class="kicker">{{ t('demands.boardKicker') }}</p>
              <h2>{{ t('demands.boardTitle') }}</h2>
            </div>
            <div class="list-heading-actions">
              <Select
                  v-model="selectedPriorityFilter"
                  :options="priorityFilterOptions"
                  option-label="label"
                  option-value="value"
                  :placeholder="t('demands.filterByPriority')"
                  :aria-label="t('demands.filterByPriority')"
                  class="status-filter"
                  @change="applyFilters"
              />
              <Button
                  icon="pi pi-refresh"
                  text
                  rounded
                  :aria-label="t('demands.refresh')"
                  :loading="demandStore.isLoading"
                  @click="loadDemands(0)"
              />
            </div>
          </div>

          <div v-if="demandStore.isLoading" class="empty-state">
            <i class="pi pi-spin pi-spinner"/>
            <span>{{ t('demands.loading') }}</span>
          </div>

          <div v-else-if="demandStore.demands.length === 0" class="empty-state">
            <strong>{{ t('demands.emptyTitle') }}</strong>
            <span>{{ t('demands.emptyDescription') }}</span>
          </div>

          <div v-else class="kanban-board" :aria-label="t('demands.boardTitle')">
            <section
                v-for="column in boardColumns"
                :key="column.status"
                :class="['kanban-column', `column-${column.status.toLowerCase()}`, {
                  'is-drop-target': dropTargetStatus === column.status,
                }]"
                @dragover.prevent="setDropTarget(column.status)"
                @dragleave.self="clearDropTarget(column.status)"
                @drop.prevent="dropDemand(column.status)"
            >
              <header class="kanban-column-header">
                <div>
                  <span class="column-indicator"/>
                  <h3>{{ column.label }}</h3>
                  <span class="column-count">{{ column.demands.length }}</span>
                </div>
                <Button
                    icon="pi pi-plus"
                    text
                    rounded
                    :aria-label="`${t('demands.addToColumn')} ${column.label}`"
                    @click="prepareDemandForStatus(column.status)"
                />
              </header>

              <div class="kanban-card-list" @scroll.passive="handleColumnScroll(column.status, $event)">
                <p v-if="column.demands.length === 0" class="column-empty">
                  {{ t('demands.emptyColumn') }}
                </p>
                <article
                    v-for="demand in column.demands"
                    :key="demand.id"
                    :class="['kanban-card', {'is-moving': movingDemandId === demand.id}]"
                    draggable="true"
                    tabindex="0"
                    role="button"
                    :aria-label="`${t('demands.viewDetails')}: ${demand.title}`"
                    @dragstart="startDragging(demand, $event)"
                    @dragend="finishDragging"
                    @click="openDemandDetails(demand)"
                    @keydown.enter.self="openDemandDetails(demand)"
                    @keydown.space.self.prevent="openDemandDetails(demand)"
                >
                  <div class="card-topline">
                    <span :class="['priority-mark', `priority-${demand.priority.toLowerCase()}`]">
                      {{ priorityLabels[demand.priority] }}
                    </span>
                    <div class="card-actions">
                      <Button
                          v-if="canAccess('SUBDOMAINS')"
                          icon="pi pi-sitemap"
                          text
                          rounded
                          :aria-label="t('demands.changeSubdomain')"
                          @click.stop="openChangeSubdomainDialog(demand)"
                      />
                      <Button icon="pi pi-pencil" text rounded :aria-label="t('demands.edit')"
                              @click.stop="startEditing(demand)"/>
                      <Button icon="pi pi-trash" text rounded severity="danger" :aria-label="t('demands.delete')"
                              @click.stop="confirmDeletion(demand)"/>
                    </div>
                  </div>
                  <h4>{{ demand.title }}</h4>
                  <p class="card-description">{{ demand.description }}</p>
                  <p v-if="demand.observationsToReview" class="review-note">
                    <i class="pi pi-bookmark-fill"/>{{ demand.observationsToReview }}
                  </p>
                  <footer class="kanban-card-footer">
                    <span :class="{'is-overdue': isDemandOverdue(demand)}">
                      <i class="pi pi-calendar"/>{{ formatDeadline(demand.deadline) }}
                    </span>
                    <span v-if="demand.observations.length" :title="t('demands.observations')">
                      <i class="pi pi-comment"/>{{ demand.observations.length }}
                    </span>
                  </footer>
                </article>
                <p v-if="isStatusLoading(column.status)" class="column-loading">
                  <i class="pi pi-spin pi-spinner"/>
                  <span>{{ t('demands.loading') }}</span>
                </p>
              </div>
            </section>
          </div>
        </section>

        <aside v-if="editingDemandId" ref="formCard" class="intake">
          <div class="intake-heading">
            <p class="kicker">{{ t('demands.editKicker') }}</p>
            <h2>{{ t('demands.edit') }}</h2>
            <p>{{ t('demands.editDescription') }}</p>
          </div>

          <form class="demand-form" @submit.prevent="saveDemand">
            <label>
              <span>{{ t('demands.title') }}</span>
              <InputText v-model="form.title" :placeholder="t('demands.titlePlaceholder')" required fluid/>
            </label>

            <label>
              <span>{{ t('demands.description') }}</span>
              <Textarea
                  v-model="form.description"
                  :placeholder="t('demands.descriptionPlaceholder')"
                  rows="5"
                  required
                  fluid
              />
            </label>

            <label>
              <span>{{ t('demands.reviewNote') }} <small>{{ t('demands.optional') }}</small></span>
              <Textarea
                  v-model="form.observationToReview"
                  :placeholder="t('demands.reviewNotePlaceholder')"
                  rows="4"
                  fluid
              />
            </label>

            <fieldset class="observations-fieldset">
              <legend>{{ t('demands.observations') }} <small>{{ t('demands.optional') }}</small></legend>
              <div v-for="(_, index) in form.observations" :key="index" class="observation-input-row">
                <Textarea
                    v-model="form.observations[index]"
                    :placeholder="t('demands.observationPlaceholder')"
                    rows="3"
                    fluid
                />
                <Button
                    type="button"
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    :aria-label="t('demands.removeObservation')"
                    @click="removeEditObservation(index)"
                />
              </div>
              <Button
                  type="button"
                  :label="t('demands.addObservation')"
                  icon="pi pi-plus"
                  text
                  class="add-observation-button"
                  @click="addEditObservation"
              />
            </fieldset>

            <label>
              <span>{{ t('demands.deadline') }}</span>
              <InputText v-model="form.deadline" type="date" fluid/>
            </label>

            <label>
              <span>{{ t('demands.finalizedAt') }} <small>{{ t('demands.optional') }}</small></span>
              <InputText v-model="form.finalizedAt" type="date" fluid/>
            </label>

            <div class="form-row">
              <label>
                <span>{{ t('demands.status') }}</span>
                <Select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" fluid/>
              </label>
              <label>
                <span>{{ t('demands.priority') }}</span>
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
                :label="t('demands.save')"
                icon="pi pi-check"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="submit-button"
            />
            <Button
                type="button"
                :label="t('demands.cancelEdit')"
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
          <span>{{ t('demands.footerTagline') }}</span>
        </div>
      </div>
      <p>{{ t('demands.footerText') }}</p>
      <a href="#page-top">{{ t('demands.backToTop') }} <i class="pi pi-arrow-up"/></a>
    </footer>

    <Teleport to="body">
      <Transition name="delete-modal">
        <div
            v-if="selectedDemand"
            class="delete-modal-backdrop"
            role="presentation"
            @click.self="closeDemandDetails"
        >
          <section
              ref="detailsModal"
              class="delete-modal details-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="details-modal-title"
              tabindex="-1"
          >
            <header class="delete-modal-header">
              <div>
                <p class="kicker">{{ t('demands.detailsKicker') }}</p>
                <h2 id="details-modal-title">{{ selectedDemand.title }}</h2>
              </div>
              <button class="delete-modal-close" type="button" :aria-label="t('demands.close')"
                      @click="closeDemandDetails">
                <i class="pi pi-times"/>
              </button>
            </header>

            <div class="details-modal-content">
              <div class="details-stamps">
                <span :class="['status-stamp', `status-${selectedDemand.status.toLowerCase()}`]">
                  {{ statusLabels[selectedDemand.status] }}
                </span>
                <span :class="['priority-mark', `priority-${selectedDemand.priority.toLowerCase()}`]">
                  {{ priorityLabels[selectedDemand.priority] }}
                </span>
              </div>

              <section>
                <h3>{{ t('demands.description') }}</h3>
                <p>{{ selectedDemand.description }}</p>
              </section>

              <section v-if="selectedDemand.observationsToReview">
                <h3>{{ t('demands.reviewNote') }}</h3>
                <p>{{ selectedDemand.observationsToReview }}</p>
              </section>

              <section class="details-observations">
                <h3>{{ t('demands.observations') }}</h3>
                <ul v-if="selectedDemand.observations.length" class="observations-list">
                  <li
                      v-for="observation in selectedDemand.observations"
                      :key="`${observation.createdAt}:${observation.textObservation}`"
                  >
                    <span>{{ observation.textObservation }}</span>
                    <time :datetime="observation.createdAt">{{ formatDate(observation.createdAt) }}</time>
                  </li>
                </ul>
                <p v-else class="empty-observations">{{ t('demands.noObservations') }}</p>

                <form class="new-observation-form" @submit.prevent="addObservationToSelectedDemand">
                  <div
                      v-for="(_, index) in newObservationTexts"
                      :key="index"
                      class="observation-input-row"
                  >
                    <Textarea
                        v-model="newObservationTexts[index]"
                        :placeholder="t('demands.observationPlaceholder')"
                        rows="3"
                        required
                        fluid
                    />
                    <Button
                        v-if="newObservationTexts.length > 1"
                        type="button"
                        icon="pi pi-trash"
                        text
                        severity="danger"
                        :aria-label="t('demands.removeObservation')"
                        @click="removeNewObservation(index)"
                    />
                  </div>
                  <Button
                      type="button"
                      :label="t('demands.addAnotherObservation')"
                      icon="pi pi-plus"
                      text
                      class="add-another-observation"
                      @click="addNewObservation"
                  />
                  <Button
                      type="submit"
                      :label="t('demands.saveObservations')"
                      icon="pi pi-plus"
                      :loading="isAddingObservation"
                      :disabled="isAddingObservation || !hasNewObservations"
                  />
                </form>
              </section>

              <dl class="details-meta">
                <div>
                  <dt>{{ t('demands.deadline') }}</dt>
                  <dd><i class="pi pi-calendar"/>{{ formatDeadline(selectedDemand.deadline) }}</dd>
                </div>
                <div>
                  <dt>{{ t('demands.createdAt') }}</dt>
                  <dd><i class="pi pi-clock"/>{{ formatDate(selectedDemand.createdAt) }}</dd>
                </div>
                <div>
                  <dt>{{ t('demands.updatedAt') }}</dt>
                  <dd><i class="pi pi-history"/>{{ formatUpdatedAt(selectedDemand.updatedAt) }}</dd>
                </div>
                <div>
                  <dt>{{ t('demands.finalizedAt') }}</dt>
                  <dd><i class="pi pi-check-circle"/>{{ formatOptionalDate(selectedDemand.finalizedAt) }}</dd>
                </div>
              </dl>
            </div>

            <footer class="delete-modal-footer">
              <button class="modal-button secondary" type="button" @click="closeDemandDetails">
                {{ t('demands.close') }}
              </button>
              <button class="modal-button edit" type="button" @click="editSelectedDemand">
                <i class="pi pi-pencil"/>
                {{ t('demands.edit') }}
              </button>
              <button class="modal-button destructive" type="button" @click="deleteSelectedDemand">
                <i class="pi pi-trash"/>
                {{ t('demands.remove') }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>

      <Transition name="delete-modal">
        <div
            v-if="demandToChangeSubdomain"
            class="delete-modal-backdrop"
            role="presentation"
            @click.self="closeChangeSubdomainDialog"
        >
          <section
              ref="changeSubdomainModal"
              class="delete-modal change-subdomain-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="change-subdomain-modal-title"
              aria-describedby="change-subdomain-modal-description"
              tabindex="-1"
          >
            <header class="delete-modal-header">
              <div>
                <p class="kicker">{{ t('demands.changeSubdomainKicker') }}</p>
                <h2 id="change-subdomain-modal-title">{{ t('demands.changeSubdomainTitle') }}</h2>
              </div>
              <button
                  class="delete-modal-close"
                  type="button"
                  :aria-label="t('demands.close')"
                  :disabled="isChangingSubdomain"
                  @click="closeChangeSubdomainDialog"
              >
                <i class="pi pi-times"/>
              </button>
            </header>

            <div class="change-subdomain-content">
              <p id="change-subdomain-modal-description">
                {{ t('demands.changeSubdomainDescription') }} <strong>{{ demandToChangeSubdomain.title }}</strong>.
              </p>
              <label>
                <span>{{ t('demands.destinationSubdomain') }}</span>
                <Select
                    v-model="destinationSubdomainId"
                    :options="destinationSubdomainOptions"
                    option-label="label"
                    option-value="value"
                    :placeholder="t('demands.selectDestinationSubdomain')"
                    :disabled="isChangingSubdomain"
                    fluid
                />
              </label>
            </div>

            <footer class="delete-modal-footer">
              <button class="modal-button secondary" type="button" :disabled="isChangingSubdomain"
                      @click="closeChangeSubdomainDialog">
                {{ t('demands.cancel') }}
              </button>
              <button
                  class="modal-button edit"
                  type="button"
                  :disabled="isChangingSubdomain || !destinationSubdomainId"
                  @click="changeDemandSubdomain"
              >
                <i :class="isChangingSubdomain ? 'pi pi-spin pi-spinner' : 'pi pi-sitemap'"/>
                {{ isChangingSubdomain ? t('demands.changingSubdomain') : t('demands.confirmSubdomainChange') }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>

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
                <p class="kicker">{{ t('demands.deleteKicker') }}</p>
                <h2 id="delete-modal-title">{{ t('demands.deleteTitle') }}</h2>
              </div>
              <button class="delete-modal-close" type="button" :aria-label="t('demands.close')" :disabled="isDeleting"
                      @click="closeDeleteDialog">
                <i class="pi pi-times"/>
              </button>
            </header>

            <div class="delete-modal-content">
              <span class="delete-modal-icon"><i class="pi pi-trash"/></span>
              <div>
                <strong>{{ t('demands.deleteQuestion') }}</strong>
                <p id="delete-modal-description">
                  {{ t('demands.deleteDescriptionStart') }} <b>{{ demandToDelete?.title }}</b>
                  {{ t('demands.deleteDescriptionEnd') }}
                </p>
              </div>
            </div>

            <footer class="delete-modal-footer">
              <button class="modal-button secondary" type="button" :disabled="isDeleting" @click="closeDeleteDialog">
                {{ t('demands.keep') }}
              </button>
              <button class="modal-button destructive" type="button" :disabled="isDeleting" @click="deleteDemand">
                <i :class="isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'"/>
                {{ isDeleting ? t('demands.deleting') : t('demands.remove') }}
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import {useToast} from 'primevue/usetoast';
import ThemeToggle from '@/components/ThemeToggle.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import SubdomainSwitcher from '@/components/SubdomainSwitcher.vue';
import {useLanguage} from '@/composables/use-language.ts';
import router from '@/router';
import {useAuthStore} from '@/stores/auth-store.ts';
import {useDemandStore} from '@/stores/demand-store.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import {
  getDefaultAuthorizedRouteName,
  hasStoredPlanResource,
  type PlanResource
} from '@/composables/use-plan-resources.ts';
import type {Demand, DemandPriority, DemandStatus, EditDemand} from '@/types/demands/Demand.ts';
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';

type DemandForm = {
  title: string;
  description: string;
  deadline: string | null;
  status: DemandStatus;
  priority: DemandPriority;
  observationToReview: string | null;
  observations: string[];
  finalizedAt: string | null;
};

const toast = useToast();
const isSubmitting = ref(false);
const isDeleting = ref(false);
const isAddingObservation = ref(false);
const isChangingSubdomain = ref(false);
const newObservationTexts = ref<string[]>(['']);
const isInitializingSubdomains = ref(false);
const isDeleteDialogVisible = ref(false);
const demandToDelete = ref<Demand | null>(null);
const deleteModal = ref<HTMLElement | null>(null);
const selectedDemand = ref<Demand | null>(null);
const detailsModal = ref<HTMLElement | null>(null);
const demandToChangeSubdomain = ref<Demand | null>(null);
const destinationSubdomainId = ref<string | null>(null);
const changeSubdomainModal = ref<HTMLElement | null>(null);
const authStore = useAuthStore();
const demandStore = useDemandStore();
const subdomainStore = useSubdomainStore();
const defaultRouteName = getDefaultAuthorizedRouteName();
const canAccess = (resource: PlanResource) => hasStoredPlanResource(resource);
const formCard = ref<HTMLElement | null>(null);
const editingDemandId = ref<string | null>(null);
const searchTerm = ref('');
const isSearching = ref(false);
const movingDemandId = ref<string | null>(null);
const draggedDemand = ref<Demand | null>(null);
const dropTargetStatus = ref<DemandStatus | null>(null);
const {language, t} = useLanguage();

const boardStatusOrder: DemandStatus[] = ['PENDING', 'ONGOING', 'BLOCKED', 'DONE'];

const statusLabels = computed<Record<DemandStatus, string>>(() => ({
  PENDING: t('status.PENDING'),
  ONGOING: t('status.ONGOING'),
  BLOCKED: t('status.BLOCKED'),
  DONE: t('status.DONE'),
}));

const priorityLabels = computed<Record<DemandPriority, string>>(() => ({
  LOW: t('priority.LOW'),
  MEDIUM: t('priority.MEDIUM'),
  HIGH: t('priority.HIGH'),
  URGENT: t('priority.URGENT'),
}));

const statusOptions = computed(() => Object.entries(statusLabels.value).map(([value, label]) => ({value, label})));
const priorityOptions = computed(() => Object.entries(priorityLabels.value).map(([value, label]) => ({value, label})));
const priorityFilterOptions = computed(() => [
  {value: 'ALL', label: t('demands.allPriorities')},
  ...priorityOptions.value,
]);
const selectedPriorityFilter = ref<DemandPriority | 'ALL'>('ALL');
const boardColumns = computed(() => boardStatusOrder.map((status) => ({
  status,
  label: statusLabels.value[status],
  demands: demandStore.demands.filter((demand) => demand.status === status),
})));
const destinationSubdomainOptions = computed(() => subdomainStore.subdomains
    .filter((subdomain) => subdomain.id
        && subdomain.id !== demandToChangeSubdomain.value?.subdomainId
        && subdomain.id !== subdomainStore.selectedSubdomainId)
    .map((subdomain) => ({value: subdomain.id as string, label: subdomain.name})));

const emptyForm = (): DemandForm => ({
  title: '',
  description: '',
  deadline: null,
  status: 'PENDING',
  priority: 'MEDIUM',
  observationToReview: null,
  observations: [],
  finalizedAt: null
});

const form = reactive<DemandForm>(emptyForm());

const userName = computed(() => {
  const user = authStore.userLogged;
  return user ? `${user.firstName} ${user.lastName}` : t('demands.user');
});
const userInitials = computed(() => {
  const user = authStore.userLogged;
  return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'WH';
});
const todayLabel = computed(() => new Intl.DateTimeFormat(language.value, {
  day: '2-digit',
  month: 'long'
}).format(new Date()));
const ongoingCount = computed(() => demandStore.demands.filter(({status}) => status === 'ONGOING').length);
const urgentCount = computed(() => demandStore.demands.filter(({priority}) => priority === 'URGENT').length);
const doneCount = computed(() => demandStore.demands.filter(({status}) => status === 'DONE').length);
const overdueCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return demandStore.demands.filter(({deadline, status}) => deadline && deadline < today && status !== 'DONE').length;
});

const loadDemands = async (page = 0) => {
  const result = await demandStore.fetchDemands(page);

  if (result.httpStatusCode === 403) {
    await router.replace({name: 'Access Denied'});
    return;
  }

  if (result.isError) {
    showErrorToast(toast, t('demands.loadError'));
  }
};

const isStatusLoading = (status: DemandStatus) => demandStore.statusPages[status].isLoading;

const loadNextStatusPage = async (status: DemandStatus) => {
  const statusPage = demandStore.statusPages[status];

  if (demandStore.isLoading || statusPage.isLoading || !statusPage.canGoForward)
    return;

  const result = await demandStore.fetchDemandsByStatus(status, statusPage.currentPage + 1, true);

  if (result.httpStatusCode === 403) {
    await router.replace({name: 'Access Denied'});
    return;
  }

  if (result.isError)
    showErrorToast(toast, t('demands.loadError'));
};

const handleColumnScroll = (status: DemandStatus, event: Event) => {
  const target = event.currentTarget as HTMLElement;
  const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;

  if (distanceToBottom <= 80)
    void loadNextStatusPage(status);
};

const applyFilters = () => {
  demandStore.statusFilter = null;
  demandStore.priorityFilter = selectedPriorityFilter.value === 'ALL' ? null : selectedPriorityFilter.value;
  searchTerm.value = '';
  return loadDemands(0);
};

const prepareDemandForStatus = (status: DemandStatus) => {
  void router.push({name: 'Demand Create', query: {status}});
};

const openDemandCreation = () => router.push({name: 'Demand Create'});

const startDragging = (demand: Demand, event: DragEvent) => {
  draggedDemand.value = demand;
  movingDemandId.value = demand.id;
  event.dataTransfer?.setData('text/plain', demand.id);
  if (event.dataTransfer)
    event.dataTransfer.effectAllowed = 'move';
};

const finishDragging = () => {
  draggedDemand.value = null;
  movingDemandId.value = null;
  dropTargetStatus.value = null;
};

const setDropTarget = (status: DemandStatus) => {
  if (draggedDemand.value && draggedDemand.value.status !== status)
    dropTargetStatus.value = status;
};

const clearDropTarget = (status: DemandStatus) => {
  if (dropTargetStatus.value === status)
    dropTargetStatus.value = null;
};

const dropDemand = async (status: DemandStatus) => {
  const demand = draggedDemand.value;
  finishDragging();

  if (!demand || demand.status === status)
    return;

  movingDemandId.value = demand.id;
  const result = await demandStore.editDemand(demand.id, demandToEditPayload(demand, status));
  movingDemandId.value = null;

  if (result.isError) {
    showErrorToast(toast, t('demands.moveError'));
    return;
  }

  demand.status = status;
  showSuccessToast(toast, t('demands.moveSuccess'));
};

const demandToEditPayload = (demand: Demand, status: DemandStatus): EditDemand => ({
  title: demand.title,
  description: demand.description,
  deadline: demand.deadline,
  status,
  priority: demand.priority,
  observationsToReview: demand.observationsToReview ?? null,
  finalizedAt: demand.finalizedAt,
  observations: {
    textObservations: demand.observations.map((observation) => observation.textObservation),
  },
});

const searchDemands = async () => {
  const title = searchTerm.value.trim();

  if (!title) {
    await loadDemands(0);
    return;
  }

  isSearching.value = true;
  const result = await demandStore.searchDemand(title);
  isSearching.value = false;

  if (result.isError) {
    if (typeof result.response !== 'string')
      return;

    showErrorToast(toast, result.response);
    return;
  }

  if (typeof result.response === 'string')
    showSuccessToast(toast, result.response);
};

const clearSearch = async () => {
  searchTerm.value = '';
  await loadDemands(0);
};

const saveDemand = async () => {
  const demandId = editingDemandId.value;
  if (isSubmitting.value || !demandId)
    return;

  isSubmitting.value = true;
  const result = await demandStore.editDemand(demandId, toEditDemand());

  if (result.isError) {
    showErrorToast(toast, result.response);
    isSubmitting.value = false;
    return;
  }

  cancelEditing();
  showSuccessToast(toast, result.response);
  await loadDemands(0);
  isSubmitting.value = false;
};

const toEditDemand = (): EditDemand => ({
  title: form.title.trim(),
  description: form.description.trim(),
  deadline: form.deadline,
  status: form.status,
  priority: form.priority,
  observationsToReview: form.observationToReview?.trim() || null,
  finalizedAt: parseInputDate(form.finalizedAt),
  observations: {
    textObservations: form.observations.map((observation) => observation.trim()).filter(Boolean),
  },
});

const addEditObservation = () => form.observations.push('');

const removeEditObservation = (index: number) => form.observations.splice(index, 1);

const startEditing = (demand: Demand) => {
  editingDemandId.value = demand.id;
  Object.assign(form, {
    title: demand.title,
    description: demand.description,
    deadline: demand.deadline,
    status: demand.status,
    priority: demand.priority,
    observationToReview: demand.observationsToReview ?? null,
    observations: demand.observations.map((observation) => observation.textObservation),
    finalizedAt: toInputDate(demand.finalizedAt)
  });
  focusForm();
};

const cancelEditing = () => {
  editingDemandId.value = null;
  Object.assign(form, emptyForm());
};

const openChangeSubdomainDialog = async (demand: Demand) => {
  demandToChangeSubdomain.value = demand;
  destinationSubdomainId.value = null;
  await nextTick();
  changeSubdomainModal.value?.focus();
};

const closeChangeSubdomainDialog = () => {
  if (isChangingSubdomain.value)
    return;

  demandToChangeSubdomain.value = null;
  destinationSubdomainId.value = null;
};

const changeDemandSubdomain = async () => {
  const demand = demandToChangeSubdomain.value;
  const subdomainId = destinationSubdomainId.value;
  if (!demand || !subdomainId || isChangingSubdomain.value)
    return;

  isChangingSubdomain.value = true;
  const result = await demandStore.changeDemandSubdomain(demand.id, subdomainId);

  if (result.isError) {
    showErrorToast(toast, result.response);
    isChangingSubdomain.value = false;
    return;
  }

  showSuccessToast(toast, result.response);
  isChangingSubdomain.value = false;
  closeChangeSubdomainDialog();
  await loadDemands(0);
};

const confirmDeletion = async (demand: Demand) => {
  demandToDelete.value = demand;
  isDeleteDialogVisible.value = true;
  await nextTick();
  deleteModal.value?.focus();
};

const openDemandDetails = async (demand: Demand) => {
  selectedDemand.value = demand;
  newObservationTexts.value = [''];
  await nextTick();
  detailsModal.value?.focus();
};

const closeDemandDetails = () => {
  selectedDemand.value = null;
  newObservationTexts.value = [''];
};

const hasNewObservations = computed(() => newObservationTexts.value.some((text) => text.trim()));

const addNewObservation = () => {
  newObservationTexts.value.push('');
};

const removeNewObservation = (index: number) => {
  newObservationTexts.value.splice(index, 1);
};

const addObservationToSelectedDemand = async () => {
  const demand = selectedDemand.value;
  const textObservations = newObservationTexts.value.map((text) => text.trim()).filter(Boolean);
  if (!demand || !textObservations.length || isAddingObservation.value)
    return;

  isAddingObservation.value = true;
  const result = await demandStore.addObservation({demandId: demand.id, textObservations});

  if (result.isError) {
    showErrorToast(toast, result.response);
    isAddingObservation.value = false;
    return;
  }

  newObservationTexts.value = [''];
  showSuccessToast(toast, result.response);
  await loadDemands(0);
  selectedDemand.value = demandStore.demands.find(({id}) => id === demand.id) ?? demand;
  isAddingObservation.value = false;
};

const editSelectedDemand = () => {
  const demand = selectedDemand.value;
  if (!demand)
    return;

  closeDemandDetails();
  startEditing(demand);
};

const deleteSelectedDemand = () => {
  const demand = selectedDemand.value;
  if (!demand)
    return;

  closeDemandDetails();
  confirmDeletion(demand);
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

  showSuccessToast(toast, result.response);
  await loadDemands(0);
  isDeleting.value = false;
  closeDeleteDialog();
};

const closeDeleteDialogOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDemandDetails();
    closeDeleteDialog();
    closeChangeSubdomainDialog();
  }
};

const formatDeadline = (deadline: string | null) => {
  if (!deadline)
    return t('demands.noDeadline');

  return new Intl.DateTimeFormat(language.value, {timeZone: 'UTC'}).format(new Date(`${deadline}T00:00:00Z`));
};

const isDemandOverdue = (demand: Demand) => {
  const today = new Date().toISOString().slice(0, 10);
  return Boolean(demand.deadline && demand.deadline < today && demand.status !== 'DONE');
};

const formatDate = (date: string) => new Intl.DateTimeFormat(language.value).format(new Date(date));

const formatUpdatedAt = (date: string | null) => date
    ? new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      hour12: false,
      timeZone: 'America/Sao_Paulo',
    }).format(new Date(date))
    : t('demands.neverUpdated');

const formatOptionalDate = (date: Date | string | null) => {
  if (!date)
    return t('demands.notFinalized');

  if (typeof date === 'string' && isDateOnly(date))
    return formatDateOnly(date);

  return new Intl.DateTimeFormat(language.value).format(new Date(date));
};

const parseInputDate = (date: string | null) => date ? new Date(`${date}T00:00:00`) : null;

const toInputDate = (date: Date | string | null) => {
  if (!date)
    return null;

  if (typeof date === 'string' && isDateOnly(date))
    return date;

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().slice(0, 10);
};

const isDateOnly = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date);

const formatDateOnly = (date: string) =>
    new Intl.DateTimeFormat(language.value, {timeZone: 'UTC'}).format(new Date(`${date}T00:00:00Z`));

const focusForm = () => {
  formCard.value?.scrollIntoView({behavior: 'smooth', block: 'start'});
};

const logout = async () => {
  authStore.logout();
  await router.push({name: 'Login'});
};

watch(
    () => subdomainStore.selectedSubdomainId,
    () => {
      if (!canAccess('SUBDOMAINS') || isInitializingSubdomains.value)
        return;

      searchTerm.value = '';
      void loadDemands(0);
    },
);

onMounted(async () => {
  demandStore.statusFilter = null;

  if (canAccess('SUBDOMAINS')) {
    isInitializingSubdomains.value = true;
    await subdomainStore.fetchSubdomains();
    isInitializingSubdomains.value = false;
  }

  await loadDemands();
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
  --panel-strong-bg: #fbfbf7;
  --panel-strong-bg-hover: #f4f4ee;
  --panel-strong-field: #ffffff;
  --panel-strong-border: #d9dcd6;
  --panel-strong-heading: #26332f;
  --panel-strong-text: #65716c;
  --panel-strong-muted: #919a96;
  --panel-accent: #6e63d9;
  --panel-accent-hover: #5e53ca;
  --panel-accent-contrast: #ffffff;
  --footer-bg: #e7e7e1;
  --footer-heading: #26332f;
  --footer-text: #707a76;
  --footer-link: #5e53ca;
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
  width: min(360px, 100%);
  max-width: 360px;
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
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

.content-grid.editing-grid {
  grid-template-columns: minmax(0, 1fr) minmax(300px, 355px);
}

.list-board, .intake {
  border: 1px solid #dcddd8;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 252, 0.78);
  box-shadow: 0 15px 32px rgba(48, 66, 58, 0.05);
}

.list-board {
  min-width: 0;
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

.list-heading-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.search-form {
  display: flex;
  align-items: center;
  gap: 4px;
}

.demand-search {
  width: min(360px, 100%);
}

.search-input {
  width: 100%;
  min-width: 0;
}

.search-input {
  padding-block: 8px;
  font-size: 0.78rem;
}

.status-filter {
  min-width: 168px;
}

.status-filter :deep(.p-select-label) {
  padding-block: 8px;
  font-size: 0.78rem;
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

.kanban-board {
  display: grid;
  grid-auto-columns: minmax(260px, 1fr);
  grid-auto-flow: column;
  gap: 12px;
  padding: 16px;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  background: var(--wh-bg-subtle);
  scrollbar-color: var(--wh-border-strong) transparent;
}

.kanban-column {
  display: flex;
  min-width: 0;
  min-height: 520px;
  flex-direction: column;
  border: 1px solid var(--wh-border);
  border-radius: 10px;
  background: color-mix(in srgb, var(--wh-bg-subtle) 70%, var(--wh-surface));
  transition: border-color 140ms ease, background-color 140ms ease;
}

.kanban-column.is-drop-target {
  border-color: var(--wh-primary);
  background: color-mix(in srgb, var(--wh-primary-soft) 70%, var(--wh-surface));
  box-shadow: inset 0 0 0 1px var(--wh-primary);
}

.kanban-column-header,
.kanban-column-header > div,
.card-topline,
.card-actions,
.kanban-card-footer {
  display: flex;
  align-items: center;
}

.kanban-column-header {
  justify-content: space-between;
  min-height: 54px;
  padding: 9px 10px 9px 14px;
  border-bottom: 1px solid var(--wh-border);
}

.kanban-column-header > div {
  min-width: 0;
  gap: 8px;
}

.kanban-column-header h3 {
  overflow: hidden;
  color: var(--wh-text);
  font-size: 0.78rem;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.column-indicator {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border: 2px solid #8c959f;
  border-radius: 50%;
}

.column-ongoing .column-indicator {
  border-color: #2f81f7;
  background: #2f81f7;
}

.column-blocked .column-indicator {
  border-color: #cf222e;
  background: #cf222e;
}

.column-done .column-indicator {
  border-color: #1a7f37;
  background: #1a7f37;
}

.column-count {
  display: grid;
  min-width: 22px;
  height: 22px;
  place-items: center;
  padding: 0 6px;
  border-radius: 12px;
  color: var(--wh-text-soft);
  background: var(--wh-border);
  font-size: 0.68rem;
  font-weight: 700;
}

.kanban-column-header :deep(.p-button) {
  width: 30px;
  height: 30px;
  color: var(--wh-text-soft);
}

.kanban-card-list {
  display: grid;
  align-content: start;
  gap: 8px;
  flex: 1 1 auto;
  max-height: min(68vh, 720px);
  min-height: 180px;
  overflow-y: auto;
  padding: 8px;
  scrollbar-color: var(--wh-border-strong) transparent;
}

.column-empty,
.column-loading {
  padding: 28px 12px;
  color: var(--wh-text-muted);
  font-size: 0.75rem;
  line-height: 1.5;
  text-align: center;
}

.column-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-block: 14px;
}

.kanban-card {
  padding: 12px;
  border: 1px solid var(--wh-border-strong);
  border-radius: 8px;
  outline: 0;
  background: var(--wh-surface);
  box-shadow: 0 1px 0 rgba(31, 35, 40, 0.04);
  cursor: grab;
  transition: border-color 140ms ease, box-shadow 140ms ease, opacity 140ms ease, transform 140ms ease;
}

.kanban-card:hover,
.kanban-card:focus-visible {
  border-color: color-mix(in srgb, var(--wh-primary) 60%, var(--wh-border));
  box-shadow: 0 4px 12px rgba(31, 35, 40, 0.08);
  transform: translateY(-1px);
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.is-moving {
  opacity: 0.48;
}

.card-topline {
  min-height: 24px;
  justify-content: space-between;
  gap: 8px;
}

.card-actions {
  gap: 1px;
  margin: -6px -6px -5px 0;
  opacity: 0;
  transition: opacity 140ms ease;
}

.kanban-card:hover .card-actions,
.kanban-card:focus-within .card-actions {
  opacity: 1;
}

.card-actions :deep(.p-button) {
  width: 27px;
  height: 27px;
  color: var(--wh-text-muted);
}

.kanban-card h4 {
  margin: 8px 0 0;
  color: var(--wh-text);
  font-size: 0.88rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.kanban-card .card-description,
.kanban-card .review-note {
  display: -webkit-box;
  margin-top: 7px;
  overflow: hidden;
  color: var(--wh-text-soft);
  font-size: 0.75rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.kanban-card .review-note {
  color: #9a6700;
  -webkit-line-clamp: 1;
}

.kanban-card-footer {
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--wh-border);
  color: var(--wh-text-muted);
  font-size: 0.65rem;
}

.kanban-card-footer span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.kanban-card-footer .is-overdue {
  color: #cf222e;
  font-weight: 750;
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
  outline: 0;
  cursor: pointer;
  transition: background 160ms ease;
}

.demand-item:hover, .demand-item:focus-visible {
  background: #fbfcf6;
}

.demand-item:focus-visible {
  box-shadow: inset 3px 0 #6e63d9;
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
  background: var(--panel-strong-bg);
}

.intake-heading {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--panel-strong-border);
}

.intake-heading h2 {
  margin-top: 5px;
  color: var(--panel-strong-heading);
}

.intake-heading .kicker {
  color: var(--panel-accent);
}

.intake-heading p:last-child {
  margin-top: 8px;
  color: var(--panel-strong-text);
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
  color: var(--panel-strong-text);
  font-size: 0.71rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.demand-form small {
  color: var(--panel-strong-muted);
  font-size: 0.64rem;
}

.observations-fieldset {
  display: grid;
  gap: 10px;
  min-width: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--panel-strong-border);
  border-radius: 4px;
}

.observations-fieldset legend {
  padding: 0 5px;
  color: var(--panel-strong-text);
  font-size: 0.71rem;
  font-weight: 800;
}

.observation-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px;
  align-items: start;
}

.add-observation-button {
  width: fit-content;
  padding-inline: 0;
  color: var(--panel-accent);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.demand-form :deep(.p-inputtext), .demand-form :deep(.p-textarea), .demand-form :deep(.p-select) {
  width: 100%;
  border-color: var(--panel-strong-border);
  border-radius: 3px;
  color: var(--panel-strong-heading);
  background: var(--panel-strong-field);
  font-size: 0.8rem;
}

.demand-form :deep(.p-inputtext:enabled:focus), .demand-form :deep(.p-textarea:enabled:focus), .demand-form :deep(.p-select.p-focus) {
  border-color: var(--panel-accent);
  box-shadow: 0 0 0 3px rgba(110, 99, 217, 0.12);
}

.demand-form :deep(.p-select-label) {
  color: var(--panel-strong-heading);
}

.demand-form :deep(.p-inputtext::placeholder), .demand-form :deep(.p-textarea::placeholder) {
  color: var(--panel-strong-muted);
}

.submit-button {
  margin-top: 4px;
  color: var(--panel-accent-contrast);
  background: var(--panel-accent);
}

.submit-button:not(:disabled):hover {
  color: var(--panel-accent-contrast);
  background: var(--panel-accent-hover);
}

.cancel-button {
  color: var(--panel-strong-text);
}

.cancel-button:not(:disabled):hover {
  color: var(--panel-strong-heading);
  background: var(--panel-strong-bg-hover);
}

.site-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px clamp(18px, 5vw, 76px);
  color: var(--footer-text);
  background: var(--footer-bg);
}

.footer-brand {
  gap: 10px;
}

.footer-brand div {
  display: grid;
}

.footer-brand strong {
  color: var(--footer-heading);
  font-size: 0.9rem;
}

.footer-brand span, .site-footer p, .site-footer a {
  color: var(--footer-text);
  font-size: 0.7rem;
}

.site-footer a {
  color: var(--footer-link);
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

.details-modal {
  width: min(100%, 680px);
}

.details-modal-content {
  display: grid;
  gap: 20px;
  max-height: min(62dvh, 620px);
  padding: 22px;
  overflow-y: auto;
}

.details-stamps {
  display: flex;
  align-items: center;
  gap: 12px;
}

.details-modal-content h3 {
  color: #213b33;
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.details-modal-content p {
  margin-top: 7px;
  color: #63736d;
  font-size: 0.9rem;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.observations-list {
  display: grid;
  gap: 8px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.observations-list li {
  display: grid;
  gap: 5px;
  padding: 10px 12px;
  border-left: 3px solid #6e63d9;
  color: #52645d;
  background: #f3f2ed;
  font-size: 0.86rem;
  line-height: 1.5;
  white-space: pre-wrap;
}

.observations-list time {
  color: #84918b;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: normal;
}

.details-modal-content .empty-observations {
  color: #8a9690;
  font-size: 0.82rem;
}

.new-observation-form {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.new-observation-form :deep(.p-button) {
  justify-self: end;
}

.new-observation-form .add-another-observation {
  justify-self: start;
  padding-inline: 0;
}

.details-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.details-meta div {
  padding: 12px;
  border: 1px solid #e1e3de;
  background: #f6f6f1;
}

.details-meta dt {
  color: #8b9691;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.details-meta dd {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 7px 0 0;
  color: #42685d;
  font-size: 0.8rem;
  font-weight: 700;
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

.change-subdomain-content {
  display: grid;
  gap: 18px;
  padding: 22px;
}

.change-subdomain-content p {
  margin: 0;
  color: #748078;
  font-size: 0.86rem;
  line-height: 1.55;
}

.change-subdomain-content p strong {
  color: #213b33;
}

.change-subdomain-content label {
  display: grid;
  gap: 7px;
  color: #52645d;
  font-size: 0.72rem;
  font-weight: 800;
}

.change-subdomain-content :deep(.p-select) {
  width: 100%;
  border-color: #d9dcd6;
  border-radius: 3px;
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

.modal-button.edit {
  border-color: #6e63d9;
  color: #ffffff;
  background: #6e63d9;
}

.modal-button.edit:hover {
  border-color: #5e53ca;
  background: #5e53ca;
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

:global(.app-dark .demands-page) {
  --panel-strong-bg: #171b2b;
  --panel-strong-bg-hover: #111624;
  --panel-strong-field: #101522;
  --panel-strong-border: rgba(214, 220, 244, 0.16);
  --panel-strong-heading: #f7f5ef;
  --panel-strong-text: #c5ccdf;
  --panel-strong-muted: #8993ad;
  --panel-accent: #8876ff;
  --panel-accent-hover: #9d8dff;
  --panel-accent-contrast: #ffffff;
  --footer-bg: #101522;
  --footer-heading: #f7f5ef;
  --footer-text: #929cb4;
  --footer-link: #a496ff;
  color: #dbe3df;
  background: #0d1420;
}

:global(.app-dark .navbar) {
  border-color: rgba(214, 220, 244, 0.12);
  background: rgba(20, 27, 42, 0.94);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

:global(.app-dark .brand),
:global(.app-dark .nav-link:hover),
:global(.app-dark .nav-link.active),
:global(.app-dark h1),
:global(.app-dark h2),
:global(.app-dark .pulse dd),
:global(.app-dark .demand-item h3) {
  color: #e8efec;
}

:global(.app-dark .navbar-center),
:global(.app-dark .demand-actions .p-button:hover) {
  background: #111927;
}

:global(.app-dark .nav-link:hover),
:global(.app-dark .nav-link.active) {
  background: #202b3c;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
}

:global(.app-dark .navbar-divider),
:global(.app-dark .pulse dl div) {
  border-color: rgba(214, 220, 244, 0.13);
}

:global(.app-dark .navbar-divider) {
  background: rgba(214, 220, 244, 0.13);
}

:global(.app-dark .pulse) {
  border-color: rgba(214, 220, 244, 0.16);
}

:global(.app-dark .list-board),
:global(.app-dark .intake) {
  border-color: rgba(214, 220, 244, 0.14);
  background: rgba(20, 27, 42, 0.88);
  box-shadow: 0 15px 32px rgba(0, 0, 0, 0.14);
}

:global(.app-dark .list-heading),
:global(.app-dark .demand-item) {
  border-color: rgba(214, 220, 244, 0.12);
}

:global(.app-dark .demand-item:hover),
:global(.app-dark .pagination) {
  background: #111927;
}

:global(.app-dark .kanban-card .review-note) {
  color: #d29922;
}

:global(.app-dark .kanban-card-footer .is-overdue) {
  color: #ff7b72;
}

:global(.app-dark .delete-modal-backdrop) {
  background: rgba(4, 9, 17, 0.7);
}

:global(.app-dark .delete-modal) {
  border-color: rgba(214, 220, 244, 0.16);
  background: #171b2b;
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.32);
}

:global(.app-dark .delete-modal-header),
:global(.app-dark .delete-modal-footer) {
  border-color: rgba(214, 220, 244, 0.14);
}

:global(.app-dark .delete-modal-footer) {
  background: #111624;
}

:global(.app-dark .delete-modal-content strong) {
  color: #f7f5ef;
}

:global(.app-dark .delete-modal-content p) {
  color: #aab5c9;
}

:global(.app-dark .change-subdomain-content p),
:global(.app-dark .change-subdomain-content label) {
  color: #aab5c9;
}

:global(.app-dark .change-subdomain-content p strong) {
  color: #f7f5ef;
}

:global(.app-dark .change-subdomain-content .p-select) {
  border-color: rgba(214, 220, 244, 0.16);
  background: #101522;
}

:global(.app-dark .details-modal-content h3) {
  color: #f7f5ef;
}

:global(.app-dark .details-modal-content p) {
  color: #c5ccdf;
}

:global(.app-dark .observations-list li) {
  border-left-color: #8876ff;
  color: #dbe3df;
  background: #111624;
}

:global(.app-dark .observations-list time) {
  color: #8993ad;
}

:global(.app-dark .details-modal-content .empty-observations) {
  color: #8993ad;
}

:global(.app-dark .details-meta div) {
  border-color: rgba(214, 220, 244, 0.14);
  background: #111624;
}

:global(.app-dark .details-meta dd) {
  color: #aab5c9;
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

  .demand-search {
    width: 100%;
  }

  .nav-link {
    padding: 10px 12px;
  }

  .workspace {
    padding: 46px 16px 52px;
  }

  .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .list-heading-actions, .status-filter {
    width: 100%;
  }

  .list-heading-actions {
    justify-content: space-between;
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

  .kanban-board {
    grid-auto-columns: minmax(255px, 82vw);
    padding: 12px;
    scroll-snap-type: inline proximity;
  }

  .kanban-column {
    min-height: 430px;
    scroll-snap-align: start;
  }

  .card-actions {
    opacity: 1;
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

  .details-meta {
    grid-template-columns: 1fr;
  }

  .details-modal .delete-modal-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .details-modal .modal-button {
    justify-content: center;
  }
}
</style>
