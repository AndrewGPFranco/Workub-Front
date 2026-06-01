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
});
