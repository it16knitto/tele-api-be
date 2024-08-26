import './libs/helpers/initModuleAlias';
import { dump } from '@knittotextile/knitto-core-backend';
import httpServer from '@http/index';
// import messageBroker from '@root/app/messageBroker';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { telegramConfig } from './libs/config';
// import readline from 'readline';
// import rabbitConnection from './libs/config/rabbitConnection';

const apiId = +telegramConfig.API_ID;
const apiHash = telegramConfig.API_HASH;
const stringSession = new StringSession('');

export const telegramClient = new TelegramClient(
	stringSession,
	apiId,
	apiHash,
	{
		connectionRetries: 5
	}
);
// const rl = readline.createInterface({
// 	input: process.stdin,
// 	output: process.stdout
// });
(async () => {
	try {
		// await telegramClient.start({
		// 	phoneNumber: async () =>
		// 		new Promise((resolve) =>
		// 			rl.question('Please enter your number: ', resolve)
		// 		),
		// 	password: async () =>
		// 		new Promise((resolve) =>
		// 			rl.question('Please enter your password: ', resolve)
		// 		),
		// 	phoneCode: async () =>
		// 		new Promise((resolve) =>
		// 			rl.question('Please enter the code you received: ', resolve)
		// 		),
		// 	onError: (err) => console.log(err)
		// });
		// start infrastructure
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
