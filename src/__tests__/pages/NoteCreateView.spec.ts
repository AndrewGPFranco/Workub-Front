import {defineComponent, h} from 'vue';
import {flushPromises, mount} from '@vue/test-utils';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const mocks = vi.hoisted(() => ({
    getNoteByID: vi.fn(),
    updateNote: vi.fn(),
    fetchSubdomains: vi.fn(),
    push: vi.fn(),
    replace: vi.fn(),
    editor: null as any,
    starterKitConfigure: vi.fn(),
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

vi.mock('primevue/usetoast', () => ({
    useToast: () => ({}),
}));

vi.mock('@/modules/tiptap', async () => {
    const {ref} = await import('vue');
    const extension = {configure: vi.fn(() => extension)};
    const starterKit = {configure: mocks.starterKitConfigure};

    mocks.starterKitConfigure.mockReturnValue(extension);

    return {
        EditorContent: defineComponent({setup: () => () => null}),
        Image: extension,
        Highlight: extension,
        StarterKit: starterKit,
        Subscript: extension,
        Superscript: extension,
        Table: extension,
        TableCell: extension,
        TableHeader: extension,
        TableRow: extension,
        TaskItem: extension,
        TaskList: extension,
        TextAlign: extension,
        createCopyableCodeBlock: vi.fn(() => extension),
        useEditor: () => ref(mocks.editor),
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
        mocks.editor = null;
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

        expect(mocks.updateNote).toHaveBeenNthCalledWith(1, '', '', '', null);
        expect(mocks.replace).toHaveBeenCalledWith({name: 'Note Create', params: {idNote: 'note-1'}});
        expect(mocks.updateNote).toHaveBeenNthCalledWith(2, '', '', 'note-1', null);
    });

    it('converts Markdown link syntax into a labeled link', () => {
        mount(NoteCreateView, {
            global: {
                stubs: {AppSidebar: true, InputText: true},
            },
        });

        expect(mocks.starterKitConfigure).toHaveBeenCalledWith(expect.objectContaining({
            link: expect.objectContaining({markdownLinks: true}),
        }));
    });

    it('inserts a labeled link when there is no selected text', async () => {
        const chain: Record<string, any> = {};
        const run = vi.fn();

        chain.focus = vi.fn(() => chain);
        chain.insertContent = vi.fn(() => chain);
        chain.run = run;

        mocks.editor = {
            can: () => ({
                redo: () => false,
                setLink: () => true,
                undo: () => false,
            }),
            chain: () => chain,
            getAttributes: () => ({}),
            isActive: () => false,
            isFocused: true,
            state: {selection: {empty: true}},
        };
        vi.spyOn(window, 'prompt')
            .mockReturnValueOnce(' Board Sprint ')
            .mockReturnValueOnce(' example.com ');

        const wrapper = mount(NoteCreateView, {
            global: {
                stubs: {AppSidebar: true, InputText: true},
            },
        });

        await wrapper.get('[aria-label^="Inserir link"]').trigger('click');

        expect(chain.insertContent).toHaveBeenCalledWith({
            type: 'text',
            text: 'Board Sprint',
            marks: [{type: 'link', attrs: {href: 'https://example.com'}}],
        });
        expect(run).toHaveBeenCalledOnce();
    });
});
