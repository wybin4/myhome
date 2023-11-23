import { ConfigService } from '@nestjs/config';
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';

export const getMailerConfig = (configService: ConfigService): Transporter<SentMessageInfo> => {
    return nodemailer.createTransport({
        host: configService.get('MAILER_HOST'),
        port: configService.get('MAILER_PORT'),
        secure: true,
        auth: {
            user: configService.get('MAILER_USER'),
            pass: configService.get('MAILER_PASSWORD'),
        },
    });
};
