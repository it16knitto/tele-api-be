const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

require('dotenv').config();
const apiId = process.env.TELEGRAM_API_ID;
const apiHash = process.env.TELEGRAM_API_HASH;
const stringSession = new StringSession(''); // fill this later with the value from session.save()

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

(async () => {
	// console.log('Loading interactive example...');
	const client = new TelegramClient(stringSession, apiId, apiHash, {
		connectionRetries: 5
	});
	await client.start({
		phoneNumber: async () =>
			new Promise((resolve) =>
				rl.question('Please enter your number: ', resolve)
			),
		password: async () =>
			new Promise((resolve) =>
				rl.question('Please enter your password: ', resolve)
			),
		phoneCode: async () =>
			new Promise((resolve) =>
				rl.question('Please enter the code you received: ', resolve)
			)
		// onError: (err) => console.log(err)
	});
	// console.log('You should now be connected.');
	// console.log(client.session.save()); // Save this string to avoid logging in again

	const result = await client.invoke(
		new Api.auth.ExportLoginToken({
			apiId,
			apiHash,
			exceptIds: [BigInt('-4156887774564')]
		})
	);
})();
