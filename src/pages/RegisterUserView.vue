<template>
  <section class="register-page">
    <div class="register-shell">
      <aside class="register-aside" aria-label="Workhub">
        <img
            src="/banner-register.png"
            :alt="t('auth.bannerAlt')"
            class="register-banner"
        >
      </aside>

      <main class="register-card">
        <div class="page-controls">
          <LanguageSelect/>
          <ThemeToggle/>
        </div>
        <RouterLink :to="{ name: 'Home' }" class="brand-link">
          <img src="/favicon.png" alt="" class="brand-mark">
          <span>Workhub</span>
        </RouterLink>

        <div class="form-heading">
          <p class="eyebrow">{{ t('auth.register.eyebrow') }}</p>
          <h2>{{ t('auth.register.title') }}</h2>
          <p>{{ t('auth.register.description') }}</p>
        </div>

        <FormRegister/>

        <p class="auth-switch">
          {{ t('auth.register.hasAccount') }}
          <RouterLink :to="{ name: 'Login' }">{{ t('auth.register.signIn') }}</RouterLink>
        </p>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import FormRegister from '@/components/auth/FormRegister.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import LanguageSelect from '@/components/LanguageSelect.vue';
import {useLanguage} from '@/composables/use-language.ts';

const {t} = useLanguage();
</script>

<style scoped>
.register-page {
  box-sizing: border-box;
  height: 100dvh;
  padding: 28px;
  overflow: hidden;
  background: radial-gradient(circle at 12% 8%, rgba(58, 117, 255, 0.32), transparent 28%),
  radial-gradient(circle at 92% 86%, rgba(139, 54, 255, 0.24), transparent 30%),
  #050817;
  color: #f8fafc;
}

.register-shell {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(420px, 0.72fr);
  max-width: 1240px;
  height: 100%;
  margin: 0 auto;
  border: 1px solid rgba(99, 102, 241, 0.26);
  border-radius: 28px;
  overflow: hidden;
  background: rgba(9, 12, 30, 0.86);
  box-shadow: 0 34px 110px rgba(0, 0, 0, 0.5);
}

.register-aside {
  position: relative;
  min-height: 0;
  overflow: hidden;
  background: #040716;
}

.register-aside::after {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background: linear-gradient(90deg, transparent 72%, rgba(5, 8, 23, 0.72) 100%),
  linear-gradient(0deg, rgba(5, 8, 23, 0.1), transparent 28%);
}

.register-banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  display: block;
}

.brand-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  color: inherit;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 44px;
}

.brand-mark {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 16px 34px rgba(29, 140, 255, 0.24);
}

.eyebrow {
  margin: 0 0 10px;
  color: inherit;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.78;
}

.form-heading h2 {
  margin: 0;
  letter-spacing: 0;
}

.form-heading p:last-child {
  margin: 18px 0 0;
  line-height: 1.65;
}

.register-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px;
  overflow: auto;
  background: linear-gradient(180deg, rgba(12, 18, 42, 0.96), rgba(6, 10, 25, 0.98)),
  #060a19;
}

.page-controls {
  position: absolute;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:global(.app-light .register-page) {
  background: radial-gradient(circle at 12% 8%, rgba(58, 117, 255, 0.16), transparent 28%),
  radial-gradient(circle at 92% 86%, rgba(139, 54, 255, 0.12), transparent 30%),
  #eef3ff;
  color: #15203b;
}

:global(.app-light .register-shell) {
  border-color: rgba(99, 102, 241, 0.18);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 34px 90px rgba(55, 74, 130, 0.18);
}

:global(.app-light .register-card) {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 248, 255, 0.98)), #ffffff;
}

:global(.app-light .form-heading h2) {
  color: #15203b;
}

:global(.app-light .form-heading p:last-child),
:global(.app-light .auth-switch) {
  color: #66718b;
}

.form-heading {
  margin-bottom: 30px;
}

.form-heading .eyebrow {
  color: #43a3ff;
}

.form-heading h2 {
  color: #ffffff;
  font-size: 2.15rem;
  line-height: 1.08;
}

.form-heading p:last-child {
  max-width: 390px;
  color: #a7b0c7;
}

.auth-switch {
  margin: 22px 0 0;
  color: #a7b0c7;
  font-size: 0.94rem;
}

.auth-switch a {
  color: #61a5ff;
  font-weight: 800;
  text-decoration: none;
}

.auth-switch a:hover {
  color: #8c5cff;
}

@media (max-width: 940px) {
  .register-page {
    padding: 18px;
  }

  .register-shell {
    grid-template-columns: 1fr;
    overflow: auto;
  }

  .register-aside {
    height: min(46dvh, 430px);
    flex: 0 0 auto;
  }

  .register-card {
    padding: 34px 24px;
  }
}

@media (max-width: 560px) {
  .register-page {
    padding: 0;
    background: #060a19;
  }

  .register-shell {
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .register-aside {
    height: 260px;
  }

  .register-card {
    padding: 30px 20px 36px;
  }

  .brand-link {
    margin-bottom: 32px;
  }
}
</style>
