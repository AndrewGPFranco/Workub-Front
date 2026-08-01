<template>
  <div id="page-top" class="notes-page daily-page">
    <AppSidebar/>

    <main class="workspace notes-workspace">
      <header class="notes-header">
        <div class="notes-header-text">
          <p class="notes-eyebrow">{{ t('notes.organizationCenter') }} <span>/</span> {{ todayLabel }}</p>
          <h1 class="notes-title">{{ t('notes.my') }}<br><em>{{ t('notes.title') }}</em></h1>
          <p class="notes-subtitle">{{ notes.length }} {{ notes.length === 1 ? t('notes.note') : t('notes.notes') }}</p>
        </div>

        <router-link :to="{name: 'Note Create'}" class="btn-new-note">
          <i class="pi pi-plus"/>
          <span>{{ t('notes.new') }}</span>
        </router-link>
      </header>

      <section v-if="notes.length" class="notes-grid">
        <article
            v-for="note in notes"
            :key="note.id"
            class="note-card"
        >
          <button
              type="button"
              class="btn-delete-note"
              :aria-label="t('notes.delete')"
              :title="t('notes.delete')"
              @click="deleteNote(note)"
          >
            <i class="pi pi-trash"/>
          </button>

          <router-link :to="{path: `/notes/new/${note.id}`}" class="note-card-link">
            <div class="note-card-header">
              <h2 class="note-card-title">{{ note.title || t('notes.untitled') }}</h2>
              <span v-if="note.isPinned" class="note-pin-icon" :title="t('notes.pinned')"
                    :aria-label="t('notes.pinned')">
                <i class="pi pi-bookmark-fill"/>
              </span>
            </div>

            <p class="note-card-preview" v-html="stripHtml(note.content)"/>

            <footer class="note-card-footer">
              <time class="note-card-date">
                <i class="pi pi-clock"/>
                {{ formatDate(note.updatedAt) }}
              </time>
            </footer>
          </router-link>
        </article>
      </section>

      <section v-else class="notes-empty">
        <div class="empty-icon-wrapper">
          <i class="pi pi-file-edit empty-icon"/>
        </div>
        <h2 class="empty-title">{{ t('notes.emptyTitle') }}</h2>
        <p class="empty-description">{{ t('notes.emptyDescription') }}</p>
        <router-link :to="{name: 'Note Create'}" class="btn-empty-create">
          <i class="pi pi-plus"/>
          {{ t('notes.createFirst') }}
        </router-link>
      </section>

      <div class="notes-pagination">
        <Paginator
            :first="currentPage * rowsPerPage"
            :rows="rowsPerPage"
            :totalRecords="totalRecords"
            @page="onPageChange"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import {useToast} from "primevue/usetoast";
import Paginator from 'primevue/paginator';
import type {Note} from "@/types/notes/Note.ts";
import {useNoteStore} from "@/stores/note-store.ts";
import {computed, onMounted, ref, watch} from "vue";
import AppSidebar from "@/components/AppSidebar.vue";
import {useLanguage} from "@/composables/use-language.ts";
import {useSubdomainStore} from "@/stores/subdomain-store.ts";
import type {PageResponse} from "@/types/http/PageResponse.ts";
import {showErrorToast, showSuccessToast} from "@/utils/toast.ts";
import {hasStoredPlanResource} from "@/composables/use-plan-resources.ts";

const toast = useToast();
const noteStore = useNoteStore();
const currentPage = ref<number>(0);
const {language, t} = useLanguage();
const subdomainStore = useSubdomainStore();
const isInitializingSubdomains = ref(false);
const canAccessSubdomains = hasStoredPlanResource('SUBDOMAINS');
const notes = computed(() => responsePagination.value.content ?? []);
const responsePagination = ref<PageResponse<Note>>({} as PageResponse<Note>);
const rowsPerPage = computed(() => responsePagination.value.pageSize || 10);

const totalRecords = computed(() => {
  const {pageSize = rowsPerPage.value, totalElements = 0, totalPages = 0} = responsePagination.value;
  return totalElements > totalPages ? totalElements : totalPages * pageSize;
});

const todayLabel = computed(() => new Intl.DateTimeFormat(language.value, {
  day: '2-digit',
  month: 'long',
}).format(new Date()));

const stripHtml = (html: string): string => {
  if (!html) return t('notes.empty');
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 120 ? text.slice(0, 120) + '…' : text || t('notes.empty');
};

const formatDate = (date: Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return t('notes.now');
  if (diffMin < 60) return `${diffMin}${t('notes.minutesAgo')}`;
  if (diffHour < 24) return `${diffHour}${t('notes.hoursAgo')}`;
  if (diffDay < 7) return `${diffDay}${t('notes.daysAgo')}`;
  return d.toLocaleDateString(language.value, {day: '2-digit', month: 'short'});
};

const deleteNote = async (note: Note): Promise<void> => {
  const response = await noteStore.deleteNote(note.id);

  if (!response.isError) {
    showSuccessToast(toast, response.response)

    await fetchNotes();
    return;
  }

  showErrorToast(toast, t('notes.deleteError'));
}

async function fetchNotes() {
  const response = await noteStore.getNotes(currentPage.value);

  if (response.httpStatusCode === 200) {
    responsePagination.value = response.data;
  }
}

const onPageChange = async ({page}: { page: number }) => {
  currentPage.value = page;
  await fetchNotes();
};

onMounted(async () => {
  if (canAccessSubdomains) {
    isInitializingSubdomains.value = true;
    await subdomainStore.fetchSubdomains();
    isInitializingSubdomains.value = false;
  }

  await fetchNotes();
});

watch(
    () => subdomainStore.selectedSubdomainId,
    async () => {
      if (!canAccessSubdomains || isInitializingSubdomains.value)
        return;

      currentPage.value = 0;
      await fetchNotes();
    },
);
</script>

<style scoped>
.notes-page {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  color: var(--wh-text);
  background: var(--wh-bg);
}

.notes-workspace {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  width: 100%;
  max-width: 1180px;
  padding: 30px 32px 36px;
  overflow-y: auto;
}

.notes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  margin-bottom: 28px;
}

.notes-header-text {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.notes-eyebrow {
  color: var(--wh-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.notes-eyebrow span {
  padding: 0 7px;
  color: var(--wh-accent);
}

.notes-title {
  margin: 6px 0 0;
  font-family: Georgia, serif;
  font-size: clamp(2.8rem, 5vw, 5.4rem);
  font-weight: 400;
  color: var(--wh-text);
  letter-spacing: -0.095em;
  line-height: 0.88;
}

.notes-title em {
  color: var(--wh-accent);
  font-weight: 400;
}

.notes-subtitle {
  font-size: 0.85rem;
  color: var(--wh-text-muted);
  margin: 0;
  font-weight: 500;
}

.btn-new-note {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 18px;
  border-radius: var(--wh-radius-md);
  background: var(--wh-primary);
  color: var(--wh-primary-contrast);
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 200ms ease;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--wh-primary) 25%, transparent);
}

.btn-new-note:hover {
  background: var(--wh-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--wh-primary) 35%, transparent);
}

.btn-new-note:active {
  transform: translateY(0);
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 18px;
}

.notes-pagination {
  flex: 0 0 auto;
  margin-top: auto;
  padding-top: 24px;
}

.note-card {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 22px;
  border-radius: var(--wh-radius-lg);
  background: var(--wh-surface);
  border: 1px solid var(--wh-border);
  color: inherit;
  transition: all 200ms ease;
  min-height: 172px;
  box-shadow: 0 1px 0 color-mix(in srgb, var(--wh-text) 3%, transparent);
}

.note-card-link {
  display: flex;
  flex: 1;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}

.btn-delete-note {
  position: absolute;
  z-index: 1;
  right: 16px;
  bottom: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--wh-text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all 200ms ease;
}

.note-card:hover .btn-delete-note,
.btn-delete-note:focus-visible {
  opacity: 1;
}

.btn-delete-note:hover {
  background: color-mix(in srgb, #dc2626 12%, transparent);
  color: #dc2626;
}

.note-card:hover {
  border-color: var(--wh-primary);
  background: var(--wh-surface-hover);
  box-shadow: var(--wh-shadow-md);
  transform: translateY(-2px);
}

.note-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.note-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--wh-text);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-pin-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--wh-primary-soft);
  font-size: 0.75rem;
  color: var(--wh-primary);
  opacity: 0.8;
}

.note-card-preview {
  font-size: 0.825rem;
  color: var(--wh-text-muted);
  line-height: 1.55;
  margin: 0 0 auto;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-card-footer {
  display: flex;
  align-items: center;
  margin-top: 18px;
  padding-top: 13px;
  border-top: 1px solid var(--wh-border);
}

.note-card-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--wh-text-muted);
  font-weight: 500;
}

.note-card-date .pi {
  font-size: 0.7rem;
}

.notes-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 0;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--wh-primary-soft);
  margin-bottom: 24px;
}

.empty-icon {
  font-size: 2rem;
  color: var(--wh-primary);
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--wh-text);
  margin: 0 0 8px;
}

.empty-description {
  font-size: 0.875rem;
  color: var(--wh-text-muted);
  margin: 0 0 28px;
  max-width: 320px;
  line-height: 1.5;
}

.btn-empty-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--wh-radius-md);
  background: var(--wh-primary);
  color: var(--wh-primary-contrast);
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 200ms ease;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--wh-primary) 25%, transparent);
}

.btn-empty-create:hover {
  background: var(--wh-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 24px color-mix(in srgb, var(--wh-primary) 35%, transparent);
}

@media (max-width: 640px) {
  .notes-workspace {
    padding: 20px 16px 24px;
  }

  .notes-header {
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 22px;
  }

  .btn-new-note {
    padding: 10px 12px;
  }

  .btn-new-note span {
    display: none;
  }

  .notes-title {
    font-size: clamp(2.6rem, 15vw, 4rem);
  }

  .notes-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .note-card {
    min-height: 150px;
    padding: 18px;
  }

  .notes-empty {
    justify-content: flex-start;
    padding-top: 64px;
  }
}
</style>
