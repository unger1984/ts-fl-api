import dotenv from 'dotenv';

dotenv.config();

type ConfigDBOptions = {
	dialect: 'postgres' | 'mysql' | 'sqlite' | 'mariadb' | 'mssql' | undefined;
	host: string;
	port: number;
	logging: boolean | ((sql: string) => void);
	dialectOptions: {
		useUTC: boolean;
	};
	timezone: string;
};

type ConfigInterface = {
	SSL_SERVER_KEY: string;
	SSL_SERVER_CRT: string;
	HTTP_SERVER_HOST: string;
	HTTP_SERVER_PORT: string;
	ENV: 'development' | 'production';
	db: {
		username: string;
		password: string;
		database: string;
		options: ConfigDBOptions;
	};
};

const config: ConfigInterface = {
	SSL_SERVER_KEY: '',
	SSL_SERVER_CRT: '',
	HTTP_SERVER_HOST: '',
	HTTP_SERVER_PORT: '',
	ENV: 'development',
	...process.env,
	db: {
		username: process.env.DB_USER!,
		password: process.env.DB_PASS!,
		database: process.env.DB_BASE!,
		options: {
			dialect: 'postgres',
			host: process.env.DB_HOST!,
			port: parseInt(process.env.DB_PORT!),
			logging: process.env.ENV !== 'production',
			dialectOptions: {
				useUTC: false, // for reading from database
			},
			timezone: '+03:00',
		},
	},
};

export default config;
