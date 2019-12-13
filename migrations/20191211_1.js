// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuid = require('uuid/v4');

module.exports = {
	up: (queryInterface, Sequelize) => {
		return queryInterface.createTable('User', {
			uid: {
				allowNull: false,
				defaultValue: () => uuid(),
				primaryKey: true,
				type: Sequelize.UUID,
			},
			platform: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			version: {
				type: Sequelize.STRING,
				allowNull: true,
				defaultValue: null,
			},
			lastseen: {
				type: Sequelize.DATE,
				allowNull: false,
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
	down: (queryInterface, Sequelize) => queryInterface.bulkDelete('User', null, {}),
};
