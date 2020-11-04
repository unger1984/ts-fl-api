import Umzug from 'umzug';
import { sequelize } from './sequelize';

const umzug = new Umzug({
	storage: 'sequelize',
	storageOptions: {
		sequelize: sequelize,
	},
	migrations: {
		params: [
			sequelize.getQueryInterface(), // queryInterface
			sequelize.constructor,
			() => {
				throw new Error(
					'Migration tried to use old style "done" callback. Please upgrade to "umzug" and return a promise instead.',
				);
			},
		],
	},
});

export default () =>
	new Promise((response, reject) => {
		umzug
			.up()
			.then(migrations => {
				migrations.map(mig => {
					// eslint-disable-next-line no-console
					console.log(`Migrate ${mig.file}`);
				});
			})
			.then(() => response())
			.catch(exc => reject(exc));
	});
