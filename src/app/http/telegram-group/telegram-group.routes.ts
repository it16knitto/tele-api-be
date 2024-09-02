import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	telegramGroupAddUser,
	telegramGroupCreate,
	telegramGroupDelete,
	telegramGroupGet,
	telegramGroupGetChatHistory,
	telegramGroupGetMessages,
	telegramGroupListGroup,
	telegramGroupListMembers,
	telegramGroupRemoveUser,
	telegramGroupRename,
	telegramGroupSendMessage
} from './telegram-group.controller';

const telegramGroupRouter = Router();
telegramGroupRouter.get('/telegram/group', requestHandler(telegramGroupGet));
telegramGroupRouter.post(
	'/telegram/group',
	requestHandler(telegramGroupCreate)
);
telegramGroupRouter.get(
	'/telegram/group/:group_username/members',
	requestHandler(telegramGroupListMembers)
);
telegramGroupRouter.get(
	'/telegram/group/list',
	requestHandler(telegramGroupListGroup)
);
telegramGroupRouter.post(
	'/telegram/group/:group_id/add-user',
	requestHandler(telegramGroupAddUser)
);
telegramGroupRouter.post(
	'/telegram/group/:group_id/remove-user',
	requestHandler(telegramGroupRemoveUser)
);
telegramGroupRouter.post(
	'/telegram/group/:group_id/rename',
	requestHandler(telegramGroupRename)
);
telegramGroupRouter.delete(
	'/telegram/group/:group_id/delete',
	requestHandler(telegramGroupDelete)
);
telegramGroupRouter.get(
	'/telegram/group/:group_id/messages',
	requestHandler(telegramGroupGetMessages)
);
telegramGroupRouter.get(
	'/telegram/group/:group_id/chat-history',
	requestHandler(telegramGroupGetChatHistory)
);
telegramGroupRouter.post(
	'/telegram/group/:group_id/send-message',
	requestHandler(telegramGroupSendMessage)
);

export default telegramGroupRouter;
