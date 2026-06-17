export type PlanResource = 'DAILY' | 'DEMANDS' | 'FEEDBACK' | 'SUBDOMAINS';

const TOKEN_STORAGE_KEY = 'token';
const RESOURCE_BY_ORDINAL: PlanResource[] = ['DAILY', 'DEMANDS', 'FEEDBACK', 'SUBDOMAINS'];

const decodeBase64Url = (value: string) => {
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/');
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');

    return atob(paddedBase64);
};

const normalizeResource = (resource: unknown): PlanResource | null => {
    if (typeof resource === 'string') {
        const normalized = resource.toUpperCase();
        return isPlanResource(normalized) ? normalized : null;
    }

    if (typeof resource === 'number')
        return RESOURCE_BY_ORDINAL[resource] ?? null;

    return null;
};

const isPlanResource = (resource: string): resource is PlanResource =>
    resource === 'DAILY' || resource === 'DEMANDS' || resource === 'FEEDBACK' || resource === 'SUBDOMAINS';

export const getStoredPlanResources = (): PlanResource[] => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token)
        return [];

    const [, payload] = token.split('.');

    if (!payload)
        return [];

    try {
        const claims = JSON.parse(decodeBase64Url(payload)) as { resources?: unknown };

        if (!Array.isArray(claims.resources))
            return [];

        return claims.resources
            .map(normalizeResource)
            .filter((resource): resource is PlanResource => resource !== null);
    } catch (_) {
        return [];
    }
};

export const hasStoredPlanResource = (resource: PlanResource) =>
    getStoredPlanResources().includes(resource);

export const getDefaultAuthorizedRouteName = () => {
    const resources = getStoredPlanResources();

    if (resources.includes('DEMANDS'))
        return 'Demands';

    if (resources.includes('DAILY'))
        return 'Daily';

    if (resources.includes('FEEDBACK'))
        return 'Feedback';

    if (resources.includes('SUBDOMAINS'))
        return 'Subdomain Register';

    return 'Access Denied';
};
