<template>
  <main>
    <RouterView/>
    <Toast/>
  </main>
</template>

<script setup lang="ts">
import Toast from 'primevue/toast'
</script>

<style>
.p-toast {
  width: min(92vw, 390px);
}

.p-toast-message {
  border: 1px solid #d7d9d3;
  border-radius: 4px;
  overflow: hidden;
  background: #fbfbf7;
  box-shadow: 0 16px 36px rgba(23, 62, 50, 0.16);
}

.p-toast-message-content {
  align-items: flex-start;
  gap: 10px;
  padding: 14px 15px;
}

.p-toast-summary {
  color: #173e32;
  font-family: Georgia, serif;
  font-size: 1rem;
  letter-spacing: -0.02em;
}

.p-toast-detail {
  margin-top: 3px;
  color: #748078;
  font-size: 0.8rem;
  line-height: 1.45;
}

.p-toast-message-success {
  border-left: 4px solid #66813c;
}

.p-toast-message-error {
  border-left: 4px solid #c45436;
}

.p-toast-message-success .p-toast-message-icon {
  color: #66813c;
}

.p-toast-message-error .p-toast-message-icon {
  color: #c45436;
}

.p-toast-close-button {
  color: #789087;
}
</style>
