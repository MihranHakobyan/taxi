import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Waybill, WaybillStatus } from './waybill.model';
import { CreateWaybillDto } from './dto/create-waybill.dto';
import { UpdateWaybillDto } from './dto/update-waybill.dto';
import { WaybillQueryDto } from './dto/waybill-query.dto';
import { Op, Transaction } from 'sequelize';
import { Driver } from '../drivers/driver.model';
// import { Car } from '../cars/car.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class WaybillsService {
    constructor(
        @InjectModel(Waybill)
        private readonly waybillModel: typeof Waybill,
        private readonly sequelize: Sequelize,
    ) { }

    async create(dto: CreateWaybillDto): Promise<Waybill> {
        return this.sequelize.transaction(async (transaction) => {
            const activeWaybill = await this.waybillModel.findOne({
                where: {
                    driverId: dto.driverId,
                    status: WaybillStatus.ACTIVE
                },
                transaction,
            });

            if (activeWaybill) {
                throw new BadRequestException('Driver already has an active waybill');
            }

            const currentYear = new Date().getFullYear();
            const lastWaybill = await this.waybillModel.findOne({
                where: {
                    number: { [Op.like]: `WB-${currentYear}-%` }
                },
                order: [['createdAt', 'DESC']],
                lock: transaction.LOCK.UPDATE,
                transaction,
            });

            const nextNumber = this.generateWaybillNumber(lastWaybill?.number);

            return this.waybillModel.create(
                {
                    ...dto,
                    number: nextNumber,
                    status: WaybillStatus.ACTIVE,
                },
                { transaction },
            );
        });
    }

    async findAll(query: WaybillQueryDto) {
        const { page = 1, limit = 20, status, driverId, from, to } = query;
        const offset = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (driverId) where.driverId = driverId;
        if (from || to) {
            where.date = {};
            if (from) where.date[Op.gte] = from;
            if (to) where.date[Op.lte] = to;
        }

        const { rows, count } = await this.waybillModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: Driver, attributes: ['id', 'firstName', 'lastName'] },
                // { model: Car, attributes: ['id', 'plateNumber'] }
            ],
            distinct: true,
        });

        return {
            data: rows,
            total: count,
            page,
            limit,
        };
    }

    async findOne(id: string): Promise<Waybill> {
        const waybill = await this.waybillModel.findByPk(id, {
            include: [
                { model: Driver },
                // { model: Car }
            ]
        });

        if (!waybill) {
            throw new NotFoundException(`Waybill with ID ${id} not found`);
        }

        return waybill;
    }

    async findActiveByDriver(driverId: string): Promise<Waybill> {
        const waybill = await this.waybillModel.findOne({
            where: { driverId, status: WaybillStatus.ACTIVE },
            // include: [{ model: Car }]
        });

        if (!waybill) {
            throw new NotFoundException('No active waybill found for this driver');
        }

        return waybill;
    }

    async update(id: string, dto: UpdateWaybillDto): Promise<Waybill> {
        const waybill = await this.findOne(id);

        if (dto.endMileage && dto.endMileage <= waybill.startMileage) {
            throw new BadRequestException('End mileage must be greater than start mileage');
        }

        if (dto.status === WaybillStatus.CLOSED && !dto.endMileage) {
            throw new BadRequestException('End mileage is required to close the waybill');
        }

        return waybill.update(dto);
    }

    async remove(id: string): Promise<{ message: string }> {
        const waybill = await this.findOne(id);

        try {
            await waybill.destroy();
            return { message: `Waybill with ID ${id} has been successfully deleted` };
        } catch (error) {
            throw new BadRequestException('Could not delete waybill. It might be linked to other records.');
        }
    }

    private generateWaybillNumber(lastNumber?: string): string {
        const year = new Date().getFullYear();
        const prefix = `WB-${year}-`;

        if (!lastNumber || !lastNumber.startsWith(prefix)) {
            return `${prefix}000001`;
        }

        const parts = lastNumber.split('-');
        const lastSequence = parseInt(parts[2], 10);
        const nextSequence = (lastSequence + 1).toString().padStart(6, '0');

        return `${prefix}${nextSequence}`;
    }
}