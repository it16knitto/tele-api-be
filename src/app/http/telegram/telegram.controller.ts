import { TRequestFunction } from '@knittotextile/knitto-http';
import { telegramConfig } from '@root/libs/config';
import telegramClient from '@root/services/telegram.service';
import { Api } from 'telegram';

export const telegramSendCode: TRequestFunction = async (req) => {
	const { phone } = req.body;
	await telegramClient.connect();
	const result = await telegramClient.invoke(
		new Api.auth.SendCode({
			phoneNumber: phone,
			apiId: Number(telegramConfig.API_ID),
			apiHash: telegramConfig.API_HASH,
			settings: new Api.CodeSettings({
				allowFlashcall: true,
				currentNumber: true,
				allowAppHash: true,
				allowMissedCall: true
			})
		})
	);
	return { result };
};
export const telegramVerifyCode: TRequestFunction = async (req) => {
	const { phone, code, phoneCodeHash } = req.body;
	await telegramClient.connect();
	const result = await telegramClient.invoke(
		new Api.auth.SignIn({
			phoneNumber: phone,
			phoneCode: code,
			phoneCodeHash
		})
	);
	const sessionString = telegramClient.session.save();
	return {
		result: {
			sessionString,
			user: result
		}
	};
};
export const telegramMe: TRequestFunction = async () => {
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}

	const me = await telegramClient.getMe();
	return { result: me };
};
