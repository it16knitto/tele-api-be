import { TRequestFunction } from '@knittotextile/knitto-http';
import { telegramClient } from '@root/index';
import { Api } from 'telegram';

export const telegramMe: TRequestFunction = async () => {
	await telegramClient.connect(); // This assumes you have already authenticated with .start()

	const result = await telegramClient.invoke(
		new Api.users.GetUsers({
			id: ['username']
		})
	);
	return { result: result };
};
