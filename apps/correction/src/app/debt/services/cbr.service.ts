import { CANT_GET_KEY_RATE, RMQException } from "@myhome/constants";
import { CorrectionGetKeyRate } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import { createClientAsync } from "soap";

@Injectable()
export class CBRService {
    public async getKeyRate(dto: CorrectionGetKeyRate.Request) {
        // const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL';
        // const client = await createClientAsync(url);

        // const currentDate = new Date();
        // const lastMonthDate = new Date(currentDate);
        // lastMonthDate.setMonth(currentDate.getMonth() - 1);

        // const params = {
        //     fromDate: dto.startDate ? dto.startDate.toISOString() : lastMonthDate.toISOString(),
        //     ToDate: dto.endDate ? dto.endDate.toISOString() : currentDate.toISOString(),
        // };

        // const keyRatePromise = client.KeyRateXMLAsync(params);

        // const timeout = 5000;

        // const timeoutPromise = new Promise((_, reject) => {
        //     setTimeout(() => {
        //         reject(new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status));
        //     }, timeout);
        // });

        // try {
        //     const result = await Promise.race([keyRatePromise, timeoutPromise]);

        //     const keyRates = result[0].KeyRateXMLResult.KeyRate.KR.map((rcdKR) => ({
        //         period: new Date(Date.parse(rcdKR.DT)),
        //         value: parseFloat(rcdKR.Rate),
        //     }));

        //     return keyRates[0].value;
        // } catch (error) {
        //     throw new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status);
        // }

        return 13;
    }
}
