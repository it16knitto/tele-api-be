import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	telegramChannelGetChannels,
	telegramCreateChannel,
	telegramChannelInviteToChannel,
	telegramChannelGetChannelMembers,
	telegramChannelGetMessages,
	telegramChannelSendMessages
} from './telegram-channel.controller';

const telegramChannelRouter = Router();
telegramChannelRouter.post(
	'/telegram/channel',
	requestHandler(telegramCreateChannel)
);
telegramChannelRouter.get(
	'/telegram/channel',
	requestHandler(telegramChannelGetChannels)
);
telegramChannelRouter.post(
	'/telegram/channel/:channel_username/invite',
	requestHandler(telegramChannelInviteToChannel)
);
telegramChannelRouter.get(
	'/telegram/channel/:channel_username/members',
	requestHandler(telegramChannelGetChannelMembers)
);
telegramChannelRouter.get(
	'/telegram/channel/:channel_username/messages',
	requestHandler(telegramChannelGetMessages)
);
telegramChannelRouter.post(
	'/telegram/channel/:channel_username/send-message',
	requestHandler(telegramChannelSendMessages)
);
export default telegramChannelRouter;
