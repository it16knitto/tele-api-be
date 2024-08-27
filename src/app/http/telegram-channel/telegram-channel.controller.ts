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

export const telegramChannelSendMedia: TRequestFunction = async (req: any) => {
	const { channel_username } = req.params;
	const { message } = req.body;
	const filePath: any = req.file.path;

	const channel = await telegramClient.getEntity(channel_username);
	await telegramClient.sendFile(channel, {
		file: filePath,
		caption: message ?? null
	});
};

export const telegramChannelBanUser: TRequestFunction = async (req) => {
	const { channel_username } = req.params;
	const { user_username } = req.body;

	const channel = await telegramClient.getEntity(channel_username);
	const user = await telegramClient.getEntity(user_username);

	await telegramClient.invoke(
		new Api.channels.EditBanned({
			channel: channel,
			participant: user,
			bannedRights: new Api.ChatBannedRights({
				untilDate: 0, // 0 means the user is banned forever; you can set a specific timestamp to unban them automatically
				viewMessages: true
			})
		})
	);
	return { result: null, message: 'User banned' };
};
export const telegramChannelUnbanUser: TRequestFunction = async (req) => {
	const { channel_username } = req.params;
	const { user_username } = req.body;

	const channel = await telegramClient.getEntity(channel_username);
	const user = await telegramClient.getEntity(user_username);

	await telegramClient.invoke(
		new Api.channels.EditBanned({
			channel: channel,
			participant: user,
			bannedRights: new Api.ChatBannedRights({
				untilDate: 0, // Set untilDate to 0 to lift the ban
				viewMessages: false, // Set viewMessages to false to lift the ban
				sendMessages: false,
				sendMedia: false,
				sendStickers: false,
				sendGifs: false,
				sendGames: false,
				sendInline: false,
				embedLinks: false
			})
		})
	);
	return { result: null, message: 'User unbanned' };
};
