import axios from 'axios';
import {defineStore} from 'pinia';
import ResponseAPI from '@/utils/ResponseAPI.ts';
import {translate} from '@/composables/use-language.ts';
import type {PageResponse} from '@/types/http/PageResponse.ts';
import {getApiErrorMessage, getApiErrorStatus} from '@/utils/api-error.ts';
import type {Feedback, RegisterFeedback} from '@/types/feedback/Feedback.ts';
import {useSubdomainStore} from '@/stores/subdomain-store.ts';

const TOKEN_STORAGE_KEY = 'token';

type FeedbackResponsePayload = PageResponse<Feedback> | Feedback[] | Feedback | string | null;

const isPageResponse = (payload: FeedbackResponsePayload): payload is PageResponse<Feedback> =>
    payload !== null && typeof payload === 'object' && 'content' in payload && Array.isArray(payload.content);

const normalizeFeedbackResponse = (payload: FeedbackResponsePayload): Feedback[] | string => {
    if (Array.isArray(payload) || typeof payload === 'string')
        return payload;

    if (isPageResponse(payload))
        return payload.content;

    return payload ? [payload] : [];
};

export const useFeedbackStore = defineStore('feedback-store', {
    state: () => ({
        url: import.meta.env.VITE_API_URL,
        feedbackRecords: [] as Feedback[],
        isLoading: false,
    }),
    actions: {
        authorizationHeader() {
            return {
                Authorization: `Bearer ${localStorage.getItem(TOKEN_STORAGE_KEY) ?? ''}`,
            };
        },
        selectedSubdomainId() {
            return useSubdomainStore().selectedSubdomainId;
        },
        async fetchFeedbackRecords(): Promise<ResponseAPI<Feedback[] | string>> {
            this.isLoading = true;
            const subdomainId = this.selectedSubdomainId();

            try {
                const {data} = await axios.get<ResponseAPI<FeedbackResponsePayload>>(
                    `${this.url}/user/feedback/by-user`,
                    {
                        params: {...(subdomainId ? {subdomainId} : {})},
                        headers: this.authorizationHeader(),
                    },
                );
                const payload = normalizeFeedbackResponse(data.data);

                if (Array.isArray(payload))
                    this.feedbackRecords = payload;

                return new ResponseAPI(data.httpStatusCode, payload);
            } catch (error) {
                return new ResponseAPI(getApiErrorStatus(error), getApiErrorMessage(error, translate('feedback.loadError')));
            } finally {
                this.isLoading = false;
            }
        },
        async registerFeedback(feedback: RegisterFeedback): Promise<ResponseAPI<string>> {
            try {
                const subdomainId = this.selectedSubdomainId();
                const {data} = await axios.post<ResponseAPI<string>>(
                    `${this.url}/user/feedback/register`,
                    {...feedback, subdomainId},
                    {headers: this.authorizationHeader()},
                );

                return new ResponseAPI(data.httpStatusCode, data.data);
            } catch (error) {
                return new ResponseAPI(500, getApiErrorMessage(error, translate('feedback.registerError')));
            }
        },
    },
});
