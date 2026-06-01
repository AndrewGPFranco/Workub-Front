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
            const token = localStorage.getItem(TOKEN_STORAGE_KEY);
            const user = localStorage.getItem(USER_STORAGE_KEY);

            if (!token || !user) {
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
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
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
