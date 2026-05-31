import axios from 'axios';
import {defineStore} from 'pinia';
import type {Demand, RegisterDemand} from '@/types/demands/Demand.ts';
import ResponseAPI from '@/utils/ResponseAPI.ts';

const PAGE_SIZE = 10;
const TOKEN_STORAGE_KEY = 'token';

export const useDemandStore = defineStore('demand-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        demands: [] as Demand[],
        currentPage: 0,
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
                const {data} = await axios.get<ResponseAPI<Demand[]>>(
                    `${this.url}/demands/by-user`,
                    {
                        params: {page},
                        headers: this.authorizationHeader(),
                    },
                );

                this.demands = data.data;
                this.currentPage = page;
                this.canGoForward = data.data.length === PAGE_SIZE;

                return new ResponseAPI(data.httpStatusCode, data.data);
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
            } catch (_) {
                return new ResponseAPI(500, 'Não foi possível registrar a demanda.');
            }
        },
    },
});
