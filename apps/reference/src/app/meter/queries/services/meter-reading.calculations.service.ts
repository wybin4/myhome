import { RMQException, FAILED_TO_GET_CURRENT_READINGS, NORM_NOT_EXIST, FAILED_TO_GET_METER_READINGS, MISSING_PREVIOUS_READING, FAILED_TO_GET_READINGS_WITHOUT_NORMS } from "@myhome/constants";
import { INorm, IGetMeterReading, Reading, IIndividualMeterReading } from "@myhome/interfaces";
import { Injectable } from "@nestjs/common";
import { IndividualMeterWithReadings, GeneralMeterWithReadings, IndividualCurrentAndPrevReadings } from "./meter-reading.queries.service";

@Injectable()
export class MeterReadingCalculationsService {
    public getPeriods(start: number, end: number) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, start);
        const endOfPreviousMonth = new Date(currentYear, currentMonth - 1, end);

        const startOfCurrentMonth = new Date(currentYear, currentMonth, start);
        const endOfCurrentMonth = new Date(currentYear, currentMonth, end);
        return { startOfPreviousMonth, endOfPreviousMonth, startOfCurrentMonth, endOfCurrentMonth };
    }

    public async getActiveIndividualMeterReadings(
        activeMeters: IndividualMeterWithReadings[], norms: INorm[], numberOfRegistered: number
    ): Promise<IGetMeterReading[]> {
        const temp = [];
        let reading: Reading;
        for (const meter of activeMeters) {
            reading = await this.calculateActiveIndividualMeterReadings(
                meter.meterId, meter.reading, meter.typeOfServiceId,
                norms, numberOfRegistered
            );
            const tempReading =
                'difference' in reading ? reading.difference :
                    'norm' in reading ? reading.norm :
                        'avgVolume' in reading ? reading.avgVolume : 0;
            temp.push({
                meterReadings: {
                    individualMeterId: meter.meterId,
                    reading: tempReading,
                    readAt: new Date()
                },
                typeOfServiceId: meter.typeOfServiceId,
                fullMeterReadings: reading
            });
        }
        return temp;
    }

    public async getActiveGeneralMeterReadings(
        activeMeterReadings: GeneralMeterWithReadings[]
    ): Promise<IGetMeterReading[]> {
        const temp: IGetMeterReading[] = [];
        for (const meter of activeMeterReadings) {
            if (!meter.reading.current) {
                throw new RMQException(
                    FAILED_TO_GET_CURRENT_READINGS.message(meter.meterId),
                    FAILED_TO_GET_CURRENT_READINGS.status
                );
            }
            if (meter.reading.previous) {
                const reading = meter.reading.current.reading - meter.reading.previous.reading;
                temp.push({
                    meterReadings: {
                        generalMeterId: meter.meterId,
                        reading: reading,
                        readAt: meter.reading.current.readAt
                    },
                    typeOfServiceId: meter.typeOfServiceId,
                    fullMeterReadings: {
                        current: meter.reading.current.reading,
                        previous: meter.reading.previous.reading,
                        difference: reading
                    }
                })
            } else {
                temp.push({
                    meterReadings: {
                        generalMeterId: meter.meterId,
                        reading: meter.reading.current.reading,
                        readAt: new Date()
                    },
                    typeOfServiceId: meter.typeOfServiceId,
                    fullMeterReadings: {
                        current: meter.reading.current.reading,
                        previous: 0,
                        difference: meter.reading.current.reading
                    }
                })
            }
        }
        return temp;
    }

    public async getNIAndNPGeneralMeterReadings(
        npAndNIReadings: GeneralMeterWithReadings[], commonArea: number, norms: INorm[]
    ): Promise<IGetMeterReading[]> {
        const temp: IGetMeterReading[] = [];
        let norm: number, tempNorm: INorm[];
        for (const meter of npAndNIReadings) {
            tempNorm = norms.filter(norm => norm.typeOfServiceId === meter.typeOfServiceId);
            if (tempNorm.length > 0) {
                norm = tempNorm[0].norm;
            } else throw new RMQException(NORM_NOT_EXIST.message, NORM_NOT_EXIST.status);

            temp.push({
                meterReadings: {
                    generalMeterId: meter.meterId,
                    reading: norm * commonArea, // Норматив * площадь общедомовых помещений
                    readAt: new Date()
                }, typeOfServiceId: meter.typeOfServiceId,
                fullMeterReadings: {
                    norm: norm
                }
            });
        }
        return temp;
    }


    public async calculateActiveIndividualMeterReadings(
        meterId: number,
        reading: IndividualCurrentAndPrevReadings,
        typeOfServiceId: number,
        norms: INorm[],
        numberOfRegistered: number,
    ): Promise<Reading> {
        const currentDate = new Date();
        const { current: currentMonthReadings, previous: previousReadings } = reading;

        if (previousReadings.length <= 0) {
            // Если нет предыдущих показаний
            if (currentMonthReadings.length > 0) {
                // Если есть текущие, т.е. счётчик новый
                return {
                    current: currentMonthReadings[0].reading, previous: 0,
                    difference: currentMonthReadings[0].reading
                };
                // Если ничего нет
            } else throw new RMQException(FAILED_TO_GET_METER_READINGS.message(meterId), FAILED_TO_GET_METER_READINGS.status);
        }
        const lastReadingDate = previousReadings[0].readAt;
        const differenceInMonths = (currentDate.getMonth() - lastReadingDate.getMonth()) + 12 * (currentDate.getFullYear() - lastReadingDate.getFullYear());

        if (currentMonthReadings.length > 0) {
            // Если есть показания за текущий месяц
            if (differenceInMonths === 1) {
                // Если есть показания за предыдущий месяц
                return {
                    current: currentMonthReadings[0].reading, previous: previousReadings[0].reading,
                    difference: currentMonthReadings[0].reading - previousReadings[0].reading
                };
                // Есть показания за текущий, но нет за предыдущий
            } else throw new RMQException(MISSING_PREVIOUS_READING.message(meterId), MISSING_PREVIOUS_READING.status);
        } else {
            if (differenceInMonths < 3) {
                // Если прошло меньше трех месяцев с момента отправки показаний
                const averageConsumption = this.calculateAverageConsumption(previousReadings);
                return { avgVolume: averageConsumption };
            } else {
                const tempNorm = norms.filter(norm => norm.typeOfServiceId === typeOfServiceId);
                let norm: number;
                if (tempNorm.length > 0) {
                    norm = tempNorm[0].norm;
                } else throw new RMQException(NORM_NOT_EXIST.message, NORM_NOT_EXIST.status);
                return { norm: norm * numberOfRegistered };
                // Расчёт по нормативу
            }
        }
    }
    public calculateAverageConsumption(readings: IIndividualMeterReading[]): number {
        const volume = [];

        for (let i = readings.length - 1; i > 0; i--) {
            const consumption = readings[i - 1].reading - readings[i].reading;
            volume.push(consumption);
        }
        const averageConsumption = volume.reduce((sum, value) => sum + value, 0) / volume.length;
        return averageConsumption;
    }

    public async getNPAndNIIndividualMeterReadings(
        npAndNIMeters: IndividualMeterWithReadings[],
        numberOfRegistered: number,
        norms: INorm[],
    ): Promise<IGetMeterReading[]> {
        try {
            const temp: IGetMeterReading[] = [];
            let norm: number, tempNorm: INorm[];
            for (const meter of npAndNIMeters) {
                tempNorm = norms.filter(norm => norm.typeOfServiceId === meter.typeOfServiceId);
                if (tempNorm.length > 0) {
                    norm = tempNorm[0].norm;
                } else throw new RMQException(NORM_NOT_EXIST.message, NORM_NOT_EXIST.status);
                temp.push({
                    meterReadings: {
                        individualMeterId: meter.meterId,
                        reading: norm * numberOfRegistered,
                        readAt: new Date()
                    }, typeOfServiceId: meter.typeOfServiceId,
                    fullMeterReadings: {
                        norm: norm * numberOfRegistered
                    }
                });
            }
            return temp;
        } catch (e) {
            throw new RMQException(FAILED_TO_GET_READINGS_WITHOUT_NORMS.message, FAILED_TO_GET_READINGS_WITHOUT_NORMS.status);
        }
    }
}