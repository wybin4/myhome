import { HttpStatus, NotFoundException, ConflictException, InternalServerErrorException } from "@nestjs/common";

export function CatchError(e) {
    if (e.code === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(e.message);
    } else if (e.code === HttpStatus.CONFLICT) {
        throw new ConflictException(e.message);
    } else throw new InternalServerErrorException('Что-то пошло не так');
}