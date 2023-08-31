export interface IGetCorrection {
    subscriberId: number;
    spdIds: number[];
}

export interface ICalculatedDebt {
    subscriberId: number;
    debt: number
}

export interface ICalculatedPenalty {
    subscriberId: number;
    penalty: number
}

export interface ICalculatedDeposit {
    subscriberId: number;
    deposit: number
}