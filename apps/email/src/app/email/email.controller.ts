import { Body, Controller, HttpStatus } from '@nestjs/common';
import { RMQError, RMQRoute, RMQValidate } from 'nestjs-rmq';
import { EmailRegister, EmailRegisterMany } from '@myhome/contracts';
import { UNABLE_TO_SEND } from '@myhome/constants';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import { ConfigService } from '@nestjs/config';
import { getMailerConfig } from './configs/mailer.config';
import { Transporter } from 'nodemailer';
import { UserRole } from '@myhome/interfaces';

@Controller("email")
export class EmailController {
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = getMailerConfig(configService);
  }

  @RMQValidate()
  @RMQRoute(EmailRegister.topic)
  async register(@Body() dto: EmailRegister.Request): Promise<EmailRegister.Response> {
    return await this.sendMail(dto.email, dto.link, dto.userRole);
  }

  @RMQValidate()
  @RMQRoute(EmailRegisterMany.topic)
  async registerMany(@Body() dto: EmailRegisterMany.Request): Promise<EmailRegisterMany.Response> {
    return dto.users.map(async user => {
      await this.sendMail(user.email, user.link, user.userRole);
    })
  }

  private async sendMail(email: string, id: string, userRole: UserRole) {
    const link = `${this.configService.get("CLIENT_URL")}/set-password?role=${userRole}&id=${id}`;
    try {
      const mailOptions = {
        from: this.configService.get('MAILER_USER'),
        to: email,
        subject: 'Мой дом',
        html: `
         <!DOCTYPE html>
    <html>

    <body>
        <div style="font-family: 'Noto Sans', sans-serif; text-align: center;">
            <div class="textwrapper" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 20px 30px;
                    min-width: 20rem;
                    background-color: white;
                    border-radius: 8px;">
                <h1 class="title" style="
                        color: #7653FC;
                        font-size: 24px;
                        margin-bottom: 30px;">
                    Добро пожаловать в "Мой Дом"!
                </h1>
                <p style="
                        font-size: 16px;">
                    После завершения регистрации необходимо создать пароль
                </p>
                <a class="button" href="${link}" style="
                        background-color: #7653FC;
                        padding: 10px 20px;
                        border-radius: 8px;
                        display: inline-block;
                        outline: none;
                        border: none;
                        cursor: pointer;
                        color: #ffffff;
                        text-decoration: none;
                        margin-top: 30px;">
                    Создать пароль
                </a>
            </div>
            <div class="description" style="
                    color: rgba(168, 151, 243, 0.91);
                    position: absolute;
                    bottom: 30px;
                    left: 0;
                    right: 0;">
                © MyHome
            </div>
        </div>
    </body>

    </html>
            `,
      };

      const result = await this.transporter.sendMail(mailOptions);

      return result;
    } catch (e) {
      throw new RMQError(UNABLE_TO_SEND, ERROR_TYPE.RMQ, HttpStatus.GATEWAY_TIMEOUT);
    }
  }
}