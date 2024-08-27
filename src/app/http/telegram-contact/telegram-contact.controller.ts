import { TRequestFunction } from '@knittotextile/knitto-http';
import telegramClient from '@root/services/telegram.service';
import { Api } from 'telegram';

export const telegramContactGet: TRequestFunction = async (req) => {
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const { search } = req.query;
	const contact: any = await telegramClient.invoke(
		new Api.contacts.Search({
			q: (search as string) ?? '',
			limit: 100
		})
	);
	const users = contact.users.map((user) => ({
		id: user.id,
		username: user.username,
		firstName: user.firstName,
		lastName: user.lastName,
		bot: user.bot,
		restricted: user.restricted,
		verified: user.verified,
		phone: user.phone
	}));
	return { result: { count: contact.savedCount, data: users } };
};
