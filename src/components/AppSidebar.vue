<template>
  <header class="site-header">
    <nav class="navbar" :aria-label="t('demands.mainNav')">
      <RouterLink :to="{name: defaultRouteName}" class="brand" aria-label="Workhub">
        <img src="/favicon.png" alt="" class="brand-logo">
        <span class="brand-copy">Work<span>hub</span></span>
      </RouterLink>

      <div class="navbar-center">
        <RouterLink v-if="canAccess('DEMANDS')" :class="['nav-link', {active: isDemandsRoute}]" :to="{name: 'Demands'}">
          <i class="pi pi-inbox"/><span>{{ t('demands.nav') }}</span>
        </RouterLink>
        <RouterLink v-if="canAccess('DAILY')" :class="['nav-link', {active: route.name === 'Daily'}]" :to="{name: 'Daily'}">
          <i class="pi pi-calendar-clock"/><span>{{ t('daily.nav') }}</span>
        </RouterLink>
        <RouterLink v-if="canAccess('FEEDBACK')" :class="['nav-link', {active: route.name === 'Feedback'}]" :to="{name: 'Feedback'}">
          <i class="pi pi-comments"/><span>{{ t('feedback.nav') }}</span>
        </RouterLink>
        <RouterLink v-if="canAccess('SUBDOMAINS')" :class="['nav-link', {active: route.name === 'Subdomain Register'}]" :to="{name: 'Subdomain Register'}">
          <i class="pi pi-sitemap"/><span>{{ t('subdomain.nav') }}</span>
        </RouterLink>
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
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import Button from 'primevue/button';
import LanguageSelect from '@/components/LanguageSelect.vue';
import SubdomainSwitcher from '@/components/SubdomainSwitcher.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import {useLanguage} from '@/composables/use-language.ts';
import {getDefaultAuthorizedRouteName, hasStoredPlanResource, type PlanResource} from '@/composables/use-plan-resources.ts';
import router from '@/router';
import {useAuthStore} from '@/stores/auth-store.ts';

const route = useRoute();
const authStore = useAuthStore();
const {t} = useLanguage();
const defaultRouteName = getDefaultAuthorizedRouteName();
const canAccess = (resource: PlanResource) => hasStoredPlanResource(resource);
const isDemandsRoute = computed(() => route.name === 'Demands' || route.name === 'Demand Create');
const userName = computed(() => {
  const user = authStore.userLogged;
  return user ? `${user.firstName} ${user.lastName}` : t('demands.user');
});
const userInitials = computed(() => {
  const user = authStore.userLogged;
  return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'WH';
});
const logout = async () => {
  authStore.logout();
  await router.push({name: 'Login'});
};
</script>

<style scoped>
.site-header { pointer-events: none; }
.navbar { display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--wh-border); background: var(--wh-surface); pointer-events: auto; }
.brand, .navbar-center, .navbar-actions, .profile-copy { display: flex; align-items: center; }
.brand { gap: 8px; color: var(--wh-text); font-weight: 800; text-decoration: none; }
.brand-logo { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; }
.brand-copy span { color: var(--wh-accent); }
.navbar-center { gap: 5px; }
.nav-link { display: flex; align-items: center; gap: 8px; color: var(--wh-text-soft); font-weight: 700; text-decoration: none; }
.navbar-actions { gap: 6px; }
.navbar-divider { width: 1px; height: 26px; background: var(--wh-border); }
.profile-copy { align-items: flex-end; flex-direction: column; max-width: 150px; font-size: .72rem; }
.profile-copy span { overflow: hidden; width: 100%; color: var(--wh-text-muted); font-size: .64rem; text-overflow: ellipsis; white-space: nowrap; }
.avatar { display: grid; width: 38px; height: 38px; flex: 0 0 38px; place-items: center; border-radius: 10px; color: white; background: var(--wh-accent); font-size: .7rem; font-weight: 900; }
</style>
