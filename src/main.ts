import { createApp } from 'vue'
import 'primeicons/primeicons.css'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice';

import App from './App.vue'
import router from './router'
import {useAuthStore} from "@/stores/auth-store.ts";

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ToastService);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

useAuthStore().initializeSession();

app.mount('#app')
