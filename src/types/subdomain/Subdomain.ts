export interface RegisterSubdomain {
    urlPhoto: string | null;
    name: string;
}

export type EditSubdomain = RegisterSubdomain;

export interface Subdomain {
    id?: string;
    urlPhoto?: string | null;
    name: string;
}
