import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	telegramGroupAddUser,
	telegramGroupCreate,
	telegramGroupGet,
	telegramGroupListGroup,
	telegramGroupListMembers,
	telegramGroupRemoveUser
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
export default telegramGroupRouter;
