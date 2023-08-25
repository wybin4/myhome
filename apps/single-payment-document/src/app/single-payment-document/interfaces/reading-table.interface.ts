export interface ISpdReadingColumn {
    width: number; name: string; ySpanOfName: number; parts?: ISpdReadingPart[]; widthOfName?: number; xSpanOfName?: number;
}

export interface ISpdReadingPart {
    width: number; name: string; ySpanOfName: number;
}

export interface ISpdReading {
    reading: string; readingAlign: 'center' | 'right' | 'left';
}
