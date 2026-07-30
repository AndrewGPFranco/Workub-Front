<template>
  <div id="page-top" class="daily-page">
    <AppSidebar/>

    <main class="workspace">
      <p v-for="note in notes" :key="note.id">
        <router-link :to="{path: `/notes/new/${note.id}`}">{{ note.title }}</router-link>
      </p>

      <router-link :to="{name: 'Note Create'}">
        Cadastrar
      </router-link>
    </main>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import type {Note} from "@/types/notes/Note.ts";
import {useNoteStore} from "@/stores/note-store.ts";
import AppSidebar from "@/components/AppSidebar.vue";
import {useSubdomainStore} from "@/stores/subdomain-store.ts";
import {hasStoredPlanResource} from "@/composables/use-plan-resources.ts";

const notes = ref<Note[]>([]);
const noteStore = useNoteStore();
const subdomainStore = useSubdomainStore();
const canAccessSubdomains = hasStoredPlanResource('SUBDOMAINS');

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
