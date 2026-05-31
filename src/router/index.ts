import HomeView from '@/pages/HomeView.vue'
import LoginUserView from '@/pages/LoginUserView.vue'
import {createRouter, createWebHistory} from 'vue-router'
import RegisterUserView from '@/pages/RegisterUserView.vue'
import DemandsView from '@/pages/DemandsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            component: HomeView,
            name: "Home"
        },
        {
            path: "/demands",
            component: DemandsView,
            name: "Demands",
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/auth/login",
            component: LoginUserView,
            name: "Login",
            meta: {
                guestOnly: true
            }
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

    if (to.meta.guestOnly && isAuthenticated)
        return {name: "Demands"};

    if (to.meta.requiresAuth && !isAuthenticated)
        return {name: "Login"};
});

export default router
