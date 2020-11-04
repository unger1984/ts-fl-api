import { Sequelize } from 'sequelize-typescript';
import { Op, fn } from 'sequelize';
import { resolve } from 'path';

import config from './config';
import logger from './logger';

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
	...config.db.options,
	logging: config.db.options.logging ? sql => logger.debug(sql) : false,
	models: [resolve(__dirname, 'models')],
});

const op = Op;

export { sequelize, op, fn };
export default sequelize;
