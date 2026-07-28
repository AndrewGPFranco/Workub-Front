import {createRouter, createWebHistory} from 'vue-router'
import {hasValidStoredSession} from '@/stores/auth-store.ts'
import {getDefaultAuthorizedRouteName, hasStoredPlanResource} from '@/composables/use-plan-resources.ts'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            component: () => import("@/pages/HomeView.vue"),
            name: "Home"
        },
        {
            path: "/demands",
            component: () => import("@/pages/DemandsView.vue"),
            name: "Demands",
            meta: {
                requiresAuth: true,
                resource: 'DEMANDS',
            }
        },
        {
            path: "/demands/new",
            component: () => import("@/pages/DemandCreateView.vue"),
            name: "Demand Create",
            meta: {
                requiresAuth: true,
                resource: 'DEMANDS',
            }
        },
        {
            path: "/notes",
            component: () => import("@/pages/NotesView.vue"),
            name: "Notes",
            meta: {
                requiresAuth: true,
                resource: 'NOTES',
            }
        },
        {
            path: "/notes/new/:idNote?",
            component: () => import("@/pages/NoteCreateView.vue"),
            name: "Note Create",
            meta: {
                requiresAuth: true,
                resource: 'NOTES',
            }
        },
        {
            path: "/daily",
            component: () => import("@/pages/DailyView.vue"),
            name: "Daily",
            meta: {
                requiresAuth: true,
                resource: 'DAILY',
            }
        },
        {
            path: "/feedback",
            component: () => import("@/pages/FeedbackView.vue"),
            name: "Feedback",
            meta: {
                requiresAuth: true,
                resource: 'FEEDBACK',
            }
        },
        {
            path: "/subdomains/register",
            component: () => import("@/pages/SubdomainRegisterView.vue"),
            name: "Subdomain Register",
            meta: {
                requiresAuth: true,
                resource: 'SUBDOMAINS',
            }
        },
        {
            path: "/access-denied",
            component: () => import("@/pages/AccessDeniedView.vue"),
            name: "Access Denied",
            meta: {
                requiresAuth: true
            }
        },
        {
            path: "/auth/login",
            component: () => import("@/pages/LoginUserView.vue"),
            name: "Login",
            meta: {
                guestOnly: true
            }
        },
        {
            path: "/auth/register",
            component: () => import("@/pages/RegisterUserView.vue"),
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

    if (to.meta.resource && !hasStoredPlanResource(to.meta.resource as 'DAILY' | 'DEMANDS' | 'FEEDBACK' | 'SUBDOMAINS' | 'NOTES')) {
        const defaultRoute = getDefaultAuthorizedRouteName();

        if (defaultRoute !== 'Access Denied')
            return {name: defaultRoute};

        return {name: 'Access Denied'};
    }
});

export default router
