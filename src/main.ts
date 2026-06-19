import {createApp} from 'vue'
import 'primeicons/primeicons.css'
import {createPinia} from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import {definePreset} from '@primeuix/themes'
import ToastService from 'primevue/toastservice';
import './assets/theme.css'

import App from './App.vue'
import router from './router'
import {useAuthStore} from "@/stores/auth-store.ts";
import {initializeTheme} from '@/composables/use-theme.ts';
import {initializeLanguage} from '@/composables/use-language.ts';

initializeTheme();
initializeLanguage();

const WorkhubPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{emerald.50}',
            100: '{emerald.100}',
            200: '{emerald.200}',
            300: '{emerald.300}',
            400: '{emerald.400}',
            500: '{emerald.600}',
            600: '{emerald.700}',
            700: '{emerald.800}',
            800: '{emerald.900}',
            900: '{emerald.950}',
            950: '{emerald.950}',
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#f8faf9',
                    100: '#eef2f0',
                    200: '#dfe5e1',
                    300: '#cdd6d1',
                    400: '#9eaaa4',
                    500: '#7b8882',
                    600: '#5f6c66',
                    700: '#46524d',
                    800: '#303a35',
                    900: '#202b27',
                    950: '#111814',
                },
            },
            dark: {
                surface: {
                    0: '#ffffff',
                    50: '#edf2ef',
                    100: '#d8dfdb',
                    200: '#b7c1bc',
                    300: '#8f9a95',
                    400: '#69746f',
                    500: '#515b56',
                    600: '#3b4340',
                    700: '#30363d',
                    800: '#23282f',
                    900: '#1d2127',
                    950: '#111418',
                },
            },
        },
    },
});

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ToastService);
app.use(PrimeVue, {
    theme: {
        preset: WorkhubPreset,
        options: {
            darkModeSelector: '.app-dark',
        },
    },
})

useAuthStore().initializeSession();

app.mount('#app')
