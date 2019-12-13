import {
	Column,
	Model,
	Table,
	DataType,
	AllowNull,
	Default,
	Unique,
	ForeignKey,
	BelongsTo,
} from 'sequelize-typescript';
import Category from './Category';

@Table({ tableName: 'Project' })
export default class Project extends Model<Project> {
	@Unique
	@AllowNull(false)
	@Column({ type: DataType.STRING })
	flId: string;

	@AllowNull(false)
	@Column({ type: DataType.STRING })
	link: string;

	@AllowNull(false)
	@Column({ type: DataType.STRING })
	title: string;

	@AllowNull(false)
	@Column({ type: DataType.DATE })
	date: Date;

	@AllowNull(true)
	@Default(null)
	@Column({ type: DataType.TEXT })
	text: string | null;

	@AllowNull(true)
	@Default(null)
	@Column({ type: DataType.TEXT })
	price: string | null;

	@ForeignKey(() => Category)
	@Column({ type: DataType.BIGINT })
	categoryId: number;

	@BelongsTo(() => Category)
	category: Category;
}
