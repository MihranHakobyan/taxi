import { Column, DataType, Model, Table, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Driver } from '../drivers/driver.model';
// import { Car } from '../cars/car.model';

export enum WaybillStatus {
    ACTIVE = 'Active',
    CLOSED = 'Closed',
    CANCELLED = 'Cancelled',
}

@Table({
    tableName: 'waybills',
    timestamps: true,
    underscored: true
})
export class Waybill extends Model<Waybill> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true
    })
    id: string;

    @Column({
        type: DataType.STRING,
        unique: true,
        allowNull: false
    })
    number: string;

    @ForeignKey(() => Driver)
    @Column({
        type: DataType.UUID,
        allowNull: false
    })
    driverId: string;

    //   @ForeignKey(() => Car)
    //   @Column({ 
    //     type: DataType.UUID, 
    //     allowNull: false 
    //   })
    //   carId: string;

    @Column({
        type: DataType.DATEONLY,
        allowNull: false
    })
    date: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    startTime: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    endTime: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    startMileage: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true
    })
    endMileage: number;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
        allowNull: false
    })
    medicalCheck: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false,
        allowNull: false
    })
    technicalCheck: boolean;

    @Column({
        type: DataType.ENUM(...Object.values(WaybillStatus)),
        defaultValue: WaybillStatus.ACTIVE,
        allowNull: false
    })
    status: WaybillStatus;

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;

    @BelongsTo(() => Driver)
    driver: Driver;

    //   @BelongsTo(() => Car)
    //   car: Car;
}