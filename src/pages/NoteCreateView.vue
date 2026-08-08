<template>
  <div id="page-top" class="note-create-page daily-page">
    <AppSidebar/>

    <main class="workspace note-create-workspace">
      <header class="note-create-header">
        <RouterLink :to="{name: 'Notes'}" class="back-link" :aria-label="t('notes.backAriaLabel')"
                    @click.prevent="goBackToNotes">
          <i class="pi pi-arrow-left"/>
          <span>{{ t('notes.back') }}</span>
        </RouterLink>
        <p class="note-create-title">{{ t('notes.center') }}</p>
      </header>

      <div class="note-create-layout">
        <section class="note-card">
          <form class="note-form" @submit.prevent="() => updateNote()">
            <div class="field-group">
              <InputText id="note-title-input"
                         class="note-title-input" v-model="title" required autofocus fluid/>
            </div>

            <div class="editor-section">
              <div class="editor-wrapper">
                <div v-if="editor" class="editor-toolbar">
                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('bold') }"
                      @click="editor.chain().focus().toggleBold().run()"
                      :title="t('notes.toolbar.bold')"
                      :aria-label="t('notes.toolbar.bold')"
                  >
                    <strong>B</strong>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('italic') }"
                      @click="editor.chain().focus().toggleItalic().run()"
                      :title="t('notes.toolbar.italic')"
                      :aria-label="t('notes.toolbar.italic')"
                  >
                    <span class="format-italic">I</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('underline') }"
                      @click="editor.chain().focus().toggleUnderline().run()"
                      :title="t('notes.toolbar.underline')"
                      :aria-label="t('notes.toolbar.underline')"
                  >
                    <span class="format-underline">U</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('strike') }"
                      @click="editor.chain().focus().toggleStrike().run()"
                      :title="t('notes.toolbar.strike')"
                      :aria-label="t('notes.toolbar.strike')"
                  >
                    <span class="format-strike">S</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('highlight') }"
                      @click="editor.chain().focus().toggleHighlight().run()"
                      :title="t('notes.toolbar.highlight')"
                      :aria-label="t('notes.toolbar.highlight')"
                  >
                    <span class="format-highlight">H</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('code') }"
                      @click="editor.chain().focus().toggleCode().run()"
                      :title="t('notes.toolbar.inlineCode')"
                      :aria-label="t('notes.toolbar.inlineCode')"
                  >
                    <span class="format-code">&lt;/&gt;</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('subscript') }"
                      @click="editor.chain().focus().toggleSubscript().run()"
                      :title="t('notes.toolbar.subscript')"
                      :aria-label="t('notes.toolbar.subscript')"
                  >
                    <sub>X₂</sub>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('superscript') }"
                      @click="editor.chain().focus().toggleSuperscript().run()"
                      :title="t('notes.toolbar.superscript')"
                      :aria-label="t('notes.toolbar.superscript')"
                  >
                    <sup>X²</sup>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
                      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                      :title="t('notes.toolbar.heading1')"
                      :aria-label="t('notes.toolbar.heading1')"
                  >
                    H1
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
                      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                      :title="t('notes.toolbar.heading2')"
                      :aria-label="t('notes.toolbar.heading2')"
                  >
                    H2
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
                      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                      :title="t('notes.toolbar.heading3')"
                      :aria-label="t('notes.toolbar.heading3')"
                  >
                    H3
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('bulletList') }"
                      @click="editor.chain().focus().toggleBulletList().run()"
                      :title="t('notes.toolbar.bulletList')"
                      :aria-label="t('notes.toolbar.bulletList')"
                  >
                    <i class="pi pi-list"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('orderedList') }"
                      @click="editor.chain().focus().toggleOrderedList().run()"
                      :title="t('notes.toolbar.orderedList')"
                      :aria-label="t('notes.toolbar.orderedList')"
                  >
                    <span class="format-ol">1.</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('taskList') }"
                      @click="editor.chain().focus().toggleTaskList().run()"
                      :title="t('notes.toolbar.taskList')"
                      :aria-label="t('notes.toolbar.taskList')"
                  >
                    <i class="pi pi-check-square"/>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('blockquote') }"
                      @click="editor.chain().focus().toggleBlockquote().run()"
                      :title="t('notes.toolbar.quote')"
                      :aria-label="t('notes.toolbar.quote')"
                  >
                    <span class="format-quote">“</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('codeBlock') }"
                      @click="editor.chain().focus().toggleCodeBlock().run()"
                      :title="t('notes.toolbar.codeBlock')"
                      :aria-label="t('notes.toolbar.codeBlock')"
                  >
                    <i class="pi pi-code"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().setHorizontalRule().run()"
                      :title="t('notes.toolbar.horizontalRule')"
                      :aria-label="t('notes.toolbar.horizontalRule')"
                  >
                    <span class="format-hr">—</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('link') }"
                      @click="setLink"
                      :title="t('notes.toolbar.link')"
                      :aria-label="t('notes.toolbar.link')"
                  >
                    <i class="pi pi-link"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="addImage"
                      :title="t('notes.toolbar.image')"
                      :aria-label="t('notes.toolbar.image')"
                  >
                    <i class="pi pi-image"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
                      :title="t('notes.toolbar.table')"
                      :aria-label="t('notes.toolbar.table')"
                  >
                    <i class="pi pi-table"/>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
                      @click="editor.chain().focus().setTextAlign('left').run()"
                      :title="t('notes.toolbar.alignLeft')"
                      :aria-label="t('notes.toolbar.alignLeft')"
                  >
                    <i class="pi pi-align-left"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
                      @click="editor.chain().focus().setTextAlign('center').run()"
                      :title="t('notes.toolbar.alignCenter')"
                      :aria-label="t('notes.toolbar.alignCenter')"
                  >
                    <i class="pi pi-align-center"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
                      @click="editor.chain().focus().setTextAlign('right').run()"
                      :title="t('notes.toolbar.alignRight')"
                      :aria-label="t('notes.toolbar.alignRight')"
                  >
                    <i class="pi pi-align-right"/>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().undo().run()"
                      :disabled="!editor.can().undo()"
                      :title="t('notes.toolbar.undo')"
                      :aria-label="t('notes.toolbar.undo')"
                  >
                    <i class="pi pi-undo"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().redo().run()"
                      :disabled="!editor.can().redo()"
                      :title="t('notes.toolbar.redo')"
                      :aria-label="t('notes.toolbar.redo')"
                  >
                    <i class="pi pi-refresh"/>
                  </button>
                </div>

                <div class="editor-content-area" @click="focusEditor">
                  <editor-content class="editor-content" :editor="editor"/>
                </div>
              </div>
            </div>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref, watch} from "vue";
import {RouterLink, useRoute, useRouter} from "vue-router";
import InputText from "primevue/inputtext";
import AppSidebar from "@/components/AppSidebar.vue";
import {useNoteStore} from "@/stores/note-store.ts";
import type ResponseAPI from "@/utils/ResponseAPI.ts";
import type {Note} from "@/types/notes/Note.ts";
import {
  EditorContent, useEditor, StarterKit, TaskList, TaskItem, Image, Table,
  TableRow, TableHeader, TableCell, Highlight, Subscript, Superscript, TextAlign,
  createCopyableCodeBlock
} from "@/modules/tiptap";
import {useSubdomainStore} from "@/stores/subdomain-store.ts";
import {hasStoredPlanResource} from "@/composables/use-plan-resources.ts";
import {useLanguage} from "@/composables/use-language.ts";
import {useToast} from "primevue/usetoast";
import {showErrorToast} from "@/utils/toast.ts";

const route = useRoute();
const toast = useToast();
const {t} = useLanguage();
const router = useRouter();
const title = ref<string>("");
const content = ref<string>("");
const idNote = ref<string | undefined>("");
const hasSavedBeforeLeaving = ref(false);
const noteSubdomainId = ref<string | null>(null);
const canAccessSubdomains = hasStoredPlanResource('SUBDOMAINS');

let debounceTimeout: ReturnType<typeof setTimeout> | undefined;
let savePromise: Promise<ResponseAPI<Note>> | null = null;

const noteStore = useNoteStore();
const subdomainStore = useSubdomainStore();

const editor = useEditor({
  content: content.value,
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      link: {
        markdownLinks: true,
        openOnClick: true,
        HTMLAttributes: {rel: 'noopener noreferrer', target: '_blank'}
      }
    }),
    createCopyableCodeBlock({
      copy: t('notes.codeBlock.copy'),
      copied: t('notes.codeBlock.copied'),
    }),
    TaskList,
    TaskItem.configure({nested: true}),
    Image,
    Table.configure({resizable: true}),
    TableRow,
    TableHeader,
    TableCell,
    Highlight,
    Subscript,
    Superscript,
    TextAlign.configure({types: ['heading', 'paragraph']}),
  ],
  onUpdate: ({editor}) => {
    content.value = editor.getHTML();

    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      updateNote();
    }, 4000);
  }
});

const focusEditor = () => {
  if (editor.value && !editor.value.isFocused)
    editor.value.chain().focus().run();
};

const normalizeLinkHref = (url: string) => /^(?:[a-z][a-z\d+.-]*:|[/#])/i.test(url) ? url : `https://${url}`;

const setLink = () => {
  if (!editor.value)
    return;

  const previousUrl = editor.value.getAttributes('link').href;
  const isNewLinkWithoutSelection = editor.value.state.selection.empty && !previousUrl;
  let linkText = '';

  if (isNewLinkWithoutSelection) {
    const text = window.prompt(t('notes.linkTextPrompt'));

    if (text === null || text.trim() === '')
      return;

    linkText = text.trim();
  }

  const url = window.prompt(t('notes.linkUrlPrompt'), previousUrl);

  if (url === null)
    return;
  const trimmedUrl = url.trim();

  if (trimmedUrl === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }

  const href = normalizeLinkHref(trimmedUrl);

  if (!editor.value.can().setLink({href}))
    return;

  if (isNewLinkWithoutSelection) {
    editor.value.chain().focus().insertContent({
      type: 'text',
      text: linkText,
      marks: [{type: 'link', attrs: {href}}],
    }).run();
    return;
  }

  editor.value.chain().focus().extendMarkRange('link').setLink({href}).run();
};

const addImage = () => {
  if (!editor.value) return;
  const url = window.prompt(t('notes.imageUrlPrompt'));
  if (url)
    editor.value.chain().focus().setImage({src: url}).run();
};

const hasDraftContent = () =>
    Boolean(title.value.trim() || content.value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim());

const updateNote = async (updateRoute = true): Promise<ResponseAPI<Note>> => {
  if (savePromise) {
    await savePromise;
    return updateNote(updateRoute);
  }

  const isNewNote = !idNote.value;
  const request = noteStore.updateNote(title.value, content.value, idNote.value, noteSubdomainId.value);
  savePromise = request;

  try {
    const data = await request;

    if (data.isError) {
      showErrorToast(toast, t('notes.saveError'));
      return data;
    }

    idNote.value = data.response.id;

    if (isNewNote && updateRoute)
      await router.replace({name: 'Note Create', params: {idNote: data.response.id}});

    return data;
  } finally {
    if (savePromise === request)
      savePromise = null;
  }
};

const goBackToNotes = async () => {
  if (hasDraftContent()) {
    const data = await updateNote(false);

    if (data.isError)
      return;
  }

  hasSavedBeforeLeaving.value = true;
  await router.push({name: 'Notes'});
};

const updateContent = (data: ResponseAPI<Note>, syncEditor = false) => {
  if (!data.isError) {
    idNote.value = data.response.id;
    title.value = data.response.title;
    content.value = data.response.content;

    if (syncEditor && editor.value && !editor.value.isDestroyed) {
      editor.value.commands.setContent(data.response.content, {emitUpdate: false});
    }
  }
}

onMounted(async () => {
  const selectedSubdomainId = subdomainStore.selectedSubdomainId;

  if (selectedSubdomainId === null) {
    if (canAccessSubdomains)
      await subdomainStore.fetchSubdomains();
  }

  noteSubdomainId.value = subdomainStore.selectedSubdomainId;

  const param = route.params.idNote;
  idNote.value = Array.isArray(param) ? param[0] : (param || "");

  if (idNote.value) {
    const data: ResponseAPI<Note> = await noteStore.getNoteByID(idNote.value);
    updateContent(data, true);
  }
})

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout);

  if (!hasSavedBeforeLeaving.value && hasDraftContent())
    void updateNote(false);
})

watch(
    () => subdomainStore.selectedSubdomainId,
    async (_newValue, oldValue) => {
      if (oldValue !== null && oldValue !== undefined) {
        await router.push({name: 'Notes'});
      }
    },
);
</script>

<style scoped>
.note-create-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  color: var(--wh-text);
  background: var(--wh-bg);
}

.note-create-workspace {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 1100px;
  padding: 16px 20px 20px;
  overflow: hidden;
}

.note-create-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 0 0 auto;
  min-height: 36px;
  margin-bottom: 14px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  min-height: 32px;
  margin: 0;
  padding: 0 10px;
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-sm);
  background: var(--wh-surface);
  color: var(--wh-text-soft);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease;
  flex: 0 0 auto;
}

.back-link:hover {
  color: var(--wh-primary);
  border-color: var(--wh-primary);
  background: var(--wh-primary-soft);
}

.note-create-title {
  margin: 0;
  color: var(--wh-text);
  font-size: 0.875rem;
  font-weight: 750;
  letter-spacing: -0.015em;
}

.note-create-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 14px;
}

.note-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-lg);
  background: var(--wh-surface);
  box-shadow: var(--wh-shadow-sm);
  padding: 20px 24px;
}

.note-form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  gap: 6px;
}

.note-title-input {
  border-color: var(--wh-border-strong);
  border-radius: var(--wh-radius-sm);
  color: var(--wh-text);
  background: var(--wh-bg-subtle);
  font-size: 1rem;
}

.note-title-input:enabled:focus {
  border-color: var(--wh-primary);
  box-shadow: 0 0 0 3px var(--wh-focus);
}

.editor-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 6px;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  border: 1px solid var(--wh-border-strong);
  border-radius: var(--wh-radius-md);
  background: var(--wh-surface);
  overflow: hidden;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.editor-wrapper:focus-within {
  border-color: var(--wh-primary);
  box-shadow: 0 0 0 3px var(--wh-focus);
}

.editor-toolbar {
  flex: 0 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--wh-border);
  background: var(--wh-bg-subtle);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  border: none;
  border-radius: var(--wh-radius-sm);
  background: transparent;
  color: var(--wh-text-soft);
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
  transition: all 150ms ease;
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--wh-surface-hover);
  color: var(--wh-text);
}

.toolbar-btn.is-active {
  background: var(--wh-primary-soft);
  color: var(--wh-primary);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  margin: 0 4px;
  background: var(--wh-border);
}

.editor-content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  cursor: text;
}

.editor-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
}

:deep(.ProseMirror) {
  display: block;
  flex: 1;
  width: 100%;
  min-height: 100%;
  padding: 16px 20px;
  color: var(--wh-text);
  font-size: 0.975rem;
  line-height: 1.6;
  outline: none;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  color: var(--wh-text-muted);
  float: left;
  height: 0;
  pointer-events: none;
  font-style: italic;
}

:deep(.ProseMirror h1) {
  color: var(--wh-text);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0.8em 0 0.4em;
}

:deep(.ProseMirror h2) {
  color: var(--wh-text);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.8em 0 0.4em;
}

:deep(.ProseMirror h3) {
  color: var(--wh-text);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.6em 0 0.3em;
}

:deep(.ProseMirror p) {
  margin: 0.4em 0;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  margin: 0.4em 0;
  padding-left: 1.5rem;
}

:deep(.ProseMirror li) {
  margin: 0.2em 0;
}

:deep(.ProseMirror ul[data-type="taskList"]) {
  list-style: none;
  padding-left: 0;
}

:deep(.ProseMirror ul[data-type="taskList"] li) {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0.3em 0;
}

:deep(.ProseMirror ul[data-type="taskList"] li > label) {
  flex: 0 0 auto;
  margin-top: 0.2em;
  user-select: none;
}

:deep(.ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]) {
  width: 1.15em;
  height: 1.15em;
  accent-color: var(--wh-primary);
  border-radius: 4px;
  cursor: pointer;
}

:deep(.ProseMirror ul[data-type="taskList"] li > div) {
  flex: 1 1 auto;
}

:deep(.ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div) {
  text-decoration: line-through;
  opacity: 0.65;
}

:deep(.ProseMirror a) {
  color: var(--wh-primary);
  text-decoration: underline;
  cursor: pointer;
}

:deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  margin: 0.8em 0;
  border-radius: var(--wh-radius-md);
  border: 1px solid var(--wh-border);
}

:deep(.ProseMirror table) {
  width: 100%;
  margin: 1em 0;
  border-collapse: collapse;
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-sm);
  overflow: hidden;
}

:deep(.ProseMirror th),
:deep(.ProseMirror td) {
  padding: 8px 12px;
  border: 1px solid var(--wh-border);
  text-align: left;
}

:deep(.ProseMirror th) {
  font-weight: 700;
  background: var(--wh-bg-subtle);
  color: var(--wh-text);
}

:deep(.ProseMirror mark) {
  background: rgba(66, 201, 135, 0.28);
  color: var(--wh-text);
  padding: 0.1em 0.3em;
  border-radius: 4px;
}

:deep(.ProseMirror u) {
  text-decoration: underline;
}

:deep(.ProseMirror blockquote) {
  margin: 0.8em 0;
  padding-left: 1rem;
  border-left: 3px solid var(--wh-primary);
  color: var(--wh-text-soft);
  font-style: italic;
}

:deep(.ProseMirror code) {
  padding: 0.2em 0.4em;
  border-radius: var(--wh-radius-sm);
  color: var(--wh-primary);
  background: var(--wh-bg-subtle);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875em;
}

:deep(.ProseMirror pre) {
  position: relative;
  margin: 0.8em 0;
  padding: 12px 88px 12px 16px;
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-sm);
  background: var(--wh-bg-subtle);
  overflow-x: auto;
}

:deep(.ProseMirror pre code) {
  display: block;
  padding: 0;
  color: inherit;
  background: none;
}

:deep(.ProseMirror .code-copy-button) {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  padding: 3px 8px;
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-sm);
  color: var(--wh-text-soft);
  background: var(--wh-surface);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease;
}

:deep(.ProseMirror .code-copy-button:hover) {
  color: var(--wh-primary);
  border-color: var(--wh-primary);
  background: var(--wh-primary-soft);
}

:deep(.ProseMirror .code-copy-button:focus-visible) {
  outline: 2px solid var(--wh-primary);
  outline-offset: 2px;
}

:deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid var(--wh-border);
  margin: 1.5em 0;
}

@media (max-width: 640px) {
  .note-create-workspace {
    padding: 14px 12px 18px;
    overflow-y: auto;
  }

  .note-card {
    padding: 16px;
  }

  .note-create-header {
    margin-bottom: 10px;
  }

  .back-link span {
    display: none;
  }

  .back-link {
    width: 32px;
    padding: 0;
    justify-content: center;
  }

  .editor-toolbar {
    gap: 2px;
    padding: 6px;
  }

  .toolbar-btn {
    min-width: 30px;
    height: 30px;
  }
}
</style>
