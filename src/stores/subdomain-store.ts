import axios from 'axios';
import {defineStore} from 'pinia';
import ResponseAPI from '@/utils/ResponseAPI.ts';
import {translate} from '@/composables/use-language.ts';
import {getApiErrorMessage, getApiErrorStatus} from '@/utils/api-error.ts';
import type {RegisterSubdomain, Subdomain} from '@/types/subdomain/Subdomain.ts';

const TOKEN_STORAGE_KEY = 'token';
const SELECTED_SUBDOMAIN_STORAGE_KEY = 'selectedSubdomain';

type SubdomainResponsePayload = Subdomain[] | Subdomain | string | null;

const normalizeSubdomainsResponse = (payload: SubdomainResponsePayload): Subdomain[] | string => {
    if (Array.isArray(payload) || typeof payload === 'string')
        return payload;

    return payload ? [payload] : [];
};

const getSubdomainKey = (subdomain: Subdomain) => subdomain.id ?? subdomain.name;

export const useSubdomainStore = defineStore('subdomain-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        subdomains: [] as Subdomain[],
        selectedSubdomainKey: localStorage.getItem(SELECTED_SUBDOMAIN_STORAGE_KEY),
        isLoading: false,
        hasLoaded: false,
    }),
    actions: {
        authorizationHeader() {
            return {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''}`,
            };
        },
        selectSubdomain(subdomainKey: string | null) {
            this.selectedSubdomainKey = subdomainKey;

            if (subdomainKey)
                localStorage.setItem(SELECTED_SUBDOMAIN_STORAGE_KEY, subdomainKey);
            else
                localStorage.removeItem(SELECTED_SUBDOMAIN_STORAGE_KEY);
        },
        ensureSelectedSubdomain() {
            if (this.subdomains.length === 0) {
                this.selectSubdomain(null);
                return;
            }

            const selectedExists = this.subdomains.some((subdomain) => getSubdomainKey(subdomain) === this.selectedSubdomainKey);

            const firstSubdomain = this.subdomains[0];

            if (!selectedExists && firstSubdomain)
                this.selectSubdomain(getSubdomainKey(firstSubdomain));
        },
        async fetchSubdomains(force = false): Promise<ResponseAPI<Subdomain[] | string>> {
            if (this.hasLoaded && !force)
                return new ResponseAPI(200, this.subdomains);

            this.isLoading = true;

            try {
                const {data} = await axios.get<ResponseAPI<SubdomainResponsePayload>>(
                    `${this.url}/subdomains/by-user`,
                    {headers: this.authorizationHeader()},
                );
                const payload = normalizeSubdomainsResponse(data.data);

                if (Array.isArray(payload)) {
                    this.subdomains = payload;
                    this.hasLoaded = true;
                    this.ensureSelectedSubdomain();
                }

                return new ResponseAPI(data.httpStatusCode, payload);
            } catch (error) {
                return new ResponseAPI(
                    getApiErrorStatus(error),
                    getApiErrorMessage(error, translate('subdomain.loadError')),
                );
            } finally {
                this.isLoading = false;
            }
        },
        async registerSubdomain(subdomain: RegisterSubdomain): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.post<ResponseAPI<string>>(
                    `${this.url}/subdomains/register`,
                    subdomain,
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(
                    getApiErrorStatus(error),
                    getApiErrorMessage(error, translate('subdomain.registerError')),
                );
            }
        },
    },
    getters: {
        selectedSubdomain(state): Subdomain | null {
            return state.subdomains.find((subdomain) => getSubdomainKey(subdomain) === state.selectedSubdomainKey) ?? null;
        },
    },
});
