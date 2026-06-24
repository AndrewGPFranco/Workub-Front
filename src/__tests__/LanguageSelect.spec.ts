import {beforeEach, describe, expect, it} from 'vitest';
import {mount} from '@vue/test-utils';
import LanguageSelect from '@/components/LanguageSelect.vue';
import {initializeLanguage, translate} from '@/composables/use-language.ts';

describe('LanguageSelect', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem('workhub-language', 'pt-BR');
        initializeLanguage();
    });

    it('persists the selected language and updates the document language', async () => {
        const wrapper = mount(LanguageSelect);
        const select = wrapper.get('select');

        await select.setValue('en');

        expect(localStorage.getItem('workhub-language')).toBe('en');
        expect(document.documentElement.lang).toBe('en');
        expect(translate('auth.login.title')).toBe('Access your account');
    });
});
