import HomeView from '@/pages/HomeView.vue'
import RegisterUserView from '@/pages/RegisterUserView.vue'
import {createRouter, createWebHistory} from 'vue-router'

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
            name: "User Register",
            meta: {
                guestOnly: true
            }
        }
    ],
})

router.beforeEach((to) => {
    const isAuthenticated = Boolean(localStorage.getItem("token"));

    if (to.meta.guestOnly && isAuthenticated) {
        return {name: "Home"};
    }
});

export default router
