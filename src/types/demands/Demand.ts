export type DemandStatus = 'DONE' | 'PENDING' | 'BLOCKED' | 'ONGOING';

export type DemandPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export enum Sprint {
    CURRENT = 'CURRENT',
    PAST = 'PAST',
    FUTURE = 'FUTURE',
}

export interface RegisterObservation {
    textObservation: string;
}

export interface InputObservation {
    demandId: string;
    textObservations: string[];
}

export type RegisterObservations = Omit<InputObservation, 'demandId'>;

export interface DemandObservation extends RegisterObservation {
    createdAt: string;
}

export interface Demand {
    id: string;
    title: string;
    description: string;
    deadline: string | null;
    status: DemandStatus;
    priority: DemandPriority;
    observationsToReview?: string | null;
    observations: DemandObservation[];
    createdAt: string;
    updatedAt: string | null;
    finalizedAt: Date | null;
    subdomainId?: string | null;
    sprint: Sprint;
}

export interface EditDemand {
    title: string;
    description: string;
    deadline: string | null;
    status: DemandStatus;
    priority: DemandPriority;
    observationsToReview: string | null;
    finalizedAt: Date | null;
    subdomainId?: string | null;
    observations: RegisterObservations;
    sprint: Sprint;
}

export interface RegisterDemand {
    title: string;
    description: string;
    deadline: string | null;
    status: DemandStatus;
    priority: DemandPriority;
    observationToReview: string | null;
    subdomainId?: string | null;
    observations: RegisterObservations;
    sprint: Sprint;
}
