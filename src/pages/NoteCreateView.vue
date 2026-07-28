<template>
  <div id="page-top" class="note-create-page daily-page">
    <AppSidebar/>

    <main class="workspace note-create-workspace">
      <RouterLink :to="{name: 'Notes'}" class="back-link">
        <i class="pi pi-arrow-left"/>
      </RouterLink>

      <div class="note-create-layout">
        <section class="note-card">
          <form class="note-form" @submit.prevent="updateNote">
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
                      title="Negrito (**texto**)"
                      aria-label="Negrito"
                  >
                    <strong>B</strong>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('italic') }"
                      @click="editor.chain().focus().toggleItalic().run()"
                      title="Itálico (*texto*)"
                      aria-label="Itálico"
                  >
                    <span class="format-italic">I</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('underline') }"
                      @click="editor.chain().focus().toggleUnderline().run()"
                      title="Sublinhado (<u>texto</u>)"
                      aria-label="Sublinhado"
                  >
                    <span class="format-underline">U</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('strike') }"
                      @click="editor.chain().focus().toggleStrike().run()"
                      title="Tachado (~~texto~~)"
                      aria-label="Tachado"
                  >
                    <span class="format-strike">S</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('highlight') }"
                      @click="editor.chain().focus().toggleHighlight().run()"
                      title="Destaque (==texto==)"
                      aria-label="Destaque"
                  >
                    <span class="format-highlight">H</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('code') }"
                      @click="editor.chain().focus().toggleCode().run()"
                      title="Código Inline (`código`)"
                      aria-label="Código Inline"
                  >
                    <span class="format-code">&lt;/&gt;</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('subscript') }"
                      @click="editor.chain().focus().toggleSubscript().run()"
                      title="Subscrito (X₂)"
                      aria-label="Subscrito"
                  >
                    <sub>X₂</sub>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('superscript') }"
                      @click="editor.chain().focus().toggleSuperscript().run()"
                      title="Sobrescrito (X²)"
                      aria-label="Sobrescrito"
                  >
                    <sup>X²</sup>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
                      @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                      title="Título 1 (# )"
                      aria-label="Título 1"
                  >
                    H1
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
                      @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                      title="Título 2 (## )"
                      aria-label="Título 2"
                  >
                    H2
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
                      @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                      title="Título 3 (### )"
                      aria-label="Título 3"
                  >
                    H3
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('bulletList') }"
                      @click="editor.chain().focus().toggleBulletList().run()"
                      title="Lista com Marcadores (- )"
                      aria-label="Lista com Marcadores"
                  >
                    <i class="pi pi-list"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('orderedList') }"
                      @click="editor.chain().focus().toggleOrderedList().run()"
                      title="Lista Numerada (1. )"
                      aria-label="Lista Numerada"
                  >
                    <span class="format-ol">1.</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('taskList') }"
                      @click="editor.chain().focus().toggleTaskList().run()"
                      title="Lista de Tarefas Checkbox (- [ ])"
                      aria-label="Lista de Tarefas Checkbox"
                  >
                    <i class="pi pi-check-square"/>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('blockquote') }"
                      @click="editor.chain().focus().toggleBlockquote().run()"
                      title="Citação (> )"
                      aria-label="Citação"
                  >
                    <span class="format-quote">“</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('codeBlock') }"
                      @click="editor.chain().focus().toggleCodeBlock().run()"
                      title="Bloco de Código (```)"
                      aria-label="Bloco de Código"
                  >
                    <i class="pi pi-code"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().setHorizontalRule().run()"
                      title="Linha Divisória (---)"
                      aria-label="Linha Divisória"
                  >
                    <span class="format-hr">—</span>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive('link') }"
                      @click="setLink"
                      title="Inserir Link ([texto](url))"
                      aria-label="Inserir Link"
                  >
                    <i class="pi pi-link"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="addImage"
                      title="Inserir Imagem (![alt](url))"
                      aria-label="Inserir Imagem"
                  >
                    <i class="pi pi-image"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()"
                      title="Inserir Tabela"
                      aria-label="Inserir Tabela"
                  >
                    <i class="pi pi-table"/>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
                      @click="editor.chain().focus().setTextAlign('left').run()"
                      title="Alinhar à Esquerda"
                      aria-label="Alinhar à Esquerda"
                  >
                    <i class="pi pi-align-left"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
                      @click="editor.chain().focus().setTextAlign('center').run()"
                      title="Centralizar"
                      aria-label="Centralizar"
                  >
                    <i class="pi pi-align-center"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
                      @click="editor.chain().focus().setTextAlign('right').run()"
                      title="Alinhar à Direita"
                      aria-label="Alinhar à Direita"
                  >
                    <i class="pi pi-align-right"/>
                  </button>

                  <span class="toolbar-divider"/>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().undo().run()"
                      :disabled="!editor.can().undo()"
                      title="Desfazer (Ctrl+Z)"
                      aria-label="Desfazer"
                  >
                    <i class="pi pi-undo"/>
                  </button>

                  <button
                      type="button"
                      class="toolbar-btn"
                      @click="editor.chain().focus().redo().run()"
                      :disabled="!editor.can().redo()"
                      title="Refazer (Ctrl+Y)"
                      aria-label="Refazer"
                  >
                    <i class="pi pi-refresh"/>
                  </button>
                </div>

                <div class="editor-content-area" @click="focusEditor">
                  <editor-content class="editor-content" :editor="editor"/>
                </div>
              </div>
            </div>

            <footer class="form-actions">
              <RouterLink :to="{name: 'Notes'}">
                <Button type="button" label="Cancelar" severity="secondary" outlined/>
              </RouterLink>
              <Button type="submit" label="Salvar Anotação" icon="pi pi-check"/>
            </footer>
          </form>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {RouterLink, useRoute} from "vue-router";
import StarterKit from "@tiptap/starter-kit";
import {EditorContent, useEditor} from "@tiptap/vue-3";
import {TaskList} from "@tiptap/extension-task-list";
import {TaskItem} from "@tiptap/extension-task-item";
import {Link} from "@tiptap/extension-link";
import {Image} from "@tiptap/extension-image";
import {Table} from "@tiptap/extension-table";
import {TableRow} from "@tiptap/extension-table-row";
import {TableHeader} from "@tiptap/extension-table-header";
import {TableCell} from "@tiptap/extension-table-cell";
import {Highlight} from "@tiptap/extension-highlight";
import {Underline} from "@tiptap/extension-underline";
import {Subscript} from "@tiptap/extension-subscript";
import {Superscript} from "@tiptap/extension-superscript";
import {TextAlign} from "@tiptap/extension-text-align";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import AppSidebar from "@/components/AppSidebar.vue";
import {useNoteStore} from "@/stores/note-store.ts";
import type ResponseAPI from "@/utils/ResponseAPI.ts";
import type {Note} from "@/types/notes/Note.ts";
import router from "@/router";
import {showSuccessToast} from "@/utils/toast.ts";
import {useToast} from "primevue/usetoast";

const route = useRoute()
const toast = useToast();
const title = ref<string>("");
const content = ref<string>("");
const idNote = ref<string | undefined>("");

const noteStore = useNoteStore();
const editor = useEditor({
  content: content.value,
  extensions: [
    StarterKit,
    TaskList,
    TaskItem.configure({nested: true}),
    Link.configure({openOnClick: false, HTMLAttributes: {rel: 'noopener noreferrer', target: '_blank'}}),
    Image,
    Table.configure({resizable: true}),
    TableRow,
    TableHeader,
    TableCell,
    Highlight,
    Underline,
    Subscript,
    Superscript,
    TextAlign.configure({types: ['heading', 'paragraph']}),
  ],
  onUpdate: ({editor}) => {
    content.value = editor.getHTML();
  }
});

const focusEditor = () => {
  if (editor.value && !editor.value.isFocused)
    editor.value.chain().focus().run();
};

const setLink = () => {
  if (!editor.value)
    return;

  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URL do Link:', previousUrl);

  if (url === null)
    return;
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({href: url}).run();
};

const addImage = () => {
  if (!editor.value) return;
  const url = window.prompt('URL da Imagem:');
  if (url)
    editor.value.chain().focus().setImage({src: url}).run();
};

const updateNote = async () => {
  if (!title.value.length)
    console.log("ERRO")

  const data = await noteStore.updateNote(title.value, content.value, idNote.value);

  updateContent(data, true);

  await router.push({name: "Notes"});
};

const updateContent = (data: ResponseAPI<Note>, isUpdate: boolean) => {
  if (!data.isError) {
    title.value = data.response.title;
    content.value = data.response.content;

    editor.value?.commands.setContent(data.response.content);

    if (isUpdate)
      showSuccessToast(toast, "Anotação salva!");
  }
}

onMounted(async () => {
  const param = route.params.idNote;
  idNote.value = Array.isArray(param) ? param[0] : (param || "");

  if (idNote.value) {
    const data: ResponseAPI<Note> = await noteStore.getNoteByID(idNote.value);
    updateContent(data, false);
  }
})
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

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-bottom: 12px;
  color: var(--wh-text-soft);
  font-size: 0.8rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 150ms ease;
  flex: 0 0 auto;
}

.back-link:hover {
  color: var(--wh-primary);
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

.field-label {
  color: var(--wh-text);
  font-size: 0.875rem;
  font-weight: 600;
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
  display: flex;
  flex-direction: column;
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
  margin: 0.8em 0;
  padding: 12px 16px;
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-sm);
  background: var(--wh-bg-subtle);
  overflow-x: auto;
}

:deep(.ProseMirror pre code) {
  padding: 0;
  color: inherit;
  background: none;
}

:deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid var(--wh-border);
  margin: 1.5em 0;
}

.form-actions {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px solid var(--wh-border);
}

@media (max-width: 640px) {
  .note-create-workspace {
    padding: 14px 12px 18px;
    overflow-y: auto;
  }

  .note-card {
    padding: 16px;
  }

  .editor-toolbar {
    gap: 2px;
    padding: 6px;
  }

  .toolbar-btn {
    min-width: 30px;
    height: 30px;
  }

  .form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .form-actions a,
  .form-actions .p-button {
    width: 100%;
  }
}
</style>