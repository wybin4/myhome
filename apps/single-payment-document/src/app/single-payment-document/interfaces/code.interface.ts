export interface ISpdQR {
    qrCodeBuffer: Buffer; qrCodeX: number; qrCodeY: number; qrCodeSize: number; subscriberId: number;
};

export interface ISpdBarcode {
    barcodeText: string; barcodeBuffer: Buffer; barCodeX: number; barCodeY: number; barCodeSizeX: number; barCodeSizeY: number;
}