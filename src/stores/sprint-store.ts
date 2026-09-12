import axios from 'axios';
import {defineStore} from 'pinia';
import ResponseAPI from '@/utils/ResponseAPI.ts';
import {translate} from '@/composables/use-language.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import {getApiErrorMessage, getApiErrorStatus} from '@/utils/api-error.ts';

export interface DemandsToSprint {
    idSubdomain: string | null;
    sprintTitle: string;
    idDemands: string[];
}

export interface RegisterSprint {
    title: string;
    idSubdomain: string | null;
    dateToUse: string;
}

const TOKEN_STORAGE_KEY = 'token';

export const useSprintStore = defineStore('sprint-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        sprints: [] as string[],
        isLoading: false,
    }),
    actions: {
        authorizationHeader() {
            return {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''}`,
            };
        },
        selectedSubdomainId() {
            return useSubdomainStore().selectedSubdomainId;
        },
        async fetchSprints(subdomainId?: string | null): Promise<ResponseAPI<string[] | string>> {
            const targetSubdomainId = subdomainId !== undefined ? subdomainId : this.selectedSubdomainId();

            this.isLoading = true;

            try {
                const {data} = await axios.get<ResponseAPI<string[]>>(
                    `${this.url}/sprint/by-user`,
                    {
                        params: targetSubdomainId ? {idSubdomain: targetSubdomainId} : {},
                        headers: this.authorizationHeader(),
                    },
                );

                const sprintList = Array.isArray(data.data) ? data.data : [];
                this.sprints = sprintList;

                return new ResponseAPI(data.httpStatusCode, sprintList);
            } catch (error) {
                this.sprints = [];
                return new ResponseAPI(
                    getApiErrorStatus(error),
                    getApiErrorMessage(error, translate('demands.sprintLoadError')),
                );
            } finally {
                this.isLoading = false;
            }
        },
        async registerSprint(payload: RegisterSprint): Promise<ResponseAPI<string | null>> {
            try {
                const {data} = await axios.post<ResponseAPI<string | null>>(
                    `${this.url}/sprint`, payload, {headers: this.authorizationHeader()},
                );
                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(
                    getApiErrorStatus(error),
                    getApiErrorMessage(error, translate('demands.sprintRegisterError')),
                );
            }
        },
        async addDemandsToSprint(payload: DemandsToSprint): Promise<ResponseAPI<string | null>> {
            try {
                const {data} = await axios.post<ResponseAPI<string | null>>(
                    `${this.url}/sprint/add-demands`, payload, {headers: this.authorizationHeader()},
                );
                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(
                    getApiErrorStatus(error),
                    getApiErrorMessage(error, translate('demands.moveSprintError')),
                );
            }
        },
        clearSprints() {
            this.sprints = [];
        },
    },
});
