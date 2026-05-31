import {describe, it, expect} from 'vitest'

import {mount} from '@vue/test-utils'
import {createPinia} from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
    it('mounts renders properly', async () => {
        localStorage.clear()
        await router.push('/auth/login')
        await router.isReady()

        const wrapper = mount(App, {
            global: {
                plugins: [createPinia(), router, PrimeVue, ToastService],
                stubs: {
                    Button: true,
                    Toast: true,
                },
            },
        })

        expect(wrapper.text()).toContain('Acesse sua conta')
    })
})
