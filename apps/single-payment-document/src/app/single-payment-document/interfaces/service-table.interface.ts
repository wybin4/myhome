export interface ISpdServiceColumn {
    startX: number; width: number; name: string; xOfName?: number; yOfName: number; parts?: ISpdServicePart[]; widthOfName: number;
}
export interface ISpdServicePart {
    startX: number; width: number; name: string; xOfName?: number; yOfName: number; widthOfName: number;
}
export interface ISpdService {
    title: string,
    titleColSpan: number,
    titleAlign: 'left' | 'right' | 'center',
    titleBold?: boolean,
    servicesBold?: boolean,
    services: string[]
}