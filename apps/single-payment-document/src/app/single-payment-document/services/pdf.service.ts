import { Injectable } from '@nestjs/common';
import { ISpdQR, ISpdBarcode } from '../interfaces/code.interface';
import { ISpdOperator } from '../interfaces/operator.interface';
import { ISpd, ISpdDetailInfo, ISpdPayment } from '../interfaces/single-payment-document.interface';
import { ISpdSubscriber, ISpdManagementCompany, ISpdHouse } from '../interfaces/subscriber.interface';
import { RMQException } from '@myhome/constants';
import qrcode from 'qrcode';
import { join } from 'path';
import bwipjs from 'bwip-js';
import * as PDFDocument from 'pdfkit';
import { ISpdService, ISpdServiceColumn } from '../interfaces/service-table.interface';
import { ISpdMeterReadings, ISpdReading, ISpdReadingColumn, ISpdReadings } from '../interfaces/reading-table.interface';
import { isNumber } from 'class-validator';

@Injectable()
export class PdfService {
    private arialBold = join(__dirname, '.', 'assets', 'Arial-Bold.ttf');
    private arial = join(__dirname, '.', 'assets', 'Arial.ttf');

    private formatPeriod(date: Date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${month}.${year}`;
    }

    private formatDate(date: Date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    public getFixed(value: number, fix: number) {
        if (Number(value) && Number(value) !== 0) {
            return Number(value).toFixed(fix);
        } else return undefined;
    }

    public getFixedNumber(value: number): number {
        if (Number(value) && Number(value) !== 0) {
            return Number(Number(value).toFixed(2));
        } else return 0;
    }

    public getThreeOrMore(value: number) {
        if (Number(value) && Number(value) !== 0) {
            const threeAfterDot = value.toString().split('.')[1].slice(0, 3);
            const getZeros = (x: string) => {
                return (x.match(/0/g) || []).length;
            }
            const countOfZeros: number = getZeros(threeAfterDot);
            return value.toFixed(countOfZeros + 3);
        } else return undefined;
    }

    private getMeterReadingsWithHouse(
        subscribers: ISpdSubscriber[],
        meterReadingsData: ISpdMeterReadings[],
        houses: ISpdHouse[]
    ) {
        const allReadings: ISpdReadings[] = [];
        // Для каждого subscriberId
        for (const meterReadings of meterReadingsData) {
            const currentSubscriber = subscribers.find(obj => obj.id === meterReadings.subscriberId);
            const currentHouse = houses.find(obj => obj.id === currentSubscriber.houseId);

            const reading: ISpdReading[] = [];
            for (const meterReading of meterReadings.readings) {
                const individualReadingString = meterReading.individualReadings.reading;
                const commonReadingString = meterReading.commonReadings.reading;
                reading.push(
                    { reading: meterReading.typeOfServiceName, readingAlign: 'left' },
                    { reading: individualReadingString, readingAlign: 'left' },
                    { reading: this.getFixed(meterReading.individualReadings.difference, 3), readingAlign: 'right' },
                    { reading: meterReading.unitName, readingAlign: 'center' },
                    { reading: `${currentSubscriber.livingArea}/${currentHouse.livingArea}`, readingAlign: 'right' },
                    { reading: this.getFixed(meterReading.norm.individual, 3), readingAlign: 'right' },
                    { reading: this.getFixed(meterReading.norm.common, 3), readingAlign: 'right' },
                    { reading: commonReadingString, readingAlign: 'left' },
                    { reading: this.getFixed(meterReading.commonReadings.difference, 3), readingAlign: 'right' },
                    { reading: this.getFixed(meterReading.totalVolume, 3), readingAlign: 'right' },
                )
            }
            allReadings.push({
                readings: reading,
                subscriberId: currentSubscriber.id
            });
        };
        return allReadings;
    }

    private getMeterReadings(
        subscribers: ISpdSubscriber[],
        meterReadingsData: ISpdMeterReadings[],
        livingArea: number
    ) {
        const allReadings: ISpdReadings[] = [];
        // Для каждого subscriberId
        for (const meterReadings of meterReadingsData) {
            const currentSubscriber = subscribers.find(obj => obj.id === meterReadings.subscriberId);

            const reading: ISpdReading[] = [];
            for (const meterReading of meterReadings.readings) {
                const individualReadingString = meterReading.individualReadings.reading;
                const commonReadingString = meterReading.commonReadings.reading;
                reading.push(
                    { reading: meterReading.typeOfServiceName, readingAlign: 'left' },
                    { reading: individualReadingString, readingAlign: 'left' },
                    { reading: this.getFixed(meterReading.individualReadings.difference, 3), readingAlign: 'right' },
                    { reading: meterReading.unitName, readingAlign: 'center' },
                    { reading: `${currentSubscriber.livingArea}/${livingArea}`, readingAlign: 'right' },
                    { reading: this.getFixed(meterReading.norm.individual, 3), readingAlign: 'right' },
                    { reading: this.getFixed(meterReading.norm.common, 3), readingAlign: 'right' },
                    { reading: commonReadingString, readingAlign: 'left' },
                    { reading: this.getFixed(meterReading.commonReadings.difference, 3), readingAlign: 'right' },
                    { reading: this.getFixed(meterReading.totalVolume, 3), readingAlign: 'right' },
                )
            }
            allReadings.push({
                readings: reading,
                subscriberId: currentSubscriber.id
            });
        };
        return allReadings;
    }

    private getServices(
        detailsInfo: ISpdDetailInfo[],
        SPDs: ISpd[]
    ) {
        // Проходимся по каждой детали с своим subscriberId
        const allSpdServices: { services: ISpdService[]; subscriberId: number; }[] = [];
        for (const detail of detailsInfo) {
            const currentSPD = SPDs.find(obj => obj.subscriberId === detail.subscriberId);
            const debtMinusDeposit = currentSPD.debt - currentSPD.deposit;
            // Пушим услуги
            const temp: ISpdService[] = detail.details.map(obj => {
                return {
                    titleColSpan: 1,
                    titleAlign: 'left',
                    title: obj.typeOfServiceName,
                    services: [
                        obj.unitName.replace('руб.', '').replace('/', '').replace(/м2/, ''),
                        this.getFixed(obj.volume.publicUtility, 2), this.getThreeOrMore(obj.volume.commonHouseNeed),
                        this.getFixed(obj.tariff, 2), this.getFixed(obj.amount.publicUtility, 2),
                        this.getFixed(obj.amount.commonHouseNeed, 2), this.getFixed(obj.totalAmount, 2),
                        '', '', ''
                    ],
                };
            });

            // Пушим обязательные строки
            temp.push(
                {
                    title: 'Итого к оплате за расчетный период:',
                    titleColSpan: 4,
                    titleAlign: 'right',
                    titleBold: true,
                    services: [
                        '', '',
                        String(Number(detail.total).toFixed(2)),
                        'x',
                        (debtMinusDeposit).toFixed(2),
                        (detail.total + debtMinusDeposit).toFixed(2)
                    ]
                },
                {
                    title: 'Всего с учетом пени:',
                    titleColSpan: 8,
                    titleAlign: 'right',
                    titleBold: true,
                    servicesBold: true,
                    services: [this.getFixed(detail.total + debtMinusDeposit + currentSPD.penalty, 2)]
                }
            );

            // Пушим всё
            allSpdServices.push({
                services: temp,
                subscriberId: detail.subscriberId,
            });
        }
        return allSpdServices;
    }

    private async getQR(
        subscriber: ISpdSubscriber,
        amount: number
    ): Promise<ISpdQR> {
        const lastName = subscriber.name.split(" ")[0];
        const firstName = subscriber.name.split(" ")[1];
        const middleName = subscriber.name.split(" ")[2];
        const bankData = "ST00012|Name=ООО 'Служба 100'|PersonalAcc=40703810552090063242|BankName=Юго-Западный Банк ПАО 'Сбербанк России'|BIC=046025302|CorrespAcc=30102110600000000602"
        const sum = `Sum=${amount}|PayeeINN=6368082584|DocDate=${this.formatDate(new Date())}`;
        const name = `lastName=${lastName}|firstName=${firstName}|middleName=${middleName}`;
        const accountData = `payerAddress=${subscriber.address}|persAcc=${subscriber.personalAccount}`;
        const additional = `paymPeriod=${this.formatPeriod(new Date())}|category=0|serviceName=30581|Fine=0`;
        const qrCodeText = [bankData, sum, name, accountData, additional].join("|");
        // Генерация QR-кода в виде Buffer
        return {
            qrCodeBuffer: await this.generateQRCodeBuffer(qrCodeText),
            qrCodeSize: 156,
            qrCodeX: 55,
            qrCodeY: 200,
            subscriberId: subscriber.id
        }
    }

    private async getQRS(subscribers: ISpdSubscriber[], SPDs: ISpd[]) {
        const qrs: ISpdQR[] = [];
        for (const subscriber of subscribers) {
            const currentSPD = SPDs.find(obj => obj.subscriberId === subscriber.id);
            qrs.push(await this.getQR(subscriber, currentSPD.amount));
        }
        return qrs;
    }

    async generatePdfByHouses(
        houses: ISpdHouse[], managementC: ISpdManagementCompany, subscribers: ISpdSubscriber[],
        detailsInfo: ISpdDetailInfo[],
        SPDs: ISpd[], meterReadingsData: ISpdMeterReadings[]
    ): Promise<Buffer> {
        const barcodeText = '589744282507230181505';
        const barcode: ISpdBarcode = {
            barcodeText: barcodeText,
            barcodeBuffer: await this.generateBarcodeBuffer(barcodeText),
            barCodeSizeX: 230,
            barCodeSizeY: 42,
            barCodeX: 830,
            barCodeY: 103,
        }

        const operator: ISpdOperator = {
            operatorTextHigh: `ОПЕРАТОР ПО РАСЧЕТУ ПЛАТЕЖЕЙ: ООО 'Служба 100' ИНН/КПП 6168086584 / 616801001
р/сч 42712810522090113212 в Юго-Западный Банк ПАО 'Сбербанк России' БИК 046015632 к/с 30102810610000000602`,
            operatorTextLow: `Оператор по расчету платежей: ООО 'Служба 100' ИНН/КПП 6168086584 / 616801001
р/сч 42712810522090113212 в Юго-Западный Банк ПАО 'Сбербанк России' БИК 046015632 к/с 30102810610000000602`
        }

        const payment: ISpdPayment = {
            amount: 1532.18,
            payedAt: new Date('03.07.2023')
        }

        const meterReadings = this.getMeterReadingsWithHouse(subscribers, meterReadingsData, houses);
        const services = this.getServices(detailsInfo, SPDs);
        const qrs = await this.getQRS(subscribers, SPDs);

        try {
            const pdfBuffer: Buffer = await new Promise(resolve => {
                const doc = new PDFDocument.default({ compress: false, size: 'A2', layout: 'portrait' });

                let count = 0;
                for (const subscriber of subscribers) {
                    count++;

                    const currentSPD = SPDs.find(obj => obj.subscriberId === subscriber.id);

                    const currentQR = qrs.find(obj => obj.subscriberId === subscriber.id);
                    const top = new Top(this.arial, this.arialBold, doc);
                    top.getTop(currentQR, barcode, operator, subscriber, managementC, currentSPD);

                    const currentService = services.find(obj => obj.subscriberId === subscriber.id);
                    const currentReadings = meterReadings.find(obj => obj.subscriberId === subscriber.id);
                    const currentHouse = houses.find(obj => obj.id === subscriber.houseId);
                    const bottom = new Bottom(this.arial, this.arialBold, doc, currentService.services, currentReadings.readings);
                    bottom.getLow(operator, barcodeText, subscriber, currentSPD, currentHouse, payment);

                    if (count != subscribers.length) {
                        doc.addPage();
                    }
                }

                const buffer = [];
                doc.on('data', buffer.push.bind(buffer));
                doc.on('end', () => {
                    const data = Buffer.concat(buffer);
                    resolve(data);
                });

                doc.end();
            });
            return pdfBuffer;
        } catch (e) {
            throw new RMQException(e.message, e.status);
        }
    }

    private async generateQRCodeBuffer(text: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            qrcode.toBuffer(text, (error, qrCodeBuffer) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(qrCodeBuffer);
                }
            });
        });
    }

    private async generateBarcodeBuffer(text: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            bwipjs.toBuffer({
                bcid: 'code128', // Тип штрихкода
                text: text,
                width: 227,
                height: 26,
            }, (err, png) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(png);
                }
            });
        });
    }
}

class Top {
    constructor(private readonly arial: string, private readonly arialBold: string, private doc: PDFKit.PDFDocument) {
        this.arial = arial;
        this.arialBold = arialBold;
        this.doc = doc;
    }

    private startX = 43;

    public getTop(
        qr: ISpdQR,
        barcode: ISpdBarcode,
        operator: ISpdOperator,
        subscriber: ISpdSubscriber,
        managementC: ISpdManagementCompany,
        spd: ISpd
    ): PDFKit.PDFDocument {
        this.doc
            .font(this.arialBold)
            .fontSize(17)
            .text(operator.operatorTextHigh, this.startX, 58);
        this.getFirstTopZone();
        // Вставка QR-кода в документ
        this.getSecondTopZone(qr);
        this.getThirdTopZone(3215,
            subscriber.personalAccount, subscriber.name, subscriber.address,
            spd.month,
            barcode
        );
        this.getFourthTopZone(
            managementC.name, managementC.address, managementC.phone, managementC.email,
            spd.amount
        );
        this.getFifthTopZone(spd.amount, spd.debt, spd.penalty, spd.deposit);
        this.doc
            .moveTo(this.startX, 432)
            .lineWidth(4)
            .lineTo(1065, 432)
            .dash(13, { space: 3 })
            .stroke();
        return this.doc;
    }

    private getFirstTopZone(): PDFKit.PDFDocument {
        this.doc.rect(this.startX, 100, 234, 78)
            .stroke(); // Прямоугольник для 'Счёт-извещение'
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text('СЧЕТ-ИЗВЕЩЕНИЕ', 95, 110);
        return this.doc;
    }

    private getSecondTopZone(
        qr: ISpdQR
    ): PDFKit.PDFDocument {
        const x = this.startX;
        const y = 178;
        const height = 255;
        this.doc
            .lineTo(x, y + height)
            .lineTo(x, y)
            .stroke(); // Прямоугольник для qr
        this.doc.image(qr.qrCodeBuffer, qr.qrCodeX, qr.qrCodeY, { width: qr.qrCodeSize, height: qr.qrCodeSize });
        return this.doc;
    }

    private getThirdTopZone(
        MCNumber: number,
        personalAccount: string,
        name: string,
        apartment: string,
        month: string,
        barcode: ISpdBarcode
    ): PDFKit.PDFDocument {
        this.doc.rect(277, 100, 788, 78)
            .stroke(); // Прямоугольник для лицевого счёта и тд
        this.doc
            .font(this.arialBold)
            .fontSize(32)
            .text(String(MCNumber), 300, 120);
        this.doc
            .font(this.arial)
            .fontSize(12)
            .text('Лицевой счет:', 410, 128);
        this.doc
            .font(this.arialBold)
            .fontSize(12)
            .text(String(personalAccount), 495, 128); // Номер лицевого счёта
        this.doc
            .font(this.arialBold)
            .fontSize(14)
            .text(name, 410, 142);
        this.doc
            .font(this.arialBold)
            .fontSize(14)
            .text(apartment, 410, 156);
        this.doc
            .font(this.arial)
            .fontSize(12)
            .text('Оплата ЖКУ за', 685, 102);
        this.doc
            .font(this.arialBold)
            .fontSize(14)
            .text(month, 685, 115);
        // Баркод
        this.doc.image(
            barcode.barcodeBuffer, barcode.barCodeX, barcode.barCodeY,
            { fit: [barcode.barCodeSizeX, barcode.barCodeSizeY] }
        );
        this.doc
            .font(this.arialBold)
            .fontSize(18)
            .text(barcode.barcodeText, 840, 133);
        return this.doc;
    }

    private getFourthTopZone(
        MCName: string, MCAdress: string, MCPhone: string, MCEmail: string,
        amount: number
    ): PDFKit.PDFDocument {
        this.doc.rect(277, 178, 668, 41)
            .stroke(); // Прямоугольник для данных об управляющей компании
        this.doc.rect(945, 178, 120, 41)
            .stroke(); // Прямоугольник для суммы выплаты от УК
        this.doc
            .font(this.arial)
            .fontSize(16)
            .text(`Исполнитель услуг: ${MCName}`, 282, 182);
        this.doc
            .font(this.arial)
            .fontSize(12)
            .text(`Фактический адрес: ${MCAdress}, тел.: ${MCPhone}, эл.почта: ${MCEmail}`, 282, 200);
        this.doc
            .font(this.arialBold)
            .fontSize(14)
            .text(String(amount), 945, 182, {
                width: 117,
                align: 'right',
            });
        return this.doc;
    }

    private getFifthTopZone(
        totalAmount: number, debt: number, penalty: number, deposit: number
    ): PDFKit.PDFDocument {
        const xGen = 277;
        const yGen = 219;
        const heightGen = 214;
        const widthGen = 788;
        this.doc
            .moveTo(xGen, yGen)
            .lineTo(xGen, yGen + heightGen)
            .moveTo(xGen + widthGen, yGen)
            .lineTo(xGen + widthGen, yGen + heightGen)
            .stroke(); // Общий прямоугольник

        this.doc
            .font(this.arial)
            .fontSize(14)
            .text('Итого начислено:', 307, 370);
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text(String(totalAmount), 432, 370, {
                width: 117,
                align: 'right',
            });
        this.doc
            .moveTo(432, 387)
            .lineTo(552, 387)
            .stroke();
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text('Пени:', 577, 370);
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text(String(penalty), 621, 370, {
                width: 117,
                align: 'right',
            });
        this.doc
            .moveTo(621, 387)
            .lineTo(741, 387)
            .stroke();
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text('Остаток (аванс):', 307, 405);
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text(String(deposit), 421, 405, {
                width: 117,
                align: 'right',
            });
        this.doc
            .moveTo(421, 422)
            .lineTo(541, 422)
            .stroke();
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text('Подпись плательщика:', 577, 405);
        this.doc
            .moveTo(735, 422)
            .lineTo(855, 422)
            .stroke();

        const xTotal = 888;
        const yTotal = 366;
        const widthTotal = 177;
        const heightTotal = 67;
        this.doc
            .moveTo(xTotal, yTotal)
            .lineTo(xTotal, yTotal + heightTotal)
            .moveTo(xTotal, yTotal)
            .lineTo(xTotal + widthTotal, yTotal)
            .stroke();  // Для ИТОГО и ВСЕГО

        this.doc
            .font(this.arial)
            .fontSize(14)
            .text('ИТОГО:', 893, 370);
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text(String(totalAmount), 949, 370, {
                width: 112,
                align: 'right',
            });
        this.doc
            .font(this.arial)
            .fontSize(14)
            .text('ВСЕГО:', 893, 405);
        this.doc
            .font(this.arialBold)
            .fontSize(14)
            .text(String(totalAmount + debt + penalty - deposit), 949, 405, {
                width: 112,
                align: 'right',
            });
        return this.doc;
    }
}

class Bottom {
    constructor(
        private readonly arial: string, private readonly arialBold: string,
        private doc: PDFKit.PDFDocument,
        private readonly services: ISpdService[],
        private readonly readings: ISpdReading[]
    ) {
        this.arial = arial;
        this.arialBold = arialBold;
        this.doc = doc;
        this.services = services;
        this.readings = readings;
    }

    private heightOfServiceCol = 24;
    private heightOfReadingCol = 19;
    private startX = 43;

    private serviceCols: ISpdServiceColumn[] = [
        {
            startX: this.startX,
            width: 118,
            name: 'Вид услуг',
            widthOfName: 118,
            yOfName: 577,
        },
        {
            startX: 161,
            width: 50,
            name: 'Ед. измер',
            widthOfName: 50,
            yOfName: 571,
        },
        {
            startX: 211,
            width: 151,
            widthOfName: 151,
            name: 'Объем коммунальных услуг',
            yOfName: 552,
            parts: [{
                startX: 211,
                width: 75,
                name: 'индив. потреб.',
                widthOfName: 75,
                yOfName: 590,
            },
            {
                startX: 286,
                width: 76,
                name: 'в целях СОИД',
                widthOfName: 76,
                yOfName: 590
            }]
        },
        {
            startX: 362,
            width: 60,
            name: 'Тариф / Размер платы',
            widthOfName: 60,
            yOfName: 563
        },
        {
            startX: 422,
            width: 156,
            widthOfName: 156,
            name: 'Размер платы за ком. услуги, руб.',
            yOfName: 552,
            parts: [{
                startX: 422,
                width: 78,
                name: 'индив. потреб.',
                widthOfName: 78,
                yOfName: 590,
            },
            {
                startX: 500,
                width: 78,
                name: 'общедом. нужды',
                widthOfName: 78,
                yOfName: 590
            }]
        },
        {
            startX: 578,
            width: 80,
            name: 'Всего начислено за расчет. период, руб.',
            yOfName: 550,
            xOfName: 587,
            widthOfName: 65
        },
        {
            startX: 658,
            width: 173,
            name: 'Перерасчеты, руб.',
            widthOfName: 173,
            yOfName: 578
        },
        {
            startX: 831,
            width: 77,
            name: 'Долг / аванс, руб.',
            widthOfName: 60,
            yOfName: 563,
            xOfName: 842
        },
        {
            startX: 908,
            width: 156,
            name: 'Итого к оплате за расчетный период, руб.',
            yOfName: 571,
            widthOfName: 156,
        }
    ];

    private readingCols: ISpdReadingColumn[] = [
        {
            width: 148,
            name: 'Вид услуг',
            ySpanOfName: 26,
        },
        {
            width: 140,
            name: 'Показания ИПУ (тек./пред.)',
            ySpanOfName: 18,
            widthOfName: 95,
            xSpanOfName: 22,
        },
        {
            width: 58,
            name: 'Расход по ИПУ',
            ySpanOfName: 19,
        },
        {
            width: 60,
            name: 'Ед. изм.',
            ySpanOfName: 27,
        },
        {
            width: 99,
            name: 'Расчетная площадь (кв./здание)',
            ySpanOfName: 11,
            widthOfName: 73,
            xSpanOfName: 14,
        },
        {
            width: 200,
            name: 'Норматив потребления',
            ySpanOfName: 15,
            parts: [
                {
                    width: 102,
                    name: 'инд. / соц.нор.',
                    ySpanOfName: 4,
                },
                {
                    width: 98,
                    name: 'в целях СОИД',
                    ySpanOfName: 4,
                },
            ]
        },
        {
            width: 140,
            name: 'Показания ОПУ (тек./пред.)',
            ySpanOfName: 19,
            widthOfName: 95,
            xSpanOfName: 22,
        },
        {
            width: 58,
            name: 'Расход по ОПУ',
            ySpanOfName: 19,
        },
        {
            width: 118,
            name: 'Объем ком. услуг',
            ySpanOfName: 26,
        },
    ]

    public getLow(
        operator: ISpdOperator,
        barcodeText: string,
        subscriber: ISpdSubscriber,
        spd: ISpd,
        house: ISpdHouse,
        payment: ISpdPayment
    ): PDFKit.PDFDocument {

        this.getFirstBottomZone(operator, barcodeText); // 1 сегмент
        this.getSubscriberData(subscriber, spd.month, house); // 2 сегмент
        this.getSPDTableCap(); // 3 сегмент

        let currentY = 624;
        for (const service of this.services) {
            this.getServiceRow(currentY, service); // Таблица, детализирующая начисления по каждой услуге
            currentY += this.heightOfServiceCol; // Или 4 сегмент
        }

        this.doc
            .fontSize(16)
            .font(this.arialBold)
            .text(
                `Задолженность на дату печати: ${spd.debt.toFixed(2)} руб.`,
                this.startX,
                currentY + 7,
                {
                    width: 1065,
                    align: 'center'
                }
            ); // 5 сегмент
        currentY += 31;

        this.getReadingTableCap(currentY); // 6 сегмент
        currentY += 64;
        if (this.readings.length) {
            this.getReadingRows(currentY, this.readings);
            currentY += this.heightOfReadingCol; // 7 сегмент
        }

        // 8 сегмент
        const year = payment.payedAt.toLocaleString("default", { year: "numeric" });
        const month = payment.payedAt.toLocaleString("default", { month: "2-digit" });
        const day = payment.payedAt.toLocaleString("default", { day: "2-digit" });
        const paymentDate = day + "." + month + "." + year;
        this.doc.fontSize(13).font(this.arial)
            .text(`Последняя плата внесена ${paymentDate} г. - ${payment.amount} руб.`, this.startX, currentY + 2);

        return this.doc;
    }

    private getFirstBottomZone(operator: ISpdOperator, barcodeText: string): PDFKit.PDFDocument {
        this.doc
            .font(this.arialBold)
            .fontSize(14)
            .text(operator.operatorTextLow, this.startX, 451);

        this.doc
            .font(this.arialBold)
            .fontSize(15)
            .text('Расшифровка ШК', 880, 451, {
                width: 187,
                align: 'right'
            });

        this.doc
            .font(this.arialBold)
            .fontSize(13)
            .text(barcodeText, 880, 469, {
                width: 187,
                align: 'right'
            });

        this.doc
            .moveTo(this.startX, 488)
            .lineWidth(1)
            .undash()
            .lineTo(1065, 488)
            .stroke(); // Отчёркивающая линия

        return this.doc;
    }

    private getSubscriberData(subscriber: ISpdSubscriber, month: string, house: ISpdHouse): PDFKit.PDFDocument {
        this.doc
            .font(this.arialBold)
            .fontSize(13)
            .text(`Лицевой счет: ${subscriber.personalAccount}`, this.startX, 495)
            .text(subscriber.name, 243, 495)
            .text(subscriber.address, 543, 495)
            .text(month, 780, 495, {
                width: 287,
                align: 'right'
            });

        this.doc
            .font(this.arial)
            .fontSize(13)
            .text(`Пл. помещения: ${subscriber.apartmentArea} кв.м.`, this.startX, 512)
            .text(`Пл. жилых пом.: ${house.livingArea} кв.м.`, 243, 512)
            .text(`Пл. нежилых пом.: ${house.noLivingArea} кв.м.`, 543, 512)
            .text(`Пл. МОП: ${house.commonArea} кв.м.`, 780, 512, {
                width: 287,
                align: 'right'
            });

        this.doc
            .font(this.arial)
            .fontSize(13)
            .text(`Проживает/зарегистрировано: ${subscriber.numberOfRegistered}`, this.startX, 529);

        return this.doc;
    }

    private getSPDTableCap(): PDFKit.PDFDocument {
        for (const col of this.serviceCols) {
            if (!col.parts) {
                this.doc
                    .rect(col.startX, 546, col.width, 78)
                    .stroke()
                    .fontSize(12)
                    .text(col.name, col.xOfName ? col.xOfName : col.startX, col.yOfName, {
                        width: col.widthOfName,
                        align: 'center'
                    });
            } else {
                this.doc
                    .rect(col.startX, 546, col.width, 40)
                    .stroke()
                    .text(col.name, col.xOfName ? col.xOfName : col.startX, col.yOfName, {
                        width: col.widthOfName,
                        align: 'center'
                    });
                for (const part of col.parts) {
                    this.doc
                        .rect(part.startX, 586, part.width, 38)
                        .stroke()
                        .text(part.name, part.xOfName ? part.xOfName : part.startX, part.yOfName, {
                            width: part.widthOfName,
                            align: 'center'
                        });
                }
            }
        }

        return this.doc;
    }

    private getReadingTableCap(y: number): PDFKit.PDFDocument {
        this.doc.fontSize(12).font(this.arial);
        let x = this.startX;
        for (const col of this.readingCols) {
            if (!col.parts) {
                this.doc
                    .rect(x, y, col.width, 64)
                    .stroke()
                    .text(col.name, col.xSpanOfName ? x + col.xSpanOfName : x, y + col.ySpanOfName, {
                        width: col.widthOfName ? col.widthOfName : col.width,
                        align: 'center'
                    });
            } else {
                this.doc
                    .rect(x, y, col.width, 64)
                    .stroke()
                    .text(col.name, col.xSpanOfName ? x + col.xSpanOfName : x, y + col.ySpanOfName, {
                        width: col.widthOfName ? col.widthOfName : col.width,
                        align: 'center'
                    });
                let partX = x;
                for (const part of col.parts) {
                    this.doc
                        .rect(partX, y + 42, part.width, 22)
                        .stroke()
                        .text(part.name, partX, y + 42 + part.ySpanOfName, {
                            width: part.width,
                            align: 'center'
                        });
                    partX += part.width;
                }
            }
            x += col.width;
        }

        return this.doc;
    }

    private getServiceRow(y: number, service: ISpdService): PDFKit.PDFDocument {
        const textHeight = 6;
        const widthOfFirstCol = this.serviceCols.slice(0, service.titleColSpan).map(obj => obj.width).reduce((a, b) => a + b, 0);
        const spanFromEdge = service.titleAlign === 'right' ? -6 : service.titleAlign === 'left' ? 6 : 0;
        const spanFromEdgeWhenRight = -4;

        if (service.titleBold) {
            this.doc.font(this.arialBold);
        } else { this.doc.font(this.arial); }
        // Рисуем title
        this.doc
            .rect(this.startX, y, widthOfFirstCol, this.heightOfServiceCol)
            .stroke()
            .fontSize(13)
            .text(service.title, this.startX + spanFromEdge, y + textHeight, {
                width: widthOfFirstCol,
                align: service.titleAlign
            });

        // Рисуем прямоугольники для значений
        for (let i = service.titleColSpan; i < this.serviceCols.length; i++) {
            if (!this.serviceCols[i].parts) {
                this.doc.rect(this.serviceCols[i].startX, y, this.serviceCols[i].width, this.heightOfServiceCol);
            } else {
                this.doc.rect(this.serviceCols[i].startX, y, this.serviceCols[i].width, this.heightOfServiceCol);
                for (const part of this.serviceCols[i].parts) {
                    this.doc.rect(part.startX, y, part.width, this.heightOfServiceCol);
                }
            }
        }
        this.doc.stroke();

        // Рисуем значения
        const forValues = this.serviceCols.slice(service.titleColSpan);
        let numberOfInserted = 0;
        this.doc.fontSize(12);
        for (const arr of forValues) {

            if (service.servicesBold) {
                this.doc.font(this.arialBold);
            } else { this.doc.font(this.arial); }

            const align = isNumber(Number(service.services[numberOfInserted]));

            if (!arr.parts) {
                this.doc.text(service.services[numberOfInserted], arr.startX + (align ? spanFromEdgeWhenRight : 0), y + textHeight, {
                    width: arr.width,
                    align: align ? 'right' : 'center'
                });
                numberOfInserted++;
            } else {
                for (const part of arr.parts) {
                    this.doc.text(service.services[numberOfInserted], part.startX + (align ? spanFromEdgeWhenRight : 0), y + textHeight, {
                        width: part.width,
                        align: align ? 'right' : 'center'
                    });
                    numberOfInserted++;
                }
            }
        }
        return this.doc;
    }

    private getReadingRows(y: number, readings: ISpdReading[]): PDFKit.PDFDocument {
        let currentX = this.startX;
        let numberOfInserted = 0;
        const ySpan = 3;

        this.doc.fontSize(12).font(this.arial);
        for (const arr of this.readingCols) {
            if (!arr.parts) {
                const spanFromEdge =
                    readings[numberOfInserted].readingAlign === 'right' ? -4 :
                        readings[numberOfInserted].readingAlign === 'left' ? 4 : 0;

                this.doc.rect(currentX, y, arr.width, this.heightOfReadingCol).stroke();
                this.doc.text(readings[numberOfInserted].reading, currentX + spanFromEdge, y + ySpan, {
                    width: arr.width,
                    align: readings[numberOfInserted].readingAlign
                });
                currentX += arr.width;
                numberOfInserted++;
            } else {
                let partX = currentX;
                for (const part of arr.parts) {
                    const spanFromEdge =
                        readings[numberOfInserted].readingAlign === 'right' ? -4 :
                            readings[numberOfInserted].readingAlign === 'left' ? 4 : 0;

                    this.doc.rect(partX, y, part.width, this.heightOfReadingCol).stroke();
                    this.doc.text(readings[numberOfInserted].reading, partX + spanFromEdge, y + ySpan, {
                        width: part.width,
                        align: readings[numberOfInserted].readingAlign
                    });
                    partX += part.width;
                    numberOfInserted++;
                }
                currentX += arr.width;
            }
        }

        return this.doc;
    }
}