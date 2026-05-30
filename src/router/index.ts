import HomeView from '@/pages/HomeView.vue'
import RegisterUserView from '@/pages/RegisterUserView.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: HomeView,
      name: "Home"
    },
    {
      path: "/auth/register",
      component: RegisterUserView,
      name: "User Register"
    }
  ],
})

export default router
