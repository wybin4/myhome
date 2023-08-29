export interface ISpdSubscriber {
    id: number; name: string; address: string; personalAccount: string; apartmentArea: number; livingArea: number; numberOfRegistered: number;
}

export interface ISpdManagementCompany {
    name: string; address: string; phone: string; email: string;
}

export interface ISpdHouse {
    livingArea: number; noLivingArea: number; commonArea: number;
}
