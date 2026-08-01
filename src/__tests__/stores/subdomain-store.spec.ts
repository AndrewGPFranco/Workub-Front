import axios from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from 'pinia';
import {useSubdomainStore} from '../../stores/subdomain-store.ts';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

describe('subdomain store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('shares an in-flight subdomain request', async () => {
        const store = useSubdomainStore();
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                httpStatusCode: 200,
                data: [{id: 'subdomain-1', name: 'Engineering'}],
            },
        });

        const [firstResponse, secondResponse] = await Promise.all([
            store.fetchSubdomains(),
            store.fetchSubdomains(),
        ]);

        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(firstResponse.response).toEqual(secondResponse.response);
        expect(store.getSubdomains).toHaveLength(1);
    });
});
