import {defineStore} from "pinia";
import {useSubdomainStore} from "@/stores/subdomain-store.ts";
import axios from "axios";
import ResponseAPI from "@/utils/ResponseAPI.ts";
import type {Note} from "@/types/notes/Note.ts";

const TOKEN_STORAGE_KEY = 'token';

export const useNoteStore = defineStore('note-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
    }),
    actions: {
        selectedSubdomainId() {
            return useSubdomainStore().selectedSubdomainId;
        },
        authorizationHeader() {
            return {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''}`,
            };
        },
        async getNotes(): Promise<ResponseAPI<Note[]>> {
            try {
                const {data} = await axios.get<ResponseAPI<Note[]>>(`${this.url}/api/v1/notes/${this.selectedSubdomainId()}`, {
                    headers: this.authorizationHeader(),
                })

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                console.error(error);
                throw new ResponseAPI(400, error);
            }
        }
    }
});