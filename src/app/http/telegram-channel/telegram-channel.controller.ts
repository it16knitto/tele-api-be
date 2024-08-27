import { TRequestFunction } from '@knittotextile/knitto-http';
import telegramClient from '@root/services/telegram.service';
import { Api } from 'telegram';
export const telegramCreateChannel: TRequestFunction = async (req) => {
	const {
		title,
		about,
		address,
		isMegaGroup,
		forImport,
		lat_geo_point,
		long_geo_point
	} = req.body;
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const channel = await telegramClient.invoke(
		new Api.channels.CreateChannel({
			title,
			about,
			megagroup: isMegaGroup,
			forImport: forImport,
			geoPoint: new Api.InputGeoPoint({
				lat: lat_geo_point,
				long: long_geo_point,
				accuracyRadius: 43
			}),
			address
		})
	);
	return { result: channel };
};
export const telegramChannelGetChannels: TRequestFunction = async () => {
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}

	const channels = await telegramClient.invoke(
		new Api.channels.GetFullChannel({
			channel: 'testhellozzz'
		})
	);

	return { result: channels };
};
export const telegramChannelInviteToChannel: TRequestFunction = async (req) => {
	const { user_username } = req.body;
	const { channel_username } = req.params;
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const channel = await telegramClient.invoke(
		new Api.channels.InviteToChannel({
			channel: channel_username,
			users: [user_username]
		})
	);
	return { result: channel };
};
export const telegramChannelGetChannelMembers: TRequestFunction = async (
	req
) => {
	const { channel_username } = req.params;
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const result = await telegramClient.invoke(
		new Api.channels.GetParticipants({
			channel: channel_username,
			filter: new Api.ChannelParticipantsRecent(),
			offset: 0,
			limit: 100
		})
	);
	return { result };
};
export const telegramChannelGetMessages: TRequestFunction = async (req) => {
	const { channel_username } = req.params;
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const channel = await telegramClient.getEntity(channel_username);
	const messages = await telegramClient.getMessages(channel, {
		limit: 100
	});

	return { result: messages };
};
export const telegramChannelSendMessages: TRequestFunction = async (req) => {
	const { channel_username } = req.params;
	const { message } = req.body;
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const channel = await telegramClient.getEntity(channel_username);
	await telegramClient.sendMessage(channel, { message });
	return { result: null, message: 'Message sent' };
};
