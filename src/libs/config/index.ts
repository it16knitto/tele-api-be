import dotenv from 'dotenv';
import packageJson from '../../../package.json';

dotenv.config();

export const APP_NAME = packageJson.name || 'knitto-rest';
export const APP_VERSION = packageJson.version || '0.0.0';

export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const APP_SECRET_KEY = process.env.APP_SECRET_KEY || 'secret';
export const APP_PORT_HTTP = String(process.env.APP_PORT_HTTP) || '8000';
export const APP_EXPOSE_DOCS = Boolean(process.env.APP_EXPOSE_DOCS) || true;

export const mysqlConfig = {
	HOST: process.env.DB_HOST_MYSQL || 'localhost',
	NAME: process.env.DB_NAME_MYSQL || 'db',
	USER: process.env.DB_USER_MYSQL || 'root',
	PORT: process.env.DB_PORT_MYSQL || 3306,
	PASSWORD: process.env.DB_PASS_MYSQL || ''
};

export const rabbitMQConfig = {
	URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
	EXCHANGE: process.env.RABBITMQ_EXCHANGE || 'noExchange'
};

export const telegramConfig = {
	API_ID: process.env.TELEGRAM_API_ID,
	API_HASH: process.env.TELEGRAM_API_HASH,
	APP_TITLE: process.env.TELEGRAM_APP_TITLE,
	APP_SHORT_NAME: process.env.TELEGRAM_APP_SHORT_NAME,
	PHONE_NUMBER: process.env.TELEGRAM_PHONE_NUMBER,
	PASSWORD: process.env.TELEGRAM_PASSWORD,
	PHONE_CODE: process.env.TELEGRAM_PHONE_CODE
};
