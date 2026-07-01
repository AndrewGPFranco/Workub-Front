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
type DemandPagePayload = PageResponse<Demand> | PageResponse<Demand>[];
type DemandStatusPageState = {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    canGoForward: boolean;
    isLoading: boolean;
};

const DEMAND_STATUS_ORDER: DemandStatus[] = ['PENDING', 'ONGOING', 'BLOCKED', 'DONE'];
const emptyStatusPage = (): DemandStatusPageState => ({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    canGoForward: false,
    isLoading: false,
});

const emptyStatusPages = (): Record<DemandStatus, DemandStatusPageState> => ({
    PENDING: emptyStatusPage(),
    ONGOING: emptyStatusPage(),
    BLOCKED: emptyStatusPage(),
    DONE: emptyStatusPage(),
});

const emptyDemandPage = (page: number): PageResponse<Demand> => ({
    content: [],
    page,
    pageSize: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
});

const isPageResponse = (payload: unknown): payload is PageResponse<Demand> =>
    payload !== null
    && typeof payload === 'object'
    && !Array.isArray(payload)
    && 'content' in payload
    && Array.isArray(payload.content);

const isPageResponseList = (payload: unknown): payload is PageResponse<Demand>[] =>
    Array.isArray(payload) && payload.length > 0 && payload.every(isPageResponse);

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
        statusPages: emptyStatusPages(),
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
        applyDemandPage(page: PageResponse<Demand>) {
            this.demands = page.content;
            this.currentPage = page.page;
            this.totalPages = page.totalPages;
            this.totalElements = page.totalElements;
            this.canGoForward = page.hasNext;
        },
        applyStatusPageState(status: DemandStatus, page: PageResponse<Demand>) {
            this.statusPages[status] = {
                currentPage: page.page,
                totalPages: page.totalPages,
                totalElements: page.totalElements,
                canGoForward: page.hasNext,
                isLoading: false,
            };
        },
        applyDemandPages(pages: PageResponse<Demand>[]) {
            this.statusPages = emptyStatusPages();
            this.demands = pages.flatMap((page) => page.content);
            this.currentPage = pages[0]?.page ?? 0;
            this.totalPages = pages.reduce((totalPages, page) => Math.max(totalPages, page.totalPages), 0);
            this.totalElements = pages.reduce((totalElements, page) => totalElements + page.totalElements, 0);
            this.canGoForward = pages.some((page) => page.hasNext);
            pages.forEach((page, index) => {
                const status = page.content[0]?.status ?? DEMAND_STATUS_ORDER[index];

                if (status)
                    this.applyStatusPageState(status, page);
            });
        },
        applyDemandStatusPage(status: DemandStatus, page: PageResponse<Demand>, append = false) {
            const otherStatusDemands = this.demands.filter((demand) => demand.status !== status);
            const currentStatusDemands = append
                ? this.demands.filter((demand) => demand.status === status)
                : [];
            const mergedStatusDemands = [...currentStatusDemands, ...page.content]
                .filter((demand, index, demands) => demands.findIndex(({id}) => id === demand.id) === index);

            this.demands = [...otherStatusDemands, ...mergedStatusDemands];
            this.applyStatusPageState(status, page);
            this.currentPage = Math.min(...Object.values(this.statusPages).map(({currentPage}) => currentPage));
            this.totalPages = Math.max(...Object.values(this.statusPages).map(({totalPages}) => totalPages));
            this.totalElements = Object.values(this.statusPages)
                .reduce((totalElements, statusPage) => totalElements + statusPage.totalElements, 0);
            this.canGoForward = Object.values(this.statusPages).some(({canGoForward}) => canGoForward);
        },
        async fetchDemands(page = 0): Promise<ResponseAPI<Demand[]>> {
            this.isLoading = true;
            const subdomainId = this.selectedSubdomainId();

            try {
                const {data} = await axios.get<ResponseAPI<DemandPagePayload>>(
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

                if (Array.isArray(data.data)) {
                    this.applyDemandPages(data.data);

                    return new ResponseAPI(data.httpStatusCode, this.demands);
                }

                this.applyDemandPage(data.data);

                return new ResponseAPI(data.httpStatusCode, data.data.content);
            } catch (error) {
                return new ResponseAPI(getApiErrorStatus(error), []);
            } finally {
                this.isLoading = false;
            }
        },
        async fetchDemandsByStatus(status: DemandStatus, page = 0, append = false): Promise<ResponseAPI<Demand[]>> {
            const statusPage = this.statusPages[status];

            if (statusPage.isLoading)
                return new ResponseAPI(200, []);

            statusPage.isLoading = true;
            const subdomainId = this.selectedSubdomainId();

            try {
                const {data} = await axios.get<ResponseAPI<DemandPagePayload>>(
                    `${this.url}/demands/by-user`,
                    {
                        params: {
                            page,
                            status,
                            ...(this.priorityFilter ? {priority: this.priorityFilter} : {}),
                            ...(subdomainId ? {subdomainId} : {}),
                        },
                        headers: this.authorizationHeader(),
                    },
                );
                const pageResponse = Array.isArray(data.data)
                    ? data.data.find((statusPage) => statusPage.content[0]?.status === status) ?? data.data[0]
                    : data.data;

                const statusPageResponse = pageResponse ?? emptyDemandPage(page);

                this.applyDemandStatusPage(status, statusPageResponse, append);

                return new ResponseAPI(data.httpStatusCode, statusPageResponse.content);
            } catch (error) {
                return new ResponseAPI(getApiErrorStatus(error), []);
            } finally {
                this.statusPages[status].isLoading = false;
            }
        },
        async searchDemand(title: string): Promise<ResponseAPI<Demand[] | string>> {
            this.isLoading = true;
            const subdomainId = this.selectedSubdomainId();

            try {
                const {data} = await axios.get<ResponseAPI<DemandPagePayload | Demand[] | string>>(
                    `${this.url}/demands/search`,
                    {
                        params: {title, ...(subdomainId ? {subdomainId} : {})},
                        headers: this.authorizationHeader(),
                    },
                );

                if (isPageResponseList(data.data)) {
                    this.applyDemandPages(data.data);

                    return new ResponseAPI(data.httpStatusCode, this.demands);
                }

                if (Array.isArray(data.data)) {
                    this.demands = data.data;
                    this.currentPage = 0;
                    this.totalPages = 1;
                    this.totalElements = data.data.length;
                    this.canGoForward = false;

                    return new ResponseAPI(data.httpStatusCode, data.data);
                }

                if (isPageResponse(data.data)) {
                    this.applyDemandPage(data.data);

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
        async changeDemandSubdomain(idDemand: string, idSubdomain: string): Promise<ResponseAPI<string>> {
            try {
                const {data} = await axios.put<ResponseAPI<string>>(
                    `${this.url}/demands/alter-subdomain/${idDemand}`,
                    null,
                    {
                        headers: this.authorizationHeader(),
                        params: {idSubdomain}
                    },
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('demands.changeSubdomainError')));
            }
        }
    },
});
