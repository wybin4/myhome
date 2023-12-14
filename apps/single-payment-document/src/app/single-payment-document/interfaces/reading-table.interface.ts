export interface ISpdReadingColumn {
    width: number; name: string; ySpanOfName: number; parts?: ISpdReadingPart[]; widthOfName?: number; xSpanOfName?: number;
}

export interface ISpdReadingPart {
    width: number; name: string; ySpanOfName: number;
}

export interface ISpdReadings {
    readings: ISpdReading[][]; subscriberId: number;
}

export interface ISpdReading {
    reading: string; readingAlign: 'center' | 'right' | 'left';
}

export interface ISpdMeterReadings {
    subscriberId: number; readings: ISpdMeterReading[];
}

export interface ISpdMeterReading {
    individualReadings: ISpdGenericReadings,
    typeOfServiceName: string, unitName: string,
    norm: { individual: number; common: number; },
    commonReadings: ISpdGenericReadings,
    totalVolume: number,
};

interface ISpdGenericReadings { reading: string, difference: number }