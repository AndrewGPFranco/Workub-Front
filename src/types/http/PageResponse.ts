export interface PageResponse<T> {
    content: T[];
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}
