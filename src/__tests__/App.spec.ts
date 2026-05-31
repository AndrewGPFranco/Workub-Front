import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  it('mounts renders properly', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), router],
        stubs: {
          Button: true,
          Toast: true,
        },
      },
    })

    expect(wrapper.text()).toContain('Registrar')
  })
})
