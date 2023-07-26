import { MailerService } from '@nestjs-modules/mailer';
import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { EmailRegister } from '@myhome/contracts';
import { UNABLE_TO_SEND } from '@myhome/constants';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ConfigService } from '@nestjs/config';

@Controller()
export class EmailController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }

  @RMQValidate()
  @RMQRoute(EmailRegister.topic)
  async register(@Body() dto: EmailRegister.Request): Promise<EmailRegister.Response> {
    try {
      return await this.mailerService.sendMail({
        from: this.configService.get('MAILER_USER'),
        to: dto.user.email,
        subject: 'Мой дом',
        html: dto.html
        // html: `
        // <!DOCTYPE html>
        // <html>
        // <head>
        //   <title>Добро пожаловать в "Наш Дом"</title>
        // </head>
        // <body style="text-align: center;">
        //   <h1 style="color: #007BFF; font-size: 24px;">Добро пожаловать в "Наш Дом"!</h1>
        //   <p style="font-size: 16px;">После завершения регистрации необходимо создать пароль</p>
        //   <button style="margin-top: 20px;">
        //     <a href="${dto.link}" style="text-decoration: none; color: #ffffff; background-color: #007BFF; padding: 10px 20px; border-radius: 5px; display: inline-block;">Создать пароль</a>
        //   </button>
        // </body>
        // </html>
        // `,
      });
    } catch (e) {
      throw new RMQError(UNABLE_TO_SEND, ERROR_TYPE.RMQ, HttpStatus.GATEWAY_TIMEOUT);
    }
  }
}