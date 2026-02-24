import { Column, DataType, Model, Table, Unique, AllowNull, PrimaryKey, Default } from 'sequelize-typescript';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare username: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @AllowNull(false)
  @Default('User')
  @Column(DataType.ENUM('Admin', 'User'))
  declare role: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare refreshToken: string;
}