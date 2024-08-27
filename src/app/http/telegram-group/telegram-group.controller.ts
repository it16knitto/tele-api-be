import { TRequestFunction } from '@knittotextile/knitto-http';
import telegramClient from '@root/services/telegram.service';
import { Api } from 'telegram';

export const telegramGroupGet: TRequestFunction = async () => {
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const result = await telegramClient.invoke(
		new Api.messages.GetDialogs({
			offsetDate: 0,
			offsetId: 0,
			offsetPeer: new Api.InputPeerEmpty(),
			limit: 100
		})
	);

	const groups: any[] = (result as Api.messages.DialogsSlice).chats.filter(
		(chat) => chat instanceof Api.Channel && chat.megagroup
	);

	const groupList = groups.map((group) => ({
		id: group.id,
		title: group.title,
		username: group.username || null,
		membersCount: group.participantsCount || null
	}));

	return { result: groupList };
};

export const telegramGroupListMembers: TRequestFunction = async (req) => {
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}

	const { group_username } = req.params;
	const { search } = req.query;
	const group = await telegramClient.getEntity(group_username);

	if (!group) {
		throw new Error('Group not found');
	}

	const participants: any = await telegramClient.invoke(
		new Api.channels.GetParticipants({
			channel: group,
			filter: new Api.ChannelParticipantsSearch({
				q: (search as string) ?? ''
			}),
			offset: 0,
			limit: 100
		})
	);
	const memberList = participants.users.map((user) => ({
		id: user.id,
		username: user.username,
		firstName: user.firstName,
		lastName: user.lastName,
		bot: user.bot,
		restricted: user.restricted,
		verified: user.verified,
		phone: user.phone
	}));
	return { result: { total: participants.count, data: memberList } };
};
