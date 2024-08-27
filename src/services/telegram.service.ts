import { telegramConfig } from '@root/libs/config';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';

const stringSession = new StringSession(telegramConfig.SESSION_STRING || '');
// fill this later with the value from client.session.save()

// Initialize the Telegram client
const telegramClient = new TelegramClient(
	stringSession,
	Number(telegramConfig.API_ID),
	telegramConfig.API_HASH,
	{
		connectionRetries: 5
	}
);
export default telegramClient;
