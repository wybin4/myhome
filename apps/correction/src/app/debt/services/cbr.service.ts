import { CANT_GET_KEY_RATE, RMQException } from "@myhome/constants";
import { CorrectionGetKeyRate } from "@myhome/contracts";
import { Injectable } from "@nestjs/common";
import axios from 'axios';
import { RedisService } from "./redis.service";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class CBRService {
    constructor(
        private readonly redisService: RedisService
    ) { }

    @Cron("0 10 * * *")
    async getKeyRateByCron() {
        await this.getKeyRate({});
    }

    public async getKeyRate(dto: CorrectionGetKeyRate.Request) {
        const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL';

        const keyRateFromCache = await this.redisService.getValue("keyRate");
        if (keyRateFromCache) {
            return keyRateFromCache;
        }

        const currentDate = new Date();
        const lastMonthDate = new Date(currentDate);
        lastMonthDate.setMonth(currentDate.getMonth() - 1);

        const xmlRequest = this.generateSoapRequest({
            fromDate: dto.startDate ? dto.startDate.toISOString() : lastMonthDate.toISOString(),
            ToDate: dto.endDate ? dto.endDate.toISOString() : currentDate.toISOString(),
        });

        const headers = {
            'Content-Type': 'text/xml',
            SOAPAction: url,
        };

        const timeout = 5000;

        try {
            const response = await axios.post(url, xmlRequest, { headers, timeout });

            const keyRates = response.data.KeyRateXMLResult.KeyRate.KR.map((rcdKR) => ({
                period: new Date(Date.parse(rcdKR.DT)),
                value: parseFloat(rcdKR.Rate),
            }));
            const keyRateFromCBR = keyRates[0].value;

            await this.redisService.setValue("keyRate", keyRateFromCBR);
            await this.redisService.expireValue("keyRate", 86400);

            return keyRateFromCBR;
        } catch (error) {
            throw new RMQException(CANT_GET_KEY_RATE.message, CANT_GET_KEY_RATE.status);
        }
    }

    private generateSoapRequest(params: { fromDate: string; ToDate: string }): string {
        return `
            <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns:web="http://www.cbr.ru/">
                <soapenv:Header/>
                <soapenv:Body>
                    <web:KeyRateXMLAsync>
                        <web:fromDate>${params.fromDate}</web:fromDate>
                        <web:ToDate>${params.ToDate}</web:ToDate>
                    </web:KeyRateXMLAsync>
                </soapenv:Body>
            </soapenv:Envelope>`;
    }
}
