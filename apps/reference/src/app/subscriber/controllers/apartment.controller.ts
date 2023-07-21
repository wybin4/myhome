import { Body, ConflictException, Controller, NotFoundException } from '@nestjs/common';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { ReferenceAddApartment, ReferenceGetApartment } from '@myhome/contracts';
import { ApartmentRepository } from '../repositories/apartment.repository';
import { Apartments } from '../entities/apartment.entity';
import { HouseRepository } from '../repositories/house.repository';
@Controller()
export class ApartmentController {
	constructor(
		private readonly apartmentRepository: ApartmentRepository,
		private readonly houseRepository: HouseRepository,
	) { }

	@RMQValidate()
	@RMQRoute(ReferenceGetApartment.topic)
	async getApartment(@Body() { id }: ReferenceGetApartment.Request) {
		const apartment = await this.apartmentRepository.findApartmentById(id);
		const gettedApartment = new Apartments(apartment).getApartment();
		return { gettedApartment };
	}

	@RMQValidate()
	@RMQRoute(ReferenceAddApartment.topic)
	async addApartment(@Body() dto: ReferenceAddApartment.Request) {
		const newApartmentEntity = new Apartments(dto);
		const house = await this.houseRepository.findHouseById(dto.houseId);
		if (!house) {
			throw new NotFoundException('Такой дом не существует');
		}
		const existedApartment = await this.apartmentRepository.findApartmentByNumber(dto.apartmentNumber, dto.houseId);
		if (existedApartment) {
			throw new ConflictException('Такая квартира уже существует');
		}
		const newApartment = await this.apartmentRepository.createApartment(newApartmentEntity);
		return { newApartment };
	}

}
