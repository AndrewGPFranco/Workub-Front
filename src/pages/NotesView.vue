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
import {onMounted, ref} from "vue";
import AppSidebar from "@/components/AppSidebar.vue";
import type {Note} from "@/types/notes/Note.ts";
import {useNoteStore} from "@/stores/note-store.ts";

const notes = ref<Note[]>([]);
const noteStore = useNoteStore();

onMounted(async () => {
  const response = await noteStore.getNotes();

  if (response.httpStatusCode === 200)
    notes.value = response.data;
})
</script>

<style scoped>

</style>