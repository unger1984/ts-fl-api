import { Sequelize } from 'sequelize-typescript';
import { Op, fn } from 'sequelize';
// import { basename, join } from 'path';
// import { readdirSync } from 'fs';

import config from '../config';
import logger from '../logger';
import User from './User';
import Category from './Category';
import Project from './Project';

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
	...config.db.options,
	logging: sql => logger.debug(sql),
});

// const currentFieName = basename(__filename);
// const models = readdirSync(__dirname).filter(file => {
// 	return file.indexOf('.') !== 0 && file !== currentFieName && file.slice(-3) === '.ts';
// });
//
// sequelize.addModels(models.map(model => join(__dirname, model)));
sequelize.addModels([User, Category, Project]);

const op = Op;

export { sequelize, op, fn, User, Category, Project };
