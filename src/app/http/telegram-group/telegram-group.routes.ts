import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	telegramGroupGet,
	telegramGroupListMembers
} from './telegram-group.controller';

const telegramGroupRouter = Router();
telegramGroupRouter.get('/telegram/group', requestHandler(telegramGroupGet));
telegramGroupRouter.get(
	'/telegram/group/:group_username/members',
	requestHandler(telegramGroupListMembers)
);
export default telegramGroupRouter;
