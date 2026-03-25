import { Column, DataType, Model, Table, HasMany, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Driver } from '../drivers/driver.model';
import { Waybill } from '../waybills/waybill.model';

export enum CarStatus {
  ACTIVE = 'Active',
  IN_SERVICE = 'InService',
  BLOCKED = 'Blocked',
}

export interface CarCreationAttrs {
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  vin: string;
  color: string;
  status?: CarStatus;
  currentDriverId?: string;
}

@Table({ tableName: 'cars', underscored: true })
export class Car extends Model<Car, CarCreationAttrs> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  brand: string;

  @Column({ type: DataType.STRING, allowNull: false })
  model: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  year: number;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  plateNumber: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  vin: string;

  @Column({ type: DataType.STRING, allowNull: false })
  color: string;

  @Column({
    type: DataType.ENUM(...Object.values(CarStatus)),
    defaultValue: CarStatus.ACTIVE,
  })
  status: CarStatus;

  @ForeignKey(() => Driver)
  @Column({ type: DataType.UUID, allowNull: true })
  currentDriverId: string;

  @BelongsTo(() => Driver)
  currentDriver: Driver;

  @HasMany(() => Waybill)
  waybills: Waybill[];
}