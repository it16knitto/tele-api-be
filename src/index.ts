import './libs/helpers/initModuleAlias';
import { dump } from '@knittotextile/knitto-core-backend';
import httpServer from '@http/index';
import telegramClient from './services/telegram.service';

(async () => {
	try {
		// await mysqlConnection.init();
		// await rabbitConnection.init();
		// console.log(telegramClient.session.save());
		// start application
		if (!telegramClient.connected) {
			await telegramClient.connect();
		}
		await httpServer();
		// await messageBroker();
	} catch (error) {
		dump(error);
		process.exit(1);
	}
})();
