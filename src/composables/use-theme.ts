import {computed, ref} from 'vue';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'workhub-theme';
const theme = ref<Theme>('light');

const getPreferredTheme = (): Theme => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme === 'light' || storedTheme === 'dark')
        return storedTheme;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (value: Theme) => {
    theme.value = value;
    document.documentElement.classList.toggle('app-dark', value === 'dark');
    document.documentElement.classList.toggle('app-light', value === 'light');
    document.documentElement.style.colorScheme = value;
};

export const initializeTheme = () => applyTheme(getPreferredTheme());

export const useTheme = () => {
    const isDark = computed(() => theme.value === 'dark');

    const toggleTheme = () => {
        const nextTheme = isDark.value ? 'light' : 'dark';
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        applyTheme(nextTheme);
    };

    return {
        isDark,
        toggleTheme,
    };
};
