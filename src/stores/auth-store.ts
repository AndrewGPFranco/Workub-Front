import axios from "axios";
import {defineStore} from "pinia";
import type {UserRegister} from "@/types/UserRegister.ts";

/**
 * @author andrewgo
 */
export const useAuthStore = defineStore('auth-store', {
    state: () => ({}),
    actions: {
        async register(user: UserRegister): Promise<String> {
            try {
                // TODO: passar URL para .env
                await axios.post("http://localhost:8080/auth/register", user);
                return "Usuário registrado com sucesso!";
            } catch (error) {
                return "Ocorreu um erro ao realizar o registro, tente novamente mais tarde!";
            }
        }
    },
    getters: {}
})