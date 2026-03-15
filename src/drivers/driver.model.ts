import { Column, DataType, Model, Table, HasMany, BeforeCreate, BeforeUpdate, Scopes, Index } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
// import { Waybill } from '../../waybills/models/waybill.model';

export enum DriverStatus {
    ACTIVE = 'Active',
    BLOCKED = 'Blocked',
    IN_VACATION = 'InVacation',
}

@Scopes(() => ({
    withoutPassword: {
        attributes: { exclude: ['password', 'refreshToken'] },
    },
}))
@Table({ tableName: 'drivers', timestamps: true })
export class Driver extends Model<Driver> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    firstName: string;

    @Column({ type: DataType.STRING, allowNull: false })
    lastName: string;

    @Index({ unique: true })
    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    })
    email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @Index({ unique: true })
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    phone: string;

    @Index({ unique: true })
    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    licenseNumber: string;

    @Column({ type: DataType.DATE, allowNull: false })
    licenseExpiry: Date;

    @Column({
        type: DataType.ENUM(...Object.values(DriverStatus)),
        defaultValue: DriverStatus.ACTIVE,
    })
    status: DriverStatus;

    @Column({ type: DataType.STRING, allowNull: true })
    refreshToken: string;


    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    resetPasswordToken: string;


    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    resetPasswordExpires: Date;


    // @HasMany(() => Waybill)
    // waybills: Waybill[];

}