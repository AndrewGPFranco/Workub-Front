<template>
  <div class="notifications-wrapper">
    <button
        class="notifications"
        type="button"
        aria-label="Notificações"
        aria-controls="notifications-modal"
        title="Notificações"
        popovertarget="notifications-modal"
    >
      <i class="pi pi-bell" aria-hidden="true"/>
      <span v-if="hasUnread" class="notifications-indicator" aria-hidden="true"/>
    </button>

    <dialog id="notifications-modal" class="notifications-modal" popover="auto" aria-label="Notificações">
      <header class="notifications-header">
        <div>
          <span class="notifications-eyebrow">Atualizações</span>
          <h2>Notificações</h2>
        </div>
        <div class="notifications-header-actions">
          <button
              v-if="hasUnread"
              class="notifications-mark-all"
              type="button"
              title="Marcar todas como lidas"
              @click="markAllRead"
          >
            Marcar todas
          </button>
          <button class="notifications-close" type="button" aria-label="Fechar notificações"
                  popovertarget="notifications-modal" popovertargetaction="hide">
            <i class="pi pi-times" aria-hidden="true"/>
          </button>
        </div>
      </header>

      <div v-if="notifications.length" class="notifications-list">
        <button
            v-for="(notification, index) in notifications"
            :key="index"
            type="button"
            class="notification-item"
            :class="{'is-viewed': notification.was_it_viewed}"
            @click="toggleRead(index)"
        >
          <span class="notification-dot" aria-hidden="true"/>
          <div class="notification-body">
            <p>{{ notification.content }}</p>
            <time :datetime="String(notification.created_at)">{{ formatRelativeTime(notification.created_at) }}</time>
          </div>
        </button>
      </div>

      <div v-else class="notifications-empty">
        <div class="notifications-empty-icon">
          <i class="pi pi-bell-slash" aria-hidden="true"/>
        </div>
        <strong>Nenhuma notificação</strong>
        <span>Você está em dia — bom trabalho!</span>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import {useToast} from "primevue/usetoast";
import {showErrorToast} from "@/utils/toast.ts";
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {useNotificationStore} from "@/stores/notification-store.ts";
import type {Notification} from "@/types/notifications/Notification.ts";

const toast = useToast();
const notificationStore = useNotificationStore();

const notifications = ref<Notification[]>([]);
let refreshInterval: ReturnType<typeof setInterval> | undefined;

const hasUnread = computed(() => notifications.value.some((n) => !n.was_it_viewed));

const fetchNotifications = async () => {
  const responseAPI = await notificationStore.fetchNotifications();

  if (responseAPI.isError) {
    showErrorToast(toast, String(responseAPI.response));
    return;
  }

  notifications.value = responseAPI.response as Notification[];
};

const toggleRead = async (index: number) => {
  const notification = notifications.value[index];

  if (notification) {
    await notificationStore.markAsRead(notification.id);
    await fetchNotifications();
  }
};

const markAllRead = async () => {
  await notificationStore.markAllAsRead();
  await fetchNotifications();
};

const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(then.getTime())) {
    const raw = String(date);

    const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
    if (brMatch) {
      const parsed = new Date(
          Number(brMatch[3]), Number(brMatch[2]) - 1, Number(brMatch[1]),
          Number(brMatch[4] ?? 0), Number(brMatch[5] ?? 0)
      );
      if (!Number.isNaN(parsed.getTime())) return formatDistance(now, parsed);
    }

    return raw || '—';
  }

  return formatDistance(now, then);
};

const formatDistance = (now: Date, then: Date): string => {
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 0) return 'Agora';
  if (diffSec < 60) return 'Agora mesmo';
  if (diffMin < 60) return `${diffMin} min atrás`;
  if (diffHour < 24) return `${diffHour}h atrás`;
  if (diffDay === 1) return 'Ontem';
  if (diffDay < 7) return `${diffDay} dias atrás`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} sem atrás`;

  return then.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short', year: 'numeric'});
};

onMounted(() => {
  void fetchNotifications();
  refreshInterval = setInterval(() => void fetchNotifications(), 60000);
});

onBeforeUnmount(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});
</script>

<style scoped>
.notifications-wrapper {
  display: inline-flex;
}

.notifications {
  position: relative;
  display: inline-grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--wh-text-soft);
  background: transparent;
  cursor: pointer;
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.notifications:hover {
  color: var(--wh-primary);
  background: var(--wh-primary-soft);
}

.notifications:active {
  transform: scale(0.94);
}

.notifications .pi {
  font-size: 1rem;
}

.notifications-indicator {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 7px;
  height: 7px;
  border: 2px solid var(--wh-surface);
  border-radius: 50%;
  background: var(--wh-accent);
  box-sizing: content-box;
}

.notifications-modal {
  width: min(400px, calc(100vw - 32px));
  max-height: min(560px, calc(100dvh - 32px));
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--wh-border);
  border-radius: var(--wh-radius-lg);
  color: var(--wh-text);
  background: var(--wh-surface-raised);
  box-shadow: var(--wh-shadow-md);
  opacity: 0;
  transform: translateY(6px) scale(0.98);
  transition: opacity 180ms ease, transform 180ms ease,
  display 180ms ease allow-discrete, overlay 180ms ease allow-discrete;
}

.notifications-modal:popover-open {
  display: flex;
  flex-direction: column;
  opacity: 1;
  transform: translateY(0) scale(1);
}

@starting-style {
  .notifications-modal:popover-open {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
}

.notifications-modal::backdrop {
  background: rgba(20, 29, 25, 0.28);
  opacity: 0;
  transition: opacity 180ms ease,
  display 180ms ease allow-discrete, overlay 180ms ease allow-discrete;
}

.notifications-modal:popover-open::backdrop {
  opacity: 1;
}

@starting-style {
  .notifications-modal:popover-open::backdrop {
    opacity: 0;
  }
}

.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--wh-border);
}

.notifications-eyebrow {
  display: block;
  margin-bottom: 2px;
  color: var(--wh-text-muted);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notifications-header h2 {
  margin: 0;
  color: var(--wh-text);
  font-size: 1rem;
  font-weight: 800;
}

.notifications-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notifications-mark-all {
  padding: 5px 10px;
  border: 1px solid var(--wh-border);
  border-radius: 99px;
  color: var(--wh-text-soft);
  background: transparent;
  font-size: 0.67rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease, background-color 140ms ease;
}

.notifications-mark-all:hover {
  color: var(--wh-primary);
  border-color: var(--wh-primary);
  background: var(--wh-primary-soft);
}

.notifications-close {
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--wh-text-muted);
  background: transparent;
  font-size: 0.82rem;
  cursor: pointer;
  transition: color 140ms ease, background-color 140ms ease;
}

.notifications-close:hover {
  color: var(--wh-text);
  background: var(--wh-surface-hover);
}

.notifications-list {
  overflow-y: auto;
  padding: 6px;
  scrollbar-gutter: stable;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-radius: var(--wh-radius-md);
  color: inherit;
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color 140ms ease;
}

.notification-item:hover {
  background: var(--wh-surface-hover);
}

.notification-item + .notification-item {
  margin-top: 2px;
}

.notification-dot {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--wh-primary);
  transition: opacity 200ms ease, transform 200ms ease;
}

.notification-item.is-viewed .notification-dot {
  opacity: 0;
  transform: scale(0);
}

.notification-body {
  flex: 1 1 0;
  min-width: 0;
}

.notification-body p {
  margin: 0;
  color: var(--wh-text);
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.45;
}

.notification-item.is-viewed .notification-body p {
  color: var(--wh-text-soft);
  font-weight: 500;
}

.notification-body time {
  display: block;
  margin-top: 3px;
  color: var(--wh-text-muted);
  font-size: 0.68rem;
}

.notifications-empty {
  display: grid;
  min-height: 240px;
  padding: 40px 24px;
  place-content: center;
  justify-items: center;
  color: var(--wh-text-muted);
  text-align: center;
}

.notifications-empty-icon {
  display: grid;
  width: 48px;
  height: 48px;
  margin-bottom: 14px;
  place-items: center;
  border-radius: 50%;
  color: var(--wh-primary);
  background: var(--wh-primary-soft);
}

.notifications-empty-icon .pi {
  font-size: 1.2rem;
}

.notifications-empty strong {
  color: var(--wh-text);
  font-size: 0.84rem;
}

.notifications-empty span {
  margin-top: 4px;
  font-size: 0.73rem;
  line-height: 1.4;
}

@media (prefers-reduced-motion: reduce) {
  .notifications,
  .notification-item,
  .notification-dot,
  .notifications-modal,
  .notifications-modal::backdrop,
  .notifications-mark-all,
  .notifications-close {
    transition: none;
  }
}
</style>
