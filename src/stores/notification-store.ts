import axios from "axios";
import {defineStore} from "pinia";
import ResponseAPI from "@/utils/ResponseAPI.ts";
import {getApiErrorStatus} from "@/utils/api-error.ts";
import type {Notification} from "@/types/notifications/Notification.ts";

const TOKEN_STORAGE_KEY = 'token';

export const useNotificationStore = defineStore('notification-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL
    }),
    actions: {
        authorizationHeader() {
            return {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''}`,
            };
        },
        async fetchNotifications(): Promise<ResponseAPI<Notification[]>> {
            try {
                const {data} = await axios.get<ResponseAPI<Array<Notification>>>(`${this.url}/notifications/by-user`, {
                    headers: this.authorizationHeader(),
                })

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                console.error(error);
                return new ResponseAPI(getApiErrorStatus(error), []);
            }
        },
        async markAsRead(idNotification: number) {
            await axios.put(`${this.url}/notifications/mark-as-read?idNotification=${idNotification}`, null, {
                headers: this.authorizationHeader(),
            })
        },
        async markAllAsRead() {
            await axios.put(`${this.url}/notifications/mark-all-as-read`, null, {
                headers: this.authorizationHeader(),
            })
        },
    }
});