import axios from "axios";
import {defineStore} from "pinia";
import ResponseAPI from "@/utils/ResponseAPI.ts";
import {translate} from "@/composables/use-language.ts";
import {getApiErrorMessage} from "@/utils/api-error.ts";
import type {UserLogin} from "@/types/auth/UserLogin.ts";
import type {UserLogged} from "@/types/auth/UserLogged.ts";
import type {UserRegister} from "@/types/auth/UserRegister.ts";
import type {AuthResponse} from "@/types/auth/AuthResponse.ts";

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "userLogged";

const decodeBase64Url = (value: string) => {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

    return atob(paddedBase64);
};

const getTokenExpiration = (token: string): number | null => {
    const [, payload] = token.split('.');

    if (!payload)
        return null;

    try {
        const claims = JSON.parse(decodeBase64Url(payload)) as { exp?: unknown };
        return typeof claims.exp === 'number' ? claims.exp : null;
    } catch (_) {
        return null;
    }
};

export const isTokenExpired = (token: string) => {
    const expiration = getTokenExpiration(token);

    if (!expiration)
        return true;

    return expiration <= Math.floor(Date.now() / 1000);
};

export const clearStoredSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
};

export const hasValidStoredSession = () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = localStorage.getItem(USER_STORAGE_KEY);

    if (!token || !user || isTokenExpired(token)) {
        clearStoredSession();
        return false;
    }

    return true;
};

/**
 * @author andrewgo
 */
export const useAuthStore = defineStore('auth-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        userLogged: null as UserLogged | null
    }),
    actions: {
        saveSession(data: AuthResponse) {
            this.userLogged = data.user;

            localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        },
        initializeSession() {
            if (!hasValidStoredSession()) {
                this.userLogged = null;
                return;
            }

            const user = localStorage.getItem(USER_STORAGE_KEY);

            if (!user) {
                this.userLogged = null;
                return;
            }

            try {
                this.userLogged = JSON.parse(user) as UserLogged;
            } catch (_) {
                this.logout();
            }
        },
        logout() {
            this.userLogged = null;
            clearStoredSession();
        },
        async register(user: UserRegister): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.post<AuthResponse>(
                    `${this.url}/auth/register`, user
                );

                this.saveSession(data);

                return new ResponseAPI(200, translate('auth.register.success'));
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('auth.register.error')));
            }
        },
        async login(user: UserLogin): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.post<AuthResponse>(
                    `${this.url}/auth/login`, user
                );

                this.saveSession(data);

                return new ResponseAPI(200, translate('auth.login.success'));
            } catch (error) {
                return new ResponseAPI(401, getApiErrorMessage(error, translate('auth.login.error')));
            }
        }
    },
    getters: {}
})
