import config from './config';
import logger from './logger';
import App from './app';
import migrate from './migrate';

const app = new App();

migrate().then(() => {
	app.listen(config.HTTP_SERVER_PORT, config.HTTP_SERVER_HOST, (err?: Error) => {
		if (err) {
			throw err;
		}
		logger.info(`API Server started success https://${config.HTTP_SERVER_HOST}:${config.HTTP_SERVER_PORT}`);
	});
});
