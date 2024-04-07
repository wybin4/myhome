import { BadRequestException, Body, Controller, HttpCode, Post, SetMetadata, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { EventAddAppeal, EventUpdateAppeal } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { FileInterceptor } from "@nestjs/platform-express";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import { AppealType, UserRole } from '@myhome/interfaces';
import { AddAppealDto, UpdateAppealDto } from '../../dtos/event/appeal.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { RoleGuard } from '../../guards/role.guard';

@Controller('appeal')
export class AppealController {
    constructor(private readonly rmqService: RMQService) { }

    private getAddAppealRequest(typeOfAppeal: AppealType, dto: AddAppealDto) {
        switch (typeOfAppeal) {
            case AppealType.AddIndividualMeter: {
                return {
                    typeOfServiceId: parseInt(dto.typeOfServiceId),
                    apartmentId: parseInt(dto.apartmentId),
                    factoryNumber: dto.factoryNumber,
                    issuedAt: new Date(dto.issuedAt),
                    verifiedAt: new Date(dto.verifiedAt)
                };
            }
            case AppealType.VerifyIndividualMeter: {
                return {
                    issuedAt: new Date(dto.issuedAt),
                    verifiedAt: new Date(dto.verifiedAt),
                    meterId: parseInt(dto.meterId)
                };
            }
            case AppealType.ProblemOrQuestion:
                return {
                    text: dto.text
                };
            case AppealType.Claim:
                return {
                    text: dto.text
                };
        }
    }

    @SetMetadata('role', UserRole.Owner)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @UseInterceptors(FileInterceptor("file"))
    @HttpCode(201)
    @Post('add-appeal')
    async addAppeal(@UploadedFile() file: Express.Multer.File, @Body() dto: AddAppealDto) {
        try {
            let attachment: string;
            if (
                dto.typeOfAppeal === AppealType.AddIndividualMeter ||
                dto.typeOfAppeal === AppealType.VerifyIndividualMeter
            ) {
                if (!file || !file.mimetype.includes('image')) {
                    throw new BadRequestException('Неверный формат вложения')
                }
                if (dto.typeOfAppeal === AppealType.AddIndividualMeter) {
                    attachment = file.buffer.toString('base64');
                }
                if (dto.typeOfAppeal === AppealType.VerifyIndividualMeter) {
                    attachment = file.buffer.toString('base64');
                }
            }

            const typeOfAppeal = dto.typeOfAppeal as AppealType;

            return await this.rmqService.send<
                EventAddAppeal.Request,
                EventAddAppeal.Response
            >(EventAddAppeal.topic, {
                managementCompanyId: parseInt(dto.managementCompanyId),
                attachment,
                subscriberId: parseInt(dto.subscriberId),
                typeOfAppeal,
                ...this.getAddAppealRequest(typeOfAppeal, dto)
            });
        } catch (e) {
            CatchError(e);
        }
    }

    @SetMetadata('role', UserRole.ManagementCompany)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(200)
    @Post('update-appeal')
    async updateAppeal(@Body() dto: UpdateAppealDto) {
        try {
            return await this.rmqService.send<
                EventUpdateAppeal.Request,
                EventUpdateAppeal.Response
            >(EventUpdateAppeal.topic, dto);
        } catch (e) {
            CatchError(e);
        }
    }

}