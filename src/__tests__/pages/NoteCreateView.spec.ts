import {defineComponent, h} from 'vue';
import {flushPromises, mount} from '@vue/test-utils';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
    getNoteByID: vi.fn(),
    updateNote: vi.fn(),
    fetchSubdomains: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
}));

vi.mock('@/stores/note-store.ts', () => ({
    useNoteStore: () => ({
        getNoteByID: mocks.getNoteByID,
        updateNote: mocks.updateNote,
    }),
}));

vi.mock('@/stores/subdomain-store.ts', () => ({
    useSubdomainStore: () => ({
        selectedSubdomainId: null,
        fetchSubdomains: mocks.fetchSubdomains,
    }),
}));

vi.mock('@/modules/tiptap', async () => {
    const {ref} = await import('vue');
    const extension = {configure: vi.fn(() => extension)};

    return {
        EditorContent: defineComponent({setup: () => () => null}),
        Image: extension,
        Highlight: extension,
        StarterKit: extension,
        Subscript: extension,
        Superscript: extension,
        Table: extension,
        TableCell: extension,
        TableHeader: extension,
        TableRow: extension,
        TaskItem: extension,
        TaskList: extension,
        TextAlign: extension,
        useEditor: () => ref(null),
    };
});

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>();

    return {
        ...actual,
        RouterLink: defineComponent({
            emits: ['click'],
            setup(_, {emit, slots}) {
                return () => h('a', {onClick: (event: MouseEvent) => emit('click', event)}, slots.default?.());
            },
        }),
        useRoute: () => ({params: {}}),
        useRouter: () => ({push: mocks.push, replace: mocks.replace}),
    };
});

import NoteCreateView from '../../pages/NoteCreateView.vue';

describe('NoteCreateView', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.updateNote.mockResolvedValue({
            isError: false,
            response: {
                id: 'note-1',
                title: 'Title',
                content: '<p>Content</p>',
            },
        });
    });

    it('uses the returned id on subsequent saves of a newly created note', async () => {
        const wrapper = mount(NoteCreateView, {
            global: {
                stubs: {AppSidebar: true, InputText: true},
            },
        });

        await flushPromises();
        await wrapper.get('form').trigger('submit');
        await flushPromises();
        await wrapper.get('form').trigger('submit');
        await flushPromises();

        expect(mocks.updateNote).toHaveBeenNthCalledWith(1, '', '', '');
        expect(mocks.replace).toHaveBeenCalledWith({name: 'Note Create', params: {idNote: 'note-1'}});
        expect(mocks.updateNote).toHaveBeenNthCalledWith(2, 'Title', '<p>Content</p>', 'note-1');
    });
});
