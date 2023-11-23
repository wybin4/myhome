import { HttpException, HttpStatus } from '@nestjs/common';

export class RMQException extends HttpException {
    constructor(message: string, status: HttpStatus) {
        super(message, status);
    }
}
