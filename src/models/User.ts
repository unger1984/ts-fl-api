import { Column, Model, Table, DataType, AllowNull, PrimaryKey, Default } from 'sequelize-typescript';
import uuid from 'uuid/v4';

@Table({ tableName: 'User' })
export default class User extends Model<User> {
	@AllowNull(false)
	@PrimaryKey
	@Default(() => uuid())
	@Column({ type: DataType.UUID })
	uid: string;

	@AllowNull(false)
	@Column({ type: DataType.STRING })
	platform: string;

	@AllowNull(false)
	@Column({ type: DataType.STRING(50) })
	version: string;

	@AllowNull(false)
	@Column({ type: DataType.DATE })
	lastseen: Date;
}
