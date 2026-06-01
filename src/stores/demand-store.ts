import axios from 'axios';
import {defineStore} from 'pinia';
import ResponseAPI from '@/utils/ResponseAPI.ts';
import {getApiErrorMessage} from '@/utils/api-error.ts';
import {translate} from '@/composables/use-language.ts';
import type {PageResponse} from '@/types/http/PageResponse.ts';
import type {Demand, EditDemand, RegisterDemand} from '@/types/demands/Demand.ts';

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
    }),
    actions: {
        authorizationHeader() {
            return {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''}`,
            };
        },
        async fetchDemands(page = 0): Promise<ResponseAPI<Demand[]>> {
            this.isLoading = true;

            try {
                const {data} = await axios.get<ResponseAPI<PageResponse<Demand>>>(
                    `${this.url}/demands/by-user`,
                    {
                        params: {page},
                        headers: this.authorizationHeader(),
                    },
                );

                this.demands = data.data.content;
                this.currentPage = data.data.page;
                this.totalPages = data.data.totalPages;
                this.totalElements = data.data.totalElements;
                this.canGoForward = data.data.hasNext;

                return new ResponseAPI(data.httpStatusCode, data.data.content);
            } catch (_) {
                return new ResponseAPI(500, []);
            } finally {
                this.isLoading = false;
            }
        },
        async registerDemand(demand: RegisterDemand): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.post<ResponseAPI<string>>(
                    `${this.url}/demands/register`,
                    demand,
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.registerError')));
            }
        },
        async editDemand(id: string, demand: EditDemand): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.patch<ResponseAPI<string>>(
                    `${this.url}/demands/edit/${id}`,
                    demand,
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.editError')));
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
