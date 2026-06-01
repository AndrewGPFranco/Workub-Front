import type {ToastServiceMethods} from 'primevue/toastservice';
import {translate} from '@/composables/use-language.ts';

const TOAST_LIFE = 5000;

export const showSuccessToast = (toast: ToastServiceMethods, detail: string) => {
    toast.add({
        severity: 'success',
        summary: translate('toast.success'),
        detail,
        life: TOAST_LIFE,
    });
};

export const showErrorToast = (toast: ToastServiceMethods, detail: string) => {
    toast.add({
        severity: 'error',
        summary: translate('toast.error'),
        detail,
        life: TOAST_LIFE,
    });
};
