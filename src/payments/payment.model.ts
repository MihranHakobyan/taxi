import { Column, DataType, Model, Table, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Waybill } from '../waybills/waybill.model';

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCEEDED = 'succeeded',
    CANCELED = 'canceled',
    WAITING_FOR_CAPTURE = 'waiting_for_capture',
}

interface PaymentCreationAttrs {
    externalId: string;
    amount: number;
    waybillId: string;
    status: PaymentStatus;
    rawResponse: any;
}

@Table({ tableName: 'payments', underscored: true })
export class Payment extends Model<Payment, PaymentCreationAttrs> {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id: string;

    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    externalId: string;

    @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
    amount: number;

    @Column({
        type: DataType.ENUM(...Object.values(PaymentStatus)),
        defaultValue: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    @Column({ type: DataType.JSON, allowNull: true })
    rawResponse: any;

    @ForeignKey(() => Waybill)
    @Column({ type: DataType.UUID, allowNull: false })
    waybillId: string;

    @BelongsTo(() => Waybill)
    waybill: Waybill;
}