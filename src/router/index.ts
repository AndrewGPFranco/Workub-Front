import HomeView from '@/pages/HomeView.vue'
import DailyView from '@/pages/DailyView.vue'
import DemandsView from '@/pages/DemandsView.vue'
import FeedbackView from '@/pages/FeedbackView.vue'
import LoginUserView from '@/pages/LoginUserView.vue'
import AccessDeniedView from '@/pages/AccessDeniedView.vue'
import {createRouter, createWebHistory} from 'vue-router'
import RegisterUserView from '@/pages/RegisterUserView.vue'
import {hasValidStoredSession} from '@/stores/auth-store.ts'
import {getDefaultAuthorizedRouteName, hasStoredPlanResource} from '@/composables/use-plan-resources.ts'

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
                requiresAuth: true,
                resource: 'DEMANDS',
            }
        },
        {
            path: "/daily",
            component: DailyView,
            name: "Daily",
            meta: {
                requiresAuth: true,
                resource: 'DAILY',
            }
        },
        {
            path: "/feedback",
            component: FeedbackView,
            name: "Feedback",
            meta: {
                requiresAuth: true,
                resource: 'FEEDBACK',
            }
        },
        {
            path: "/access-denied",
            component: AccessDeniedView,
            name: "Access Denied",
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
    const isAuthenticated = hasValidStoredSession();

    if (to.meta.guestOnly && isAuthenticated)
        return {name: "Demands"};

    if (to.meta.requiresAuth && !isAuthenticated)
        return {name: "Login"};

    if (to.meta.resource && !hasStoredPlanResource(to.meta.resource as 'DAILY' | 'DEMANDS' | 'FEEDBACK')) {
        const defaultRoute = getDefaultAuthorizedRouteName();

        if (defaultRoute !== 'Access Denied')
            return {name: defaultRoute};

        return {name: 'Access Denied'};
    }
});

export default router
