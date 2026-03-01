import { Column, DataType, Model, Table, PrimaryKey, Default, Unique } from 'sequelize-typescript';
import { Role } from '../common/enums/role.enum';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.CHAR(36))
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare username: string;

  @Unique
  @Column({ type: DataType.STRING, allowNull: false })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    defaultValue: Role.USER,
  })
  declare role: Role;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare refreshToken: string;
}