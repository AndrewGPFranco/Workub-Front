import axios from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from 'pinia';
import {useDemandStore} from '@/stores/demand-store.ts';
import type {Demand, DemandStatus} from '@/types/demands/Demand.ts';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);
const demandForStatus = (status: DemandStatus, index: number): Demand => ({
    id: `${status}-${index}`,
    title: `${status} demand ${index}`,
    description: 'Demand description',
    deadline: null,
    status,
    priority: 'MEDIUM',
    createdAt: '2026-06-01T09:17:01.215891',
    updatedAt: null,
    observationsToReview: null,
    observations: [],
    finalizedAt: null,
});
const pageResponse = {
    data: {
        httpStatusCode: 200,
        data: {
            content: [],
            page: 0,
            pageSize: 5,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
        },
    },
};

describe('demand store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        mockedAxios.get.mockResolvedValue(pageResponse);
    });

    it('sends the selected status when loading demands', async () => {
        const store = useDemandStore();
        store.statusFilter = 'ONGOING';

        await store.fetchDemands(2);

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${store.url}/demands/by-user`,
            expect.objectContaining({
                params: {page: 2, status: 'ONGOING'},
            }),
        );
    });

    it('omits the status value when all statuses are selected', async () => {
        const store = useDemandStore();

        await store.fetchDemands();

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${store.url}/demands/by-user`,
            expect.objectContaining({
                params: {page: 0},
            }),
        );
    });

    it('sends status and priority together when both filters are selected', async () => {
        const store = useDemandStore();
        store.statusFilter = 'PENDING';
        store.priorityFilter = 'URGENT';

        await store.fetchDemands();

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${store.url}/demands/by-user`,
            expect.objectContaining({
                params: {page: 0, status: 'PENDING', priority: 'URGENT'},
            }),
        );
    });

    it('updates the board demand list when loading one page per status', async () => {
        const store = useDemandStore();
        const pages = (['PENDING', 'ONGOING', 'BLOCKED', 'DONE'] as const).map((status, statusIndex) => ({
            content: Array.from({length: 5}, (_, index) => demandForStatus(status, index)),
            page: 1,
            pageSize: 5,
            totalPages: status === 'DONE' ? 2 : 1,
            totalElements: statusIndex + 5,
            hasNext: status === 'DONE',
        }));
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                httpStatusCode: 200,
                data: pages,
            },
        });

        const result = await store.fetchDemands(1);

        expect(result.response).toHaveLength(20);
        expect(store.demands).toEqual(pages.flatMap((page) => page.content));
        expect(store.currentPage).toBe(1);
        expect(store.totalPages).toBe(2);
        expect(store.totalElements).toBe(26);
        expect(store.canGoForward).toBe(true);
    });

    it('appends the next page for only one status', async () => {
        const store = useDemandStore();
        const firstPageDemand = demandForStatus('ONGOING', 0);
        const secondPageDemand = demandForStatus('ONGOING', 1);

        store.demands = [firstPageDemand, demandForStatus('PENDING', 0)];
        store.statusPages.ONGOING = {
            currentPage: 0,
            totalPages: 2,
            totalElements: 2,
            canGoForward: true,
            isLoading: false,
        };
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                httpStatusCode: 200,
                data: {
                    content: [secondPageDemand],
                    page: 1,
                    pageSize: 5,
                    totalPages: 2,
                    totalElements: 2,
                    hasNext: false,
                },
            },
        });

        const result = await store.fetchDemandsByStatus('ONGOING', 1, true);

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${store.url}/demands/by-user`,
            expect.objectContaining({
                params: {page: 1, status: 'ONGOING'},
            }),
        );
        expect(result.response).toEqual([secondPageDemand]);
        expect(store.demands.filter(({status}) => status === 'ONGOING')).toEqual([firstPageDemand, secondPageDemand]);
        expect(store.demands.filter(({status}) => status === 'PENDING')).toHaveLength(1);
        expect(store.statusPages.ONGOING.currentPage).toBe(1);
        expect(store.statusPages.ONGOING.canGoForward).toBe(false);
    });

    it('sends the title when searching demands', async () => {
        const store = useDemandStore();

        await store.searchDemand('Jobs');

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${store.url}/demands/search`,
            expect.objectContaining({
                params: {title: 'Jobs'},
            }),
        );
    });

    it('updates the demand list when search returns a page', async () => {
        const store = useDemandStore();
        const demand = {
            id: '84ffee53-03cd-4816-a0d7-9e4e48817c3f',
            title: 'Possibilidade de inativar Jobs',
            description: 'Permite inativar jobs',
            deadline: null,
            status: 'DONE',
            priority: 'MEDIUM',
            createdAt: '2026-06-01T09:17:01.215891',
            updatedAt: '2026-06-02T22:59:45.943148',
            observationsToReview: null,
            observations: [
                {
                    textObservation: 'Validar os campos',
                    createdAt: '2026-06-01T09:20:00Z',
                },
            ],
            finalizedAt: '2026-06-02',
        };
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                httpStatusCode: 200,
                data: {
                    content: [demand],
                    page: 0,
                    pageSize: 5,
                    totalPages: 1,
                    totalElements: 1,
                    hasNext: false,
                },
            },
        });

        await store.searchDemand('Jobs');

        expect(store.demands).toEqual([demand]);
        expect(store.totalElements).toBe(1);
    });

    it('adds an observation to an existing demand', async () => {
        const store = useDemandStore();
        const demandId = '84ffee53-03cd-4816-a0d7-9e4e48817c3f';
        mockedAxios.patch.mockResolvedValueOnce({
            data: {httpStatusCode: 201, data: 'Observação adicionada com sucesso!'},
        });

        await store.addObservation({
            demandId,
            textObservations: ['Validar com o time de produto', 'Documentar a decisão'],
        });

        expect(mockedAxios.patch).toHaveBeenCalledWith(
            `${store.url}/demands/add-observations`,
            {demandId, textObservations: ['Validar com o time de produto', 'Documentar a decisão']},
            expect.objectContaining({headers: expect.any(Object)}),
        );
    });

    it('registers a demand with the observations object', async () => {
        const store = useDemandStore();
        mockedAxios.post.mockResolvedValueOnce({
            data: {httpStatusCode: 201, data: 'Demanda registrada com sucesso!'},
        });

        await store.registerDemand({
            title: 'Revisar endpoint',
            description: 'Revisar contrato da API',
            deadline: null,
            status: 'PENDING',
            priority: 'MEDIUM',
            observationToReview: null,
            observations: {textObservations: ['Validar os campos', 'Atualizar documentação']},
        });

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${store.url}/demands/register`,
            expect.objectContaining({
                observations: {textObservations: ['Validar os campos', 'Atualizar documentação']},
            }),
            expect.objectContaining({headers: expect.any(Object)}),
        );
    });
});
