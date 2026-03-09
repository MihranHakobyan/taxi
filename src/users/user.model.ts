import { Column, DataType, Model, Table, Index } from 'sequelize-typescript';
import { Role } from '../common/enums/role.enum';

@Table({ tableName: 'users', timestamps: true, paranoid: true })
export class User extends Model {
    @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
    id: string;

    @Column({ type: DataType.STRING, allowNull: false })
    username: string;

    @Index({ unique: true })
    @Column({ type: DataType.STRING, allowNull: false, unique: true, validate: { isEmail: true } })
    email: string;

    @Column({ type: DataType.STRING, allowNull: false })
    password: string;

    @Column({ type: DataType.ENUM(Role.ADMIN, Role.USER), defaultValue: Role.USER })
    role: Role;

    @Column({ type: DataType.STRING, allowNull: true })
    refreshToken: string;

    @Column({ type: DataType.BOOLEAN, defaultValue: true })
    isActive: boolean;
}