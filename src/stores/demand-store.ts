import axios from 'axios';
import {defineStore} from 'pinia';
import ResponseAPI from '@/utils/ResponseAPI.ts';
import {translate} from '@/composables/use-language.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import type {PageResponse} from '@/types/http/PageResponse.ts';
import {getApiErrorMessage, getApiErrorStatus} from '@/utils/api-error.ts';
import type {
    Demand,
    DemandPriority,
    DemandStatus,
    EditDemand,
    InputObservation,
    RegisterDemand,
} from '@/types/demands/Demand.ts';

const TOKEN_STORAGE_KEY = 'token';

export const useDemandStore = defineStore('demand-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        demands: [] as Demand[],
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        isLoading: false,
        canGoForward: false,
        statusFilter: null as DemandStatus | null,
        priorityFilter: null as DemandPriority | null,
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
        async fetchDemands(page = 0): Promise<ResponseAPI<Demand[]>> {
            this.isLoading = true;
            const subdomainId = this.selectedSubdomainId();

            try {
                const {data} = await axios.get<ResponseAPI<PageResponse<Demand>>>(
                    `${this.url}/demands/by-user`,
                    {
                        params: {
                            page,
                            ...(this.statusFilter ? {status: this.statusFilter} : {}),
                            ...(this.priorityFilter ? {priority: this.priorityFilter} : {}),
                            ...(subdomainId ? {subdomainId} : {}),
                        },
                        headers: this.authorizationHeader(),
                    },
                );

                this.demands = data.data.content;
                this.currentPage = data.data.page;
                this.totalPages = data.data.totalPages;
                this.totalElements = data.data.totalElements;
                this.canGoForward = data.data.hasNext;

                return new ResponseAPI(data.httpStatusCode, data.data.content);
            } catch (error) {
                return new ResponseAPI(getApiErrorStatus(error), []);
            } finally {
                this.isLoading = false;
            }
        },
        async searchDemand(title: string): Promise<ResponseAPI<Demand[] | string>> {
            this.isLoading = true;
            const subdomainId = this.selectedSubdomainId();

            try {
                const {data} = await axios.get<ResponseAPI<PageResponse<Demand> | Demand[] | string>>(
                    `${this.url}/demands/search`,
                    {
                        params: {title, ...(subdomainId ? {subdomainId} : {})},
                        headers: this.authorizationHeader(),
                    },
                );

                if (Array.isArray(data.data)) {
                    this.demands = data.data;
                    this.currentPage = 0;
                    this.totalPages = 1;
                    this.totalElements = data.data.length;
                    this.canGoForward = false;

                    return new ResponseAPI(data.httpStatusCode, data.data);
                }

                if (typeof data.data === 'object') {
                    this.demands = data.data.content;
                    this.currentPage = data.data.page;
                    this.totalPages = data.data.totalPages;
                    this.totalElements = data.data.totalElements;
                    this.canGoForward = data.data.hasNext;

                    return new ResponseAPI(data.httpStatusCode, data.data.content);
                }

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.searchError')));
            } finally {
                this.isLoading = false;
            }
        },
        async registerDemand(demand: RegisterDemand): Promise<ResponseAPI<string>> {
            try {
                const subdomainId = this.selectedSubdomainId();
                const {data} = await axios.post<ResponseAPI<string>>(
                    `${this.url}/demands/register`,
                    {...demand, subdomainId},
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.registerError')));
            }
        },
        async editDemand(id: string, demand: EditDemand): Promise<ResponseAPI<string>> {
            try {
                const subdomainId = this.selectedSubdomainId();
                const {data} = await axios.patch<ResponseAPI<string>>(
                    `${this.url}/demands/edit/${id}`,
                    {...demand, subdomainId},
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.editError')));
            }
        },
        async addObservation(observation: InputObservation): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.patch<ResponseAPI<string>>(
                    `${this.url}/demands/add-observations`,
                    observation,
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.observationAddError')));
            }
        },
        async deleteDemand(id: string): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.delete<ResponseAPI<string>>(
                    `${this.url}/demands/delete/${id}`,
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.deleteError')));
            }
        },
    },
});
