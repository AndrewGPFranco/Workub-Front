import axios from 'axios';
import type ResponseAPI from '@/utils/ResponseAPI.ts';

interface LegacyErrorResponse {
    error?: string;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (!axios.isAxiosError(error))
        return fallback;

    const response = error.response?.data as Partial<ResponseAPI<string>> & LegacyErrorResponse | undefined;
    return response?.data || response?.error || fallback;
};

export const getApiErrorStatus = (error: unknown): number => {
    if (!axios.isAxiosError(error))
        return 500;

    return error.response?.status ?? 500;
};
