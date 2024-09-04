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
export const telegramGroupListGroup: TRequestFunction = async () => {
	const dialogs = await telegramClient.getDialogs();

	const arrResult = [];

	for (const dialog of dialogs) {
		const { entity, message, date } = dialog;
		if (entity.className === 'Channel' && entity.megagroup) {
			// Check if it's a group (supergroup)
			arrResult.push({
				id: dialog.id,
				title: entity.title,
				username: entity.username,
				membersCount: entity.participantsCount,
				type: 'supergroup',
				photo: entity.photo, // Add photo
				lastMessage: message?.message, // Add last message
				timestamp: date // Add timestamp
			});
		} else if (entity.className === 'Chat') {
			// Regular group chats
			arrResult.push({
				id: dialog.id,
				title: entity.title,
				username: null,
				membersCount: entity.participantsCount,
				type: 'group',
				photo: entity.photo, // Add photo
				lastMessage: message?.message, // Add last message
				timestamp: date // Add timestamp
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
export const telegramGroupRename: TRequestFunction = async (req) => {
	const { group_id } = req.params;
	const { new_name } = req.body;
	const result = await telegramClient.invoke(
		new Api.messages.EditChatTitle({
			chatId: BigInteger(group_id), // The ID of the group chat to rename
			title: new_name // The new title for the group
		})
	);
	return { result };
};
export const telegramGroupDelete: TRequestFunction = async (req) => {
	const { group_id } = req.params;
	const result = await telegramClient.invoke(
		new Api.messages.DeleteChat({
			chatId: BigInteger(group_id)
		})
	);
	return { result };
};
export const telegramGroupGetMessages: TRequestFunction = async (req) => {
	const { group_id } = req.params;
	const peerID = await telegramClient.getEntity(BigInteger(group_id));

	// const groupEntity = await telegramClient.getEntity(peerID);
	// console.log(groupEntity);

	// const result: any = await telegramClient.invoke(
	// 	new Api.messages.GetHistory({
	// 		peer: group_id, // The ID of the group to fetch messages from
	// 		limit: 10 // The number of messages to fetch
	// 	})
	// );
	const result = await telegramClient.getMessages(peerID, { limit: 10 });

	const me = await telegramClient.getMe();

	const simplifiedMessages = result.map((msg: any) => ({
		name: msg.sender.username,
		message: msg.message,
		photo: msg.media ? msg.media.photo : null,
		media: msg.media,
		date: msg.date,
		isMeSend: BigInteger(msg.fromId.userId).equals(BigInteger(me.id))
	}));
	// Fetch user or chat information

	return { result: simplifiedMessages };
};
export const telegramGroupGetChatHistory: TRequestFunction = async (req) => {
	const { group_id } = req.params;
	const groupEntity = await telegramClient.getEntity(BigInteger(group_id));

	// Fetch messages
	const result: any = await telegramClient.invoke(
		new Api.messages.GetHistory({
			peer: groupEntity, // Use the resolved entity
			limit: 10 // The number of messages to fetch
		})
	);

	const messagesWithPhotos = [];

	for (const message of result.messages) {
		let senderName = 'Unknown';
		let messageContent = message.message || 'No message content';

		// Get sender details if it's a user
		if (message.fromId && message.fromId instanceof Api.PeerUser) {
			const user: any = await telegramClient.invoke(
				new Api.users.GetFullUser({
					id: message.fromId.userId
				})
			);
			if (user) {
				senderName = user.users[0].firstName + ' ' + user.users[0].lastName;
			}
		}

		// Handle messages with photos
		if (message.media && message.media instanceof Api.MessageMediaPhoto) {
			const photo = message.media.photo;

			// Download photo
			// const filePath = `./photo_${message.id}.jpg`;
			// await telegramClient.downloadMedia(photo, { file: filePath });
			// console.log(`Photo saved to ${filePath}`);

			// Convert photo to Base64

			// Store message info including the photo in Base64 format
			messagesWithPhotos.push({
				date: message.date,
				sender: senderName,
				content: messageContent,
				photo: photo
				// photoBase64: photoBase64 // Add Base64-encoded photo
			});

			// Optionally, delete the file after converting to Base64
			// fs.unlinkSync(filePath);
		} else {
			messagesWithPhotos.push({
				date: message.date,
				sender: senderName,
				content: messageContent,
				photo: null
				// photoBase64: null // No photo attached
			});
		}
	}
	return { result: messagesWithPhotos };
};
export const telegramGroupSendMessage: TRequestFunction = async (req) => {
	const { group_id } = req.params;
	const { message } = req.body;
	const groupEntity = await telegramClient.getEntity(BigInteger(group_id));
	const result = await telegramClient.invoke(
		new Api.messages.SendMessage({
			peer: groupEntity,
			message: message
		})
	);
	return { result };
};
export const telegramGroupListUser: TRequestFunction = async (req) => {
	const { group_id } = req.params;
	// const result = await telegramClient.invoke(
	// 	new Api.messages.part({
	// 		chatId: group_id,
	// 		filter: new Api.ChannelParticipantsRecent(),
	// 		offset: 0,
	// 		limit: 100
	// 	})
	// );
	const groupEntity = await telegramClient.getEntity(BigInteger(group_id));
	const participants = telegramClient.iterParticipants(groupEntity);
	const result: any[] = [];
	for await (const participant of participants) {
		//console.log("participant is", participant); // this line is very verbose but helpful for debugging
		result.push({ id: participant.id, username: participant.username });
	}
	return { result };
};
