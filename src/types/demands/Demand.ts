export type DemandStatus = 'DONE' | 'PENDING' | 'BLOCKED' | 'ONGOING';

export type DemandPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Demand {
    id: string;
    title: string;
    description: string;
    deadline: string | null;
    status: DemandStatus;
    priority: DemandPriority;
    observationToReview?: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface RegisterDemand {
    title: string;
    description: string;
    deadline: string | null;
    status: DemandStatus;
    priority: DemandPriority;
    observationToReview: string | null;
}
