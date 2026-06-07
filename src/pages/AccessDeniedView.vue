<template>
  <main class="access-page">
    <section class="access-shell" aria-labelledby="access-title">
      <RouterLink :to="{name: defaultRouteName}" class="brand" aria-label="Workhub">
        <img src="/favicon.png" alt="" class="brand-logo">
        <span class="brand-copy">Work<span>hub</span></span>
      </RouterLink>

      <div class="access-code">403</div>

      <div class="access-copy">
        <p class="kicker">{{ t('accessDenied.kicker') }}</p>
        <h1 id="access-title">{{ t('accessDenied.title') }}</h1>
        <p>{{ t('accessDenied.description') }}</p>
      </div>

      <div class="access-actions">
        <Button :label="t('accessDenied.primaryAction')" icon="pi pi-arrow-left" @click="goBack"/>
        <Button :label="t('accessDenied.secondaryAction')" icon="pi pi-home" text @click="goHome"/>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import router from '@/router';
import {useLanguage} from '@/composables/use-language.ts';
import {getDefaultAuthorizedRouteName} from '@/composables/use-plan-resources.ts';

const {t} = useLanguage();
const defaultRouteName = getDefaultAuthorizedRouteName();

const goBack = () => {
  const previousRoute = router.options.history.state.back;

  if (previousRoute)
    router.back();
  else
    router.replace({name: defaultRouteName});
};

const goHome = () => router.replace({name: 'Home'});
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.access-page {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: clamp(22px, 5vw, 72px);
  color: #17251f;
  background: #f1f0eb;
}

.access-shell {
  display: grid;
  width: min(720px, 100%);
  gap: 26px;
  justify-items: start;
  padding: clamp(28px, 6vw, 58px);
  border: 1px solid rgba(33, 59, 49, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 253, 0.93);
  box-shadow: 0 22px 56px rgba(42, 55, 49, 0.12);
}

.brand, .access-actions {
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

.brand-copy {
  font-size: 1.02rem;
  font-weight: 800;
}

.brand-copy span {
  color: #f07849;
}

.access-code {
  color: #ef774c;
  font-family: Georgia, serif;
  font-size: clamp(4.5rem, 18vw, 9rem);
  line-height: 0.9;
}

.access-copy {
  display: grid;
  gap: 12px;
}

.kicker {
  margin: 0;
  color: #77857e;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

h1 {
  max-width: 620px;
  margin: 0;
  color: #26332f;
  font-family: Georgia, serif;
  font-size: clamp(2.1rem, 6vw, 4rem);
  font-weight: 500;
  line-height: 0.98;
}

.access-copy p:last-child {
  max-width: 560px;
  margin: 0;
  color: #65716c;
  font-size: 1rem;
  line-height: 1.65;
}

.access-actions {
  flex-wrap: wrap;
  gap: 10px;
}

.access-actions :deep(.p-button) {
  border-color: #6e63d9;
  color: #ffffff;
  background: #6e63d9;
}

.access-actions :deep(.p-button:hover) {
  border-color: #5e53ca;
  background: #5e53ca;
}

.access-actions :deep(.p-button-text) {
  border-color: transparent;
  color: #5e53ca;
  background: transparent;
}

:global(html.app-dark) .access-page, :global(.app-dark) .access-page {
  color: #f7f5ef;
  background: #101523;
}

:global(html.app-dark) .access-shell, :global(.app-dark) .access-shell {
  border-color: rgba(214, 220, 244, 0.14);
  background: rgba(23, 27, 43, 0.96);
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.32);
}

:global(html.app-dark) .brand, :global(.app-dark) .brand,
:global(html.app-dark) h1, :global(.app-dark) h1 {
  color: #f7f5ef;
}

:global(html.app-dark) .kicker, :global(.app-dark) .kicker,
:global(html.app-dark) .access-copy p:last-child, :global(.app-dark) .access-copy p:last-child {
  color: #aab5c9;
}

:global(html.app-dark) .access-actions :deep(.p-button-text),
:global(.app-dark) .access-actions :deep(.p-button-text) {
  color: #c7c2ff;
}

@media (max-width: 620px) {
  .access-shell {
    padding: 24px;
  }

  .access-actions {
    width: 100%;
  }

  .access-actions :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
