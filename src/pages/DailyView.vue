<template>
  <div id="page-top" class="daily-page">
    <header class="site-header">
      <nav class="navbar" :aria-label="t('demands.mainNav')">
        <RouterLink :to="{name: defaultRouteName}" class="brand" aria-label="Workhub">
          <img src="/favicon.png" alt="" class="brand-logo">
          <span class="brand-copy">Work<span>hub</span></span>
        </RouterLink>

        <div class="navbar-center">
          <RouterLink v-if="canAccess('DEMANDS')" class="nav-link" :to="{name: 'Demands'}"><i
              class="pi pi-inbox"/><span>{{
              t('demands.nav')
            }}</span></RouterLink>
          <RouterLink v-if="canAccess('DAILY')" class="nav-link active" :to="{name: 'Daily'}"><i
              class="pi pi-calendar-clock"/><span>{{
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
          <p class="edition">{{ t('daily.personalPanel') }} <span>/</span> {{ todayLabel }}</p>
          <h1>{{ t('daily.heading') }}<br><em>{{ t('daily.headingEmphasis') }}</em></h1>
        </div>
        <div class="header-aside">
          <p>{{ t('daily.intro') }}</p>
          <Button :label="t('daily.register')" icon="pi pi-plus" class="new-daily-button" @click="focusForm"/>
        </div>
      </header>

      <section class="pulse" :aria-label="t('daily.currentSlice')">
        <div class="pulse-label">
          <span class="live-dot"/>
          <strong>{{ t('daily.currentSlice') }}</strong>
        </div>
        <dl>
          <div>
            <dt>{{ t('daily.items') }}</dt>
            <dd>{{ dailyStore.dailyRecords.length }}</dd>
          </div>
          <div>
            <dt>{{ t('daily.period') }}</dt>
            <dd>{{ selectedRangeLabel }}</dd>
          </div>
          <div>
            <dt>{{ t('daily.words') }}</dt>
            <dd>{{ wordsCount }}</dd>
          </div>
          <div>
            <dt>{{ t('daily.lastRecord') }}</dt>
            <dd>{{ lastRecordLabel }}</dd>
          </div>
        </dl>
      </section>

      <section class="content-grid">
        <section class="list-board">
          <div class="section-heading list-heading">
            <div>
              <p class="kicker">{{ t('daily.boardKicker') }}</p>
              <h2>{{ t('daily.boardTitle') }}</h2>
            </div>
            <div class="list-heading-actions">
              <label class="date-range-field">
                <span>{{ t('daily.startDate') }}</span>
                <InputText
                    v-model="startDate"
                    type="date"
                    class="date-filter"
                    :aria-label="t('daily.startDate')"
                    @change="loadDailyRecords"
                />
              </label>
              <label class="date-range-field">
                <span>{{ t('daily.endDate') }}</span>
                <InputText
                    v-model="endDate"
                    type="date"
                    class="date-filter"
                    :aria-label="t('daily.endDate')"
                    @change="loadDailyRecords"
                />
              </label>
              <Button
                  icon="pi pi-refresh"
                  text
                  rounded
                  :aria-label="t('daily.refresh')"
                  :loading="dailyStore.isLoading"
                  @click="loadDailyRecords"
              />
            </div>
          </div>

          <div v-if="dailyStore.isLoading" class="empty-state">
            <i class="pi pi-spin pi-spinner"/>
            <span>{{ t('daily.loading') }}</span>
          </div>

          <div v-else-if="sortedDailyRecords.length === 0" class="empty-state">
            <strong>{{ t('daily.emptyTitle') }}</strong>
            <span>{{ t('daily.emptyDescription') }}</span>
          </div>

          <div v-else class="daily-list">
            <article v-for="(daily, index) in sortedDailyRecords" :key="daily.id ?? `${daily.date}-${index}`"
                     class="daily-item">
              <span class="daily-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="daily-main">
                <div class="daily-title-row">
                  <h3>{{ formatDateOnly(daily.date) }}</h3>
                  <span class="date-stamp">{{ daily.date }}</span>
                </div>
                <p>{{ daily.summary }}</p>
                <div class="daily-meta">
                  <span><i class="pi pi-clock"/>{{ formatCreatedAt(daily.createdAt) }}</span>
                </div>
              </div>
            </article>
          </div>
        </section>

        <aside ref="formCard" class="intake">
          <div class="intake-heading">
            <p class="kicker">{{ t('daily.newKicker') }}</p>
            <h2>{{ t('daily.new') }}</h2>
            <p>{{ t('daily.newDescription') }}</p>
          </div>

          <form class="daily-form" @submit.prevent="saveDaily">
            <label>
              <span>{{ t('daily.date') }}</span>
              <InputText v-model="form.date" type="date" required fluid/>
            </label>

            <label>
              <span>{{ t('daily.summary') }}</span>
              <Textarea
                  v-model.trim="form.summary"
                  :placeholder="t('daily.summaryPlaceholder')"
                  rows="9"
                  required
                  fluid
              />
            </label>

            <Button
                type="submit"
                :label="t('daily.save')"
                icon="pi pi-check"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                class="submit-button"
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
          <span>{{ t('daily.footerTagline') }}</span>
        </div>
      </div>
      <p>{{ t('daily.footerText') }}</p>
      <a href="#page-top">{{ t('daily.backToTop') }} <i class="pi pi-arrow-up"/></a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref} from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import {useToast} from 'primevue/usetoast';
import ThemeToggle from '@/components/ThemeToggle.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import SubdomainSwitcher from '@/components/SubdomainSwitcher.vue';
import {useLanguage} from '@/composables/use-language.ts';
import router from '@/router';
import {useAuthStore} from '@/stores/auth-store.ts';
import {useDailyStore} from '@/stores/daily-store.ts';
import {
  getDefaultAuthorizedRouteName,
  hasStoredPlanResource,
  type PlanResource
} from '@/composables/use-plan-resources.ts';
import type {RegisterDaily} from '@/types/daily/Daily.ts';
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';

const toast = useToast();
const authStore = useAuthStore();
const dailyStore = useDailyStore();
const defaultRouteName = getDefaultAuthorizedRouteName();
const canAccess = (resource: PlanResource) => hasStoredPlanResource(resource);
const {language, t} = useLanguage();
const formCard = ref<HTMLElement | null>(null);
const isSubmitting = ref(false);

const dateInput = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
const todayInput = () => dateInput(new Date());
const weekRange = (date = new Date()) => {
  const start = new Date(date);
  const day = start.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - daysFromMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    startDate: dateInput(start),
    endDate: dateInput(end),
  };
};
const selectedWeek = weekRange();
const startDate = ref(selectedWeek.startDate);
const endDate = ref(selectedWeek.endDate);
const form = reactive<RegisterDaily>({
  date: todayInput(),
  summary: '',
});

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
  month: 'long',
}).format(new Date()));
const sortedDailyRecords = computed(() =>
    [...dailyStore.dailyRecords].sort((first, second) => second.date.localeCompare(first.date)),
);
const selectedRangeLabel = computed(() => `${formatDateOnly(startDate.value)} - ${formatDateOnly(endDate.value)}`);
const wordsCount = computed(() => dailyStore.dailyRecords.reduce((total, {summary}) => {
  const words = summary.trim().split(/\s+/).filter(Boolean);
  return total + words.length;
}, 0));
const lastRecordLabel = computed(() => {
  const latest = sortedDailyRecords.value[0];
  return latest ? formatDateOnly(latest.date) : '-';
});

const loadDailyRecords = async () => {
  const result = await dailyStore.fetchDailyRecords(startDate.value, endDate.value);

  if (result.httpStatusCode === 403) {
    await router.replace({name: 'Access Denied'});
    return;
  }

  if (result.isError && typeof result.response === 'string')
    showErrorToast(toast, result.response);
};

const saveDaily = async () => {
  if (isSubmitting.value)
    return;

  isSubmitting.value = true;
  const savedDate = form.date;
  const result = await dailyStore.registerDaily({
    date: savedDate,
    summary: form.summary,
  });

  if (result.isError) {
    showErrorToast(toast, result.response);
    isSubmitting.value = false;
    return;
  }

  showSuccessToast(toast, result.response || t('daily.registerSuccess'));
  const savedWeek = weekRange(new Date(`${savedDate}T00:00:00`));
  startDate.value = savedWeek.startDate;
  endDate.value = savedWeek.endDate;
  form.summary = '';
  form.date = todayInput();
  await loadDailyRecords();
  isSubmitting.value = false;
};

const formatDateOnly = (date: string) =>
    new Intl.DateTimeFormat(language.value, {timeZone: 'UTC'}).format(new Date(`${date}T00:00:00Z`));

const formatCreatedAt = (date?: string | null) => {
  if (!date)
    return t('daily.noCreatedAt');

  return new Intl.DateTimeFormat(language.value).format(new Date(date));
};

const focusForm = () => {
  formCard.value?.scrollIntoView({behavior: 'smooth', block: 'start'});
};

const logout = async () => {
  authStore.logout();
  await router.push({name: 'Login'});
};

onMounted(() => {
  loadDailyRecords();
});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
}

.daily-page {
  --panel-strong-bg: #fbfbf7;
  --panel-strong-bg-hover: #f4f4ee;
  --panel-strong-field: #ffffff;
  --panel-strong-border: #d9dcd6;
  --panel-strong-heading: #26332f;
  --panel-strong-text: #65716c;
  --panel-strong-muted: #919a96;
  --panel-accent: #377b67;
  --panel-accent-hover: #2d6b59;
  --panel-accent-contrast: #ffffff;
  --footer-bg: #e7e7e1;
  --footer-heading: #26332f;
  --footer-text: #707a76;
  --footer-link: #2d6b59;
  min-height: 100dvh;
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

.brand, .navbar-center, .navbar-actions, .profile-copy, .daily-meta, .footer-brand {
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
  font-weight: 900;
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

.desk-header, .section-heading, .daily-title-row {
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
  line-height: 0.88;
}

h1 em {
  color: #ef774c;
  font-weight: 400;
}

h2 {
  color: #173e32;
  font-family: Georgia, serif;
  font-size: 1.7rem;
  font-weight: 400;
}

.header-aside {
  display: grid;
  max-width: 280px;
  justify-items: start;
  gap: 20px;
  padding-top: 30px;
}

.header-aside p {
  color: #69766f;
  font-size: 0.91rem;
  line-height: 1.65;
}

.new-daily-button, .submit-button {
  border: 0;
  color: #dfff7a;
  background: #124b3a;
  font-weight: 800;
}

.new-daily-button:not(:disabled):hover, .submit-button:not(:disabled):hover {
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
  grid-template-columns: repeat(4, 1fr);
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
  font-size: 1.35rem;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
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

.date-range-field {
  display: grid;
  gap: 4px;
  color: #7b8882;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.list-heading :deep(.p-button) {
  color: #54746a;
}

.date-filter {
  width: 160px;
  padding-block: 8px;
  font-size: 0.78rem;
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

.daily-list {
  display: grid;
}

.daily-item {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr);
  gap: 14px;
  padding: 21px 24px;
  border-bottom: 1px solid #e2e3df;
}

.daily-index {
  color: #b7bdb7;
  font-family: Georgia, serif;
  font-size: 0.92rem;
}

.daily-main {
  min-width: 0;
}

.daily-title-row {
  justify-content: flex-start;
}

.daily-item h3 {
  color: #213b33;
  font-size: 0.96rem;
}

.daily-item p {
  margin-top: 8px;
  color: #63736d;
  font-size: 0.88rem;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.daily-meta {
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 12px;
  color: #9ba39e;
  font-size: 0.68rem;
}

.daily-meta span {
  display: flex;
  gap: 5px;
}

.date-stamp {
  display: inline-flex;
  align-items: center;
  padding: 6px 8px;
  border: 1px solid #377b67;
  border-radius: 2px;
  color: #377b67;
  font-size: 0.61rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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

.daily-form {
  display: grid;
  gap: 14px;
  margin-top: 22px;
}

.daily-form label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--panel-strong-text);
  font-size: 0.71rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.daily-form :deep(.p-inputtext), .daily-form :deep(.p-textarea) {
  width: 100%;
  border-color: var(--panel-strong-border);
  border-radius: 3px;
  color: var(--panel-strong-heading);
  background: var(--panel-strong-field);
  font-size: 0.8rem;
}

.daily-form :deep(.p-inputtext:enabled:focus), .daily-form :deep(.p-textarea:enabled:focus) {
  border-color: var(--panel-accent);
  box-shadow: 0 0 0 3px rgba(55, 123, 103, 0.12);
}

.daily-form :deep(.p-inputtext::placeholder), .daily-form :deep(.p-textarea::placeholder) {
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

:global(.app-dark .daily-page) {
  --panel-strong-bg: #171b2b;
  --panel-strong-bg-hover: #111624;
  --panel-strong-field: #101522;
  --panel-strong-border: rgba(214, 220, 244, 0.16);
  --panel-strong-heading: #f7f5ef;
  --panel-strong-text: #c5ccdf;
  --panel-strong-muted: #8993ad;
  --panel-accent: #54a38b;
  --panel-accent-hover: #66b89f;
  --panel-accent-contrast: #07140f;
  --footer-bg: #101522;
  --footer-heading: #f7f5ef;
  --footer-text: #929cb4;
  --footer-link: #70c6ac;
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
:global(.app-dark .daily-item h3) {
  color: #e8efec;
}

:global(.app-dark .navbar-center) {
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
:global(.app-dark .daily-item) {
  border-color: rgba(214, 220, 244, 0.12);
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

  .brand-copy, .profile-copy, .navbar-divider, .navbar-actions > :deep(.p-button:last-child), .nav-link span {
    display: none;
  }

  .nav-link {
    padding: 10px 12px;
  }

  .workspace {
    padding: 46px 16px 52px;
  }

  .desk-header, .list-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .list-heading-actions, .date-range-field, .date-filter {
    width: 100%;
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
    overflow-x: auto;
  }

  .pulse dl {
    min-width: 360px;
    grid-template-columns: repeat(4, auto);
  }

  .pulse dl div {
    display: grid;
    justify-content: start;
    gap: 3px;
    padding: 0 8px;
  }

  .daily-item {
    grid-template-columns: 24px minmax(0, 1fr);
    padding: 17px 15px;
  }

  .daily-title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
