import axios from 'axios';
import {defineStore} from 'pinia';
import ResponseAPI from '@/utils/ResponseAPI.ts';
import {translate} from '@/composables/use-language.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';
import type {PageResponse} from '@/types/http/PageResponse.ts';
import type {Daily, RegisterDaily} from '@/types/daily/Daily.ts';
import {getApiErrorMessage, getApiErrorStatus} from '@/utils/api-error.ts';

const TOKEN_STORAGE_KEY = 'token';

type DailyResponsePayload = PageResponse<Daily> | Daily[] | Daily | string | null;

const isPageResponse = (payload: DailyResponsePayload): payload is PageResponse<Daily> =>
    payload !== null && typeof payload === 'object' && 'content' in payload && Array.isArray(payload.content);

const normalizeDailyResponse = (payload: DailyResponsePayload): Daily[] | string => {
    if (Array.isArray(payload) || typeof payload === 'string')
        return payload;

    if (isPageResponse(payload))
        return payload.content;

    return payload ? [payload] : [];
};

export const useDailyStore = defineStore('daily-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        dailyRecords: [] as Daily[],
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
        async fetchDailyRecords(startDate: string, endDate: string): Promise<ResponseAPI<Daily[] | string>> {
            this.isLoading = true;
            const subdomainId = this.selectedSubdomainId();

            try {
                const {data} = await axios.get<ResponseAPI<DailyResponsePayload>>(
                    `${this.url}/user/daily/by-user`,
                    {
                        params: {startDate, endDate, ...(subdomainId ? {subdomainId} : {})},
                        headers: this.authorizationHeader(),
                    },
                );
                const payload = normalizeDailyResponse(data.data);

                if (Array.isArray(payload))
                    this.dailyRecords = payload;

                return new ResponseAPI(data.httpStatusCode, payload);
            } catch (error) {
                return new ResponseAPI(getApiErrorStatus(error), getApiErrorMessage(error, translate('daily.loadError')));
            } finally {
                this.isLoading = false;
            }
        },
        async registerDaily(daily: RegisterDaily): Promise<ResponseAPI<string>> {
            try {
                const subdomainId = this.selectedSubdomainId();
                const {data} = await axios.post<ResponseAPI<string>>(
                    `${this.url}/user/daily/register`,
                    {...daily, subdomainId},
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('daily.registerError')));
            }
        },
    },
});
