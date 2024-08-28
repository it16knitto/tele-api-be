import { NotFoundException } from '@knittotextile/knitto-core-backend/dist/CoreException';
import { TRequestFunction } from '@knittotextile/knitto-http';
import telegramClient from '@root/services/telegram.service';
import { Api } from 'telegram';
import BigInteger from 'big-integer';

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

export const telegramGroupCreate: TRequestFunction = async (req) => {
	const { username_users, group_name } = req.body;
	if (!telegramClient.connected) {
		await telegramClient.connect();
	}
	const result = await telegramClient.invoke(
		new Api.messages.CreateChat({
			users: username_users, // Array of user IDs or usernames to add to the group
			title: group_name // Name of the new group
		})
	);
	return { result };
};
export const telegramGroupAddUser: TRequestFunction = async (req) => {
	const { username_user } = req.body;
	const { group_id } = req.params;

	const userEntity = await telegramClient.getInputEntity(username_user);
	const result = await telegramClient.invoke(
		new Api.messages.AddChatUser({
			chatId: BigInteger(group_id),
			userId: userEntity,
			fwdLimit: 100
		})
	);
	return { result };
};
export const telegramGroupListGroup: TRequestFunction = async (req) => {
	const dialogs = await telegramClient.getDialogs();

	const arrResult = [];

	for (const dialog of dialogs) {
		const { entity } = dialog;
		if (entity.className === 'Channel' && entity.megagroup) {
			// Check if it's a group (supergroup)
			arrResult.push({
				id: entity.id,
				title: entity.title,
				username: entity.username,
				membersCount: entity.participantsCount,
				type: 'supergroup'
			});
		} else if (entity.className === 'Chat') {
			// Regular group chats
			arrResult.push({
				id: entity.id,
				title: entity.title,
				username: null,
				membersCount: entity.participantsCount,
				type: 'group'
			});
		}
	}
	return { result: arrResult };
};
export const telegramGroupRemoveUser: TRequestFunction = async (req) => {
	const { username_user } = req.body;
	const { group_id } = req.params;

	const userEntity = await telegramClient.getInputEntity(username_user);
	const result = await telegramClient.invoke(
		new Api.messages.DeleteChatUser({
			chatId: BigInteger(group_id),
			userId: userEntity
		})
	);
	return { result };
};
// export const telegramGroupDelete: TRequestFunction = async (req) => {
// 	const { group_username } = req.params;
// 	const group = await telegramClient.getEntity(group_username);
// 	if (!group) {
// 		throw new Error('Group not found');
// 	}

// };
