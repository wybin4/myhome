import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export const getMailerConfig = (): MailerOptions => {
    const configService = new ConfigService();
    return {
        transport: {
            host: configService.get('MAILER_HOST'),
            port: configService.get('MAILER_PORT'),
            secure: true,
            auth: {
                user: configService.get('MAILER_USER'),
                pass: configService.get('MAILER_PASSWORD'),
            },
        },
    };
};
