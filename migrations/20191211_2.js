module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('Category', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT,
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			parentId: {
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
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('Category', null, {}),
};
