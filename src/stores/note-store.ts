import axios from "axios";
import {defineStore} from "pinia";
import ResponseAPI from "@/utils/ResponseAPI.ts";
import type {Note, UpdateNote} from "@/types/notes/Note.ts";
import {useSubdomainStore} from "@/stores/subdomain-store.ts";

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
        },
        async getNoteByID(idNote: string): Promise<ResponseAPI<Note>> {
            try {
                const {data} = await axios.get<ResponseAPI<Note>>(
                    `${this.url}/api/v1/notes/${this.selectedSubdomainId()}/${idNote}`,
                    {
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
        }
    }
});