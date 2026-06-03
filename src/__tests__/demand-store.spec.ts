import axios from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from 'pinia';
import {useDemandStore} from '@/stores/demand-store.ts';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);
const pageResponse = {
    data: {
        httpStatusCode: 200,
        data: {
            content: [],
            page: 0,
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
            finalizedAt: '2026-06-02',
        };
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                httpStatusCode: 200,
                data: {
                    content: [demand],
                    page: 0,
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
});
