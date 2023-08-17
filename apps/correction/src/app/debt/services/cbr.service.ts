import { Injectable } from "@nestjs/common";
import { createClientAsync } from "soap";

@Injectable()
export class CBRService {
    public async getKeyRates(startDate: Date, endDate: Date): Promise<[{ period: Date, value: number }]> {
        const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL';
        const client = await createClientAsync(url);

        const params = {
            fromDate: startDate.toISOString(),
            ToDate: endDate.toISOString(),
        };

        const result = await client.KeyRateXMLAsync(params);

        const keyRates = result[0].KeyRateXMLResult.KeyRate.KR.map((rcdKR) => ({
            period: new Date(Date.parse(rcdKR.DT)),
            value: parseFloat(rcdKR.Rate),
        }));

        return keyRates;
    }
}