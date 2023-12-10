import { Body, Controller, HttpCode, Post, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { RMQService } from 'nestjs-rmq';
import { CatchError } from '../../error.filter';
import { CorrectionGetDebts } from '@myhome/contracts';
import { JWTAuthGuard } from '../../guards/jwt.guard';
import { IJWTPayload, UserRole } from '@myhome/interfaces';
import { RoleGuard } from '../../guards/role.guard';
import { GetDebtsDto } from '../../dtos/correction/debt.dto';

@Controller('debt')
export class DebtController {
    constructor(private readonly rmqService: RMQService) { }

    @SetMetadata('role', UserRole.Owner)
    @UseGuards(JWTAuthGuard, RoleGuard)
    @HttpCode(201)
    @Post('get-debts')
    async getDebts(@Req() req: { user: IJWTPayload }, @Body() dto: GetDebtsDto) {
        try {
            const ownerId = req.user.userId;
            return await this.rmqService.send<
                CorrectionGetDebts.Request,
                CorrectionGetDebts.Response
            >(CorrectionGetDebts.topic, { ...dto, ownerId });
        } catch (e) {
            CatchError(e);
        }
    }
}
