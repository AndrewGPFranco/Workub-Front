import axios from 'axios';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createPinia, setActivePinia} from 'pinia';
import {useNoteStore} from '../../stores/note-store.ts';
import {useSubdomainStore} from '../../stores/subdomain-store.ts';

vi.mock('axios');

const mockedAxios = vi.mocked(axios);

describe('note store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    it('loads a requested page when no subdomain is selected', async () => {
        const store = useNoteStore();
        mockedAxios.get.mockResolvedValueOnce({data: {httpStatusCode: 200, data: {content: []}}});

        await store.getNotes(2);

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${store.url}/api/v1/notes/?page=2`,
            expect.objectContaining({headers: expect.any(Object)}),
        );
    });

    it('loads a requested page for the selected subdomain', async () => {
        const store = useNoteStore();
        const subdomainStore = useSubdomainStore();
        subdomainStore.subdomains = [{id: 'subdomain-1', name: 'Engineering', urlPhoto: null}];
        subdomainStore.selectSubdomain('subdomain-1');
        mockedAxios.get.mockResolvedValueOnce({data: {httpStatusCode: 200, data: {content: []}}});

        await store.getNotes(1);

        expect(mockedAxios.get).toHaveBeenCalledWith(
            `${store.url}/api/v1/notes/subdomain/subdomain-1?page=1`,
            expect.objectContaining({headers: expect.any(Object)}),
        );
    });

    it('sends an existing note id when updating a note', async () => {
        const store = useNoteStore();
        mockedAxios.post.mockResolvedValueOnce({data: {httpStatusCode: 200, data: {}}});

        await store.updateNote('Title', '<p>Content</p>', 'note-1');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            `${store.url}/api/v1/notes/register`,
            expect.objectContaining({idNote: 'note-1'}),
            expect.objectContaining({headers: expect.any(Object)}),
        );
    });
});
