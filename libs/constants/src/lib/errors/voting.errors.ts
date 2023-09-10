import { HttpStatus } from "@nestjs/common"

export const VOTING_NOT_EXIST = {
    message: (id: number) => `Опрос с id=${id} не существует`,
    status: HttpStatus.NOT_FOUND
}
export const OPTIONS_NOT_EXIST = {
    message: (votingId: number) => `У опроса с id=${votingId} нет вариантов ответа`,
    status: HttpStatus.NOT_FOUND
}
export const OPTION_NOT_EXIST = {
    message: 'Что-то пошло не так при поиске вариантов ответов',
    status: HttpStatus.NOT_FOUND
}
export const VOTINGS_FOR_MC_NOT_EXIST = {
    message: (managementCompanyId: number) => `Невозможно получить опросы для управляющей компании с id=${managementCompanyId}`,
    status: HttpStatus.NOT_FOUND
}