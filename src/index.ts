import './libs/helpers/initModuleAlias';
import { dump } from '@knittotextile/knitto-core-backend';
import httpServer from '@http/index';

(async () => {
	try {
		// await mysqlConnection.init();
		// await rabbitConnection.init();
		// console.log(telegramClient.session.save());
		// start application
		await httpServer();
		// await messageBroker();
	} catch (error) {
		dump(error);
		process.exit(1);
	}
})();
