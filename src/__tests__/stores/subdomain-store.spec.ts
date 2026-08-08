import axios from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from 'pinia';
import {useSubdomainStore} from '../../stores/subdomain-store.ts';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

describe('subdomain store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        localStorage.clear();
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

    it('clears the selected subdomain when the session ends', () => {
        const store = useSubdomainStore();
        store.subdomains = [{id: 'subdomain-1', name: 'Engineering', urlPhoto: null}];
        store.hasLoaded = true;
        store.selectSubdomain('subdomain-1');

        store.clearSubdomains();

        expect(store.subdomains).toEqual([]);
        expect(store.selectedSubdomainKey).toBeNull();
        expect(store.hasLoaded).toBe(false);
        expect(localStorage.getItem('selectedSubdomain')).toBeNull();
    });
});
