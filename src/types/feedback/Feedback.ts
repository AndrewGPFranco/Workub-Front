export interface Feedback {
    id: string;
    date: string;
    month: number | string;
    peopleFeedback: string;
    summary: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface RegisterFeedback {
    date: string;
    feedback: string;
    peopleFeedback: string;
}
