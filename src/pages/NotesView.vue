<template>
  <div id="page-top" class="notes-page daily-page">
    <AppSidebar/>

    <main class="workspace notes-workspace">
      <header class="notes-header">
        <div class="notes-header-text">
          <p class="notes-eyebrow">Central de organização <span>/</span> {{ todayLabel }}</p>
          <h1 class="notes-title">Minhas<br><em>Anotações</em></h1>
          <p class="notes-subtitle">{{ notes.length }} {{ notes.length === 1 ? 'nota' : 'notas' }}</p>
        </div>

        <router-link :to="{name: 'Note Create'}" class="btn-new-note">
          <i class="pi pi-plus"/>
          <span>Nova nota</span>
        </router-link>
      </header>

      <section v-if="notes.length" class="notes-grid">
        <router-link
            v-for="note in notes"
            :key="note.id"
            :to="{path: `/notes/new/${note.id}`}"
            class="note-card"
        >
          <div class="note-card-header">
            <h2 class="note-card-title">{{ note.title || 'Sem título' }}</h2>
            <span v-if="note.isPinned" class="note-pin-icon" title="Fixada" aria-label="Nota fixada">
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
      </section>

      <section v-else class="notes-empty">
        <div class="empty-icon-wrapper">
          <i class="pi pi-file-edit empty-icon"/>
        </div>
        <h2 class="empty-title">Nenhuma anotação ainda</h2>
        <p class="empty-description">Crie sua primeira nota para começar a organizar suas ideias.</p>
        <router-link :to="{name: 'Note Create'}" class="btn-empty-create">
          <i class="pi pi-plus"/>
          Criar primeira nota
        </router-link>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type {Note} from "@/types/notes/Note.ts";
import {useNoteStore} from "@/stores/note-store.ts";
import {computed, onMounted, ref, watch} from "vue";
import AppSidebar from "@/components/AppSidebar.vue";
import {useLanguage} from "@/composables/use-language.ts";
import {useSubdomainStore} from "@/stores/subdomain-store.ts";
import {hasStoredPlanResource} from "@/composables/use-plan-resources.ts";

const notes = ref<Note[]>([]);
const noteStore = useNoteStore();
const subdomainStore = useSubdomainStore();
const canAccessSubdomains = hasStoredPlanResource('SUBDOMAINS');
const {language} = useLanguage();
const todayLabel = computed(() => new Intl.DateTimeFormat(language.value, {
  day: '2-digit',
  month: 'long',
}).format(new Date()));

const stripHtml = (html: string): string => {
  if (!html) return 'Nota vazia...';
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > 120 ? text.slice(0, 120) + '…' : text || 'Nota vazia...';
};

const formatDate = (date: Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora mesmo';
  if (diffMin < 60) return `${diffMin}min atrás`;
  if (diffHour < 24) return `${diffHour}h atrás`;
  if (diffDay < 7) return `${diffDay}d atrás`;
  return d.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
};

onMounted(async () => {
  if (canAccessSubdomains)
    await subdomainStore.fetchSubdomains();

  if (subdomainStore.getSubdomains.length) {
    const response = await noteStore.getNotes();

    if (response.httpStatusCode === 200)
      notes.value = response.data;
  }
})

watch(
    () => subdomainStore.selectedSubdomainId,
    async () => {
      if (!canAccessSubdomains)
        return;

      const response = await noteStore.getNotes();

      if (response.httpStatusCode === 200)
        notes.value = response.data;
    },
);
</script>

<style scoped>
/* ── Page Layout ── */
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

/* ── Header ── */
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

/* ── Notes Grid ── */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 18px;
}

/* ── Note Card ── */
.note-card {
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 22px;
  border-radius: var(--wh-radius-lg);
  background: var(--wh-surface);
  border: 1px solid var(--wh-border);
  text-decoration: none;
  color: inherit;
  transition: all 200ms ease;
  cursor: pointer;
  min-height: 172px;
  box-shadow: 0 1px 0 color-mix(in srgb, var(--wh-text) 3%, transparent);
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

/* ── Empty State ── */
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
