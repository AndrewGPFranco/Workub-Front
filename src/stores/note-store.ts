import axios from "axios";
import {defineStore} from "pinia";
import ResponseAPI from "@/utils/ResponseAPI.ts";
import type {Note, UpdateNote} from "@/types/notes/Note.ts";
import {useSubdomainStore} from "@/stores/subdomain-store.ts";
import type {PageResponse} from "@/types/http/PageResponse.ts";

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
        async getNotes(currentPage: number): Promise<ResponseAPI<PageResponse<Note>>> {
            let url = `${this.url}/api/v1/notes/?page=${currentPage}`;

            if (this.selectedSubdomainId() !== null)
                url = `${this.url}/api/v1/notes/subdomain/${this.selectedSubdomainId()}?page=${currentPage}`;

            try {
                const {data} = await axios.get<ResponseAPI<PageResponse<Note>>>(url, {
                    headers: this.authorizationHeader(),
                })

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                console.error(error);
                throw new ResponseAPI(400, error);
            }
        },
        async getNoteByID(idNote: string): Promise<ResponseAPI<Note>> {
            let url = `${this.url}/api/v1/notes/${idNote}`;

            if (this.selectedSubdomainId() !== null)
                url = `${this.url}/api/v1/notes/subdomain/${this.selectedSubdomainId()}/${idNote}`;

            try {
                const {data} = await axios.get<ResponseAPI<Note>>(url, {
                    headers: this.authorizationHeader(),
                })

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                console.error(error);
                throw new ResponseAPI(400, error);
            }
        },
        async updateNote(title: string, content: string, idNote: string | undefined): Promise<ResponseAPI<Note>> {
            try {
                const idSubdomain = this.selectedSubdomainId();

                const notePayload: UpdateNote = {
                    title: title,
                    content: content,
                    idSubdomain: idSubdomain,
                    idNote: idNote || null
                };

                const {data} = await axios.post(`${this.url}/api/v1/notes/register`, notePayload, {
                    headers: this.authorizationHeader(),
                })

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                console.error(error);
                throw new ResponseAPI(400, error);
            }
        },
        async deleteNote(idNote: string): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.delete<ResponseAPI<string>>(`${this.url}/api/v1/notes/delete/${idNote}`, {
                    headers: this.authorizationHeader(),
                })

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                console.error(error);
                throw new ResponseAPI(400, error);
            }
        },
    }
});
