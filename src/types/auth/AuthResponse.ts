import type {UserLogged} from "@/types/auth/UserLogged.ts";

export interface AuthResponse {
    token: string;
    user: UserLogged;
}