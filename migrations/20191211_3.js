module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('Project', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT,
			},
			flId: {
				allowNull: false,
				unique: true,
				type: Sequelize.BIGINT,
			},
			link: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			date: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			text: {
				type: Sequelize.TEXT,
				allowNull: true,
				defaultValue: null,
			},
			price: {
				type: Sequelize.STRING,
				allowNull: true,
				defaultValue: null,
			},
			categoryId: {
				type: Sequelize.BIGINT,
				allowNull: true,
				onDelete: 'CASCADE',
				references: {
					model: 'Category',
					key: 'id',
				},
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Project', null, {}),
};
