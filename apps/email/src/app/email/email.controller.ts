import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { EmailRegister } from '@myhome/contracts';
import { UNABLE_TO_SEND } from '@myhome/constants';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ConfigService } from '@nestjs/config';
import { getMailerConfig } from './configs/mailer.config';
import { Transporter } from 'nodemailer';

@Controller()
export class EmailController {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = getMailerConfig(configService);
  }

  @RMQValidate()
  @RMQRoute(EmailRegister.topic)
  async register(@Body() dto: EmailRegister.Request): Promise<EmailRegister.Response> {
    try {
      const mailOptions = {
        from: this.configService.get('MAILER_USER'),
        to: dto.user.email,
        subject: 'Мой дом',
        html: dto.html,
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
      };

      const result = await this.transporter.sendMail(mailOptions);

      return result;
    } catch (e) {
      throw new RMQError(UNABLE_TO_SEND, ERROR_TYPE.RMQ, HttpStatus.GATEWAY_TIMEOUT);
    }
  }
}