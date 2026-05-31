import type {ToastServiceMethods} from 'primevue/toastservice';

const TOAST_LIFE = 5000;

export const showSuccessToast = (toast: ToastServiceMethods, detail: string) => {
    toast.add({
        severity: 'success',
        summary: 'Operação concluída',
        detail,
        life: TOAST_LIFE,
    });
};

export const showErrorToast = (toast: ToastServiceMethods, detail: string) => {
    toast.add({
        severity: 'error',
        summary: 'Não foi possível concluir',
        detail,
        life: TOAST_LIFE,
    });
};
