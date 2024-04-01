import { BadRequestException, Body, Controller, HttpCode, Post, SetMetadata, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { EventAddAppeal, EventUpdateAppeal } from '@myhome/contracts';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { FileInterceptor } from "@nestjs/platform-express";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Multer } from 'multer';
import { AddIndividualMeterData, AppealType, UserRole, VerifyIndividualMeterData } from '@myhome/interfaces';
import { AddAppealDto, UpdateAppealDto } from '../../dtos/event/appeal.dto';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { RoleGuard } from '../../guards/role.guard';

@Controller('appeal')
export class AppealController {
    constructor(private readonly rmqService: RMQService) { }

    @SetMetadata('role', UserRole.Owner)
    // @UseGuards(JWTAuthGuard, RoleGuard)
    @UseInterceptors(FileInterceptor("file"))
    @HttpCode(201)
    @Post('add-appeal')
    async addAppeal(@UploadedFile() file: Express.Multer.File, @Body() dto: AddAppealDto) {
        if (
            dto.typeOfAppeal === AppealType.AddIndividualMeter ||
            dto.typeOfAppeal === AppealType.VerifyIndividualMeter
        ) {
            if (!file || !file.mimetype.includes('image')) {
                throw new BadRequestException('Неверный формат вложения')
            }
            if (dto.typeOfAppeal === AppealType.AddIndividualMeter) {
                (dto.data as AddIndividualMeterData).attachment = file.buffer.toString('base64');
            }
            if (dto.typeOfAppeal === AppealType.VerifyIndividualMeter) {
                (dto.data as VerifyIndividualMeterData).attachment = file.buffer.toString('base64');
            }
        }

        for (const key in dto) {
            if (key.includes('Id')) {
                dto[key] = parseInt(dto[key]);
            }
            if (key === "data") {
                for (const dataKey in dto.data) {
                    if (dataKey.includes('Id')) {
                        dto.data[dataKey] = parseInt(dto.data[dataKey]);
                    }
                }
            }
        }

        try {
            return await this.rmqService.send<
                EventAddAppeal.Request,
                EventAddAppeal.Response
            >(EventAddAppeal.topic, dto);
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