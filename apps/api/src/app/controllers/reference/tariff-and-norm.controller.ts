import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { IAddTariffAndNorm, ReferenceAddTariffsOrNorms, ReferenceGetTariffsOrNormsByUser, ReferenceUpdateTariffOrNorm } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { AddTariffAndNormsDto, GetTariffsAndNormsByUserDto, UpdateTariffAndNormDto } from '../../dtos/reference/tariff-and-norm.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, TariffAndNormData, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';

@Controller('tariff-and-norm')
export class TariffAndNormController {
    constructor(private readonly rmqService: RMQService) { }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(200)
    @Post('get-tariffs-and-norms-by-user')
    async getTariffsAndNormsByUser(@Req() req: { user: IJWTPayload }, @Body() dto: GetTariffsAndNormsByUserDto) {
        try {
            const managementCompanyId = req.user.userId;
            return await this.rmqService.send<
                ReferenceGetTariffsOrNormsByUser.Request,
                ReferenceGetTariffsOrNormsByUser.Response
            >(ReferenceGetTariffsOrNormsByUser.topic, { ...dto, managementCompanyId });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('add-tariffs-and-norms')
    async addTariffAndNorms(@Req() req: { user: IJWTPayload }, @Body() dto: AddTariffAndNormsDto) {
        try {
            const managementCompanyId = req.user.userId;
            const newDto: IAddTariffAndNorm[] = dto.tariffAndNorms.map(d => {
                {
                    return {
                        typeOfServiceId: d.typeOfServiceId,
                        type: dto.type,
                        data: { ...d, managementCompanyId } as TariffAndNormData
                    }
                }
            });
            return await this.rmqService.send<
                ReferenceAddTariffsOrNorms.Request,
                ReferenceAddTariffsOrNorms.Response
            >(ReferenceAddTariffsOrNorms.topic, { tariffAndNorms: [...newDto] });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(200)
    @Post('update-tariff-and-norm')
    async updateHouse(@Body() dto: UpdateTariffAndNormDto) {
        try {
            return await this.rmqService.send<
                ReferenceUpdateTariffOrNorm.Request,
                ReferenceUpdateTariffOrNorm.Response
            >(ReferenceUpdateTariffOrNorm.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }
}
