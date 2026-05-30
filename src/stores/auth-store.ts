import axios from "axios";
import {defineStore} from "pinia";
import ResponseAPI from "@/utils/ResponseAPI.ts";
import type {UserLogged} from "@/types/auth/UserLogged.ts";
import type {UserRegister} from "@/types/auth/UserRegister.ts";
import type {AuthResponse} from "@/types/auth/AuthResponse.ts";

/**
 * @author andrewgo
 */
export const useAuthStore = defineStore('auth-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        userLogged: null as unknown as UserLogged
    }),
    actions: {
        async register(user: UserRegister): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.post<AuthResponse>(
                    `${this.url}/auth/register`, user
                );

                this.userLogged = data.user;

                localStorage.setItem("token", data.token);

                return new ResponseAPI(false, "Usuário registrado com sucesso!");
            } catch (_) {
                return new ResponseAPI(true, "Ocorreu um erro ao realizar o registro, tente novamente mais tarde!");
            }
        }
    },
    getters: {}
})