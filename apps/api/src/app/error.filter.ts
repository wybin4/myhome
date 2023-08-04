import { HttpStatus, NotFoundException, ConflictException, InternalServerErrorException, UnprocessableEntityException, BadRequestException } from "@nestjs/common";

export function CatchError(e) {
    if (e.code === HttpStatus.NOT_FOUND) {
        throw new NotFoundException(e.message);
    } else if (e.code === HttpStatus.CONFLICT) {
        throw new ConflictException(e.message);
    } else if (e.code === HttpStatus.UNPROCESSABLE_ENTITY) {
        throw new UnprocessableEntityException(e.message);
    } else if (e.code === HttpStatus.BAD_REQUEST) {
        throw new BadRequestException(e.message);
    } else throw new InternalServerErrorException(e.message);
}