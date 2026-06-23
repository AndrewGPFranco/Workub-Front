<template>
  <div id="page-top" class="subdomain-page">
    <header class="site-header">
      <nav class="navbar" :aria-label="t('demands.mainNav')">
        <RouterLink :to="{name: defaultRouteName}" class="brand" aria-label="Workhub">
          <img src="/favicon.png" alt="" class="brand-logo">
          <span class="brand-copy">Work<span>hub</span></span>
        </RouterLink>

        <div class="navbar-center">
          <RouterLink v-if="canAccess('DEMANDS')" class="nav-link" :to="{name: 'Demands'}"><i
              class="pi pi-inbox"/><span>{{ t('demands.nav') }}</span></RouterLink>
          <RouterLink v-if="canAccess('DAILY')" class="nav-link" :to="{name: 'Daily'}"><i class="pi pi-calendar-clock"/><span>{{
              t('daily.nav')
            }}</span></RouterLink>
          <RouterLink v-if="canAccess('FEEDBACK')" class="nav-link" :to="{name: 'Feedback'}"><i class="pi pi-comments"/><span>{{
              t('feedback.nav')
            }}</span></RouterLink>
          <RouterLink v-if="canAccess('SUBDOMAINS')" class="nav-link active" :to="{name: 'Subdomain Register'}"><i
              class="pi pi-sitemap"/><span>{{ t('subdomain.nav') }}</span></RouterLink>
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
          <p class="edition">{{ t('subdomain.panel') }} <span>/</span> {{ todayLabel }}</p>
          <h1>{{ t('subdomain.heading') }}<br><em>{{ t('subdomain.headingEmphasis') }}</em></h1>
        </div>
        <div class="header-aside">
          <p>{{ t('subdomain.intro') }}</p>
        </div>
      </header>

      <section class="content-grid">
        <section class="preview-board" aria-live="polite">
          <div class="section-heading">
            <div>
              <p class="kicker">{{ t('subdomain.previewKicker') }}</p>
              <h2>{{ t('subdomain.previewTitle') }}</h2>
            </div>
          </div>

          <article class="subdomain-preview">
            <div class="photo-preview">
              <img v-if="photoPreviewUrl" :src="photoPreviewUrl" :alt="form.name || t('subdomain.photoAlt')">
              <i v-else class="pi pi-building"/>
            </div>
            <div>
              <span class="status-pill"><i class="pi pi-check-circle"/>{{ t('subdomain.readyToRegister') }}</span>
              <h3>{{ form.name || t('subdomain.namePreview') }}</h3>
              <p>{{ t('subdomain.previewDescription') }}</p>
            </div>
          </article>
        </section>

        <aside class="intake">
          <div class="intake-heading">
            <p class="kicker">{{ t('subdomain.formKicker') }}</p>
            <h2>{{ t('subdomain.formTitle') }}</h2>
            <p>{{ t('subdomain.formDescription') }}</p>
          </div>

          <form class="subdomain-form" @submit.prevent="saveSubdomain">
            <label>
              <span>{{ t('subdomain.name') }}</span>
              <InputText
                  v-model="form.name"
                  :placeholder="t('subdomain.namePlaceholder')"
                  required
                  fluid
              />
            </label>

            <label>
              <span>{{ t('subdomain.urlPhoto') }} <small>{{ t('demands.optional') }}</small></span>
              <InputText
                  v-model="form.urlPhoto"
                  type="url"
                  :placeholder="t('subdomain.urlPhotoPlaceholder')"
                  fluid
              />
            </label>

            <Button
                type="submit"
                :label="t('subdomain.save')"
                icon="pi pi-check"
                :loading="isSubmitting"
                :disabled="isSubmitting || !form.name.trim()"
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
          <span>{{ t('subdomain.footerTagline') }}</span>
        </div>
      </div>
      <p>{{ t('subdomain.footerText') }}</p>
      <a href="#page-top">{{ t('demands.backToTop') }} <i class="pi pi-arrow-up"/></a>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {computed, reactive, ref} from 'vue';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import {useToast} from 'primevue/usetoast';
import ThemeToggle from '@/components/ThemeToggle.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import SubdomainSwitcher from '@/components/SubdomainSwitcher.vue';
import {useLanguage} from '@/composables/use-language.ts';
import router from '@/router';
import {useAuthStore} from '@/stores/auth-store.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import {
  getDefaultAuthorizedRouteName,
  hasStoredPlanResource,
  type PlanResource
} from '@/composables/use-plan-resources.ts';
import {showErrorToast, showSuccessToast} from '@/utils/toast.ts';
import type {RegisterSubdomain} from '@/types/subdomain/Subdomain.ts';

const toast = useToast();
const authStore = useAuthStore();
const subdomainStore = useSubdomainStore();
const defaultRouteName = getDefaultAuthorizedRouteName();
const canAccess = (resource: PlanResource) => hasStoredPlanResource(resource);
const {language, t} = useLanguage();
const isSubmitting = ref(false);

const form = reactive<RegisterSubdomain>({
  urlPhoto: null,
  name: '',
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
const photoPreviewUrl = computed(() => {
  const urlPhoto = form.urlPhoto?.trim();
  return urlPhoto || null;
});

const saveSubdomain = async () => {
  if (isSubmitting.value || !form.name.trim())
    return;

  isSubmitting.value = true;
  const result = await subdomainStore.registerSubdomain({
    name: form.name.trim(),
    urlPhoto: form.urlPhoto?.trim() || null,
  });

  if (result.httpStatusCode === 403) {
    isSubmitting.value = false;
    await router.replace({name: 'Access Denied'});
    return;
  }

  if (result.isError) {
    showErrorToast(toast, result.response);
    isSubmitting.value = false;
    return;
  }

  showSuccessToast(toast, result.response || t('subdomain.registerSuccess'));
  await subdomainStore.fetchSubdomains(true);
  const registeredSubdomain = subdomainStore.subdomains.find((subdomain) => subdomain.name === form.name.trim());

  if (registeredSubdomain)
    subdomainStore.selectSubdomain(registeredSubdomain.id ?? registeredSubdomain.name);

  form.name = '';
  form.urlPhoto = null;
  isSubmitting.value = false;
};

const logout = async () => {
  authStore.logout();
  await router.push({name: 'Login'});
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:global(html) {
  scroll-behavior: smooth;
}

.subdomain-page {
  --panel-strong-bg: #fbfbf7;
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

.brand, .navbar-center, .navbar-actions, .profile-copy, .footer-brand {
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

.brand-copy span, h1 em, .edition span {
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

.desk-header, .section-heading {
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
  max-width: 300px;
  justify-items: start;
  gap: 20px;
  padding-top: 30px;
}

.header-aside p {
  color: #69766f;
  font-size: 0.91rem;
  line-height: 1.65;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
  gap: 24px;
  align-items: start;
  margin-top: 52px;
}

.preview-board, .intake {
  border: 1px solid #dcddd8;
  border-radius: 4px;
  overflow: hidden;
  background: rgba(255, 255, 252, 0.78);
  box-shadow: 0 15px 32px rgba(48, 66, 58, 0.05);
}

.section-heading {
  padding: 22px 24px;
  border-bottom: 1px solid #dcddd8;
}

.section-heading .kicker {
  color: #377b67;
}

.subdomain-preview {
  display: grid;
  grid-template-columns: minmax(190px, 260px) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  padding: 28px;
}

.photo-preview {
  display: grid;
  aspect-ratio: 1;
  width: 100%;
  place-items: center;
  overflow: hidden;
  border: 1px solid #d8dbd5;
  border-radius: 4px;
  color: #377b67;
  background: #f8f8f3;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-preview i {
  font-size: 3rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border: 1px solid #377b67;
  border-radius: 3px;
  color: #377b67;
  font-size: 0.66rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.subdomain-preview h3 {
  margin-top: 18px;
  color: #213b33;
  font-family: Georgia, serif;
  font-size: 2.4rem;
  font-weight: 400;
  overflow-wrap: anywhere;
}

.subdomain-preview p {
  max-width: 520px;
  margin-top: 12px;
  color: #63736d;
  line-height: 1.65;
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

.subdomain-form {
  display: grid;
  gap: 14px;
  margin-top: 22px;
}

.subdomain-form label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--panel-strong-text);
  font-size: 0.71rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.subdomain-form small {
  color: var(--panel-strong-muted);
  font-weight: 700;
}

.subdomain-form :deep(.p-inputtext) {
  width: 100%;
  border-color: var(--panel-strong-border);
  border-radius: 3px;
  color: var(--panel-strong-heading);
  background: var(--panel-strong-field);
  font-size: 0.8rem;
}

.subdomain-form :deep(.p-inputtext:enabled:focus) {
  border-color: var(--panel-accent);
  box-shadow: 0 0 0 3px rgba(55, 123, 103, 0.12);
}

.subdomain-form :deep(.p-inputtext::placeholder) {
  color: var(--panel-strong-muted);
}

.submit-button {
  margin-top: 4px;
  border: 0;
  color: var(--panel-accent-contrast);
  background: var(--panel-accent);
  font-weight: 800;
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

:global(.app-dark .subdomain-page) {
  --panel-strong-bg: #171b2b;
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
:global(.app-dark .subdomain-preview h3) {
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

:global(.app-dark .navbar-divider) {
  background: rgba(214, 220, 244, 0.13);
}

:global(.app-dark .preview-board),
:global(.app-dark .intake) {
  border-color: rgba(214, 220, 244, 0.14);
  background: rgba(20, 27, 42, 0.88);
  box-shadow: 0 15px 32px rgba(0, 0, 0, 0.14);
}

:global(.app-dark .section-heading) {
  border-color: rgba(214, 220, 244, 0.12);
}

:global(.app-dark .photo-preview) {
  border-color: rgba(214, 220, 244, 0.14);
  background: #101522;
}

@media (max-width: 980px) {
  .content-grid, .subdomain-preview {
    grid-template-columns: 1fr;
  }

  .intake {
    position: static;
  }

  .photo-preview {
    max-width: 260px;
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

  .desk-header, .section-heading, .site-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  h1 {
    font-size: clamp(3.6rem, 17vw, 5.5rem);
  }

  .header-aside {
    max-width: 100%;
    padding-top: 0;
  }

  .content-grid {
    margin-top: 36px;
  }

  .subdomain-preview {
    padding: 22px;
  }
}
</style>
