import http from 'http';
import https from 'https';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import Koa from 'koa';
import cors from '@koa/cors';
import uuid from 'uuid/v4';

import config from './config';
import logger from './logger';
import api from './routes';

const ssl = {
	key: readFileSync(resolve(__dirname, '../', config.SSL_SERVER_KEY)),
	cert: readFileSync(resolve(__dirname, '../', config.SSL_SERVER_CRT)),
};

export default class App extends Koa {
	private server: null | http.Server;

	constructor() {
		super();
		this.proxy = true;

		this.configureMiddleWares();
		this.configureRoutes();
	}

	private configureMiddleWares() {
		// Graceful shutdown
		// this.use(shutdown(this.server, { logger }));
		// Подключаем CORS
		this.use(cors({ origin: '*' }));
		// Подключаем логгер
		this.use(async (ctx, next) => {
			ctx.requestId = uuid();
			await next();
		});
		this.use(async (ctx, next) => {
			const start = new Date().getTime();
			ctx.logger = logger;
			await next();
			const ms = new Date().getTime() - start;
			logger.info(ctx.requestId, ctx.method, ctx.url, `${ms}ms`);
		});
		// Обработчик ошибок
		// this.koa.use(middlewareErrorHandler);
	}

	private configureRoutes() {
		this.use(api.routes());
		this.use(api.allowedMethods({ throw: true }));
		// Статика для локалки
		if (config.ENV === 'development') {
			// this.use(mount('/upload', stat(config.UPLOAD_PATH)));
		}
	}

	listen(...args: any[]) {
		const httpServer = () =>
			config.ENV === 'development'
				? https.createServer(ssl, this.callback())
				: http.createServer(this.callback());

		const server = httpServer().listen(...args);
		server.on('connection', socket => {
			socket.setNoDelay(); // Отключаем алгоритм Нагла.
		});
		this.server = server;
		return server;
	}
}
