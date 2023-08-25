export interface ISpdSubscriber {
    name: string; address: string; personalAccount: number; apartmentArea: number; livingArea: number; numberOfRegistered: number;
}

export interface ISpdManagementCompany {
    name: string; address: string; phone: string; email: string;
}

export interface ISpdHouse {
    livingArea: number; noLivingArea: number; commonArea: number;
}
