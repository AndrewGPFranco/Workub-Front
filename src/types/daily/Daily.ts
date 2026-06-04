export interface Daily {
    id: string;
    date: string;
    summary: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface RegisterDaily {
    date: string;
    summary: string;
}
