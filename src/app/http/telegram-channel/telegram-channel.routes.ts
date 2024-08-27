import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	telegramChannelGetChannels,
	telegramCreateChannel,
	telegramChannelInviteToChannel,
	telegramChannelGetChannelMembers,
	telegramChannelGetMessages,
	telegramChannelSendMessages,
	telegramChannelSendMedia,
	telegramChannelBanUser,
	telegramChannelUnbanUser
} from './telegram-channel.controller';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
	destination: function (_, __, cb) {
		cb(null, 'uploads/');
	},
	filename: function (_, file, cb) {
		const uniqueSuffix =
			Date.now() + '-' + crypto.randomBytes(4).toString('hex');
		cb(
			null,
			file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
		);
	}
});
const upload = multer({ storage });

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
telegramChannelRouter.post(
	'/telegram/channel/:channel_username/send-media',
	upload.single('file'),
	requestHandler(telegramChannelSendMedia)
);
telegramChannelRouter.post(
	'/telegram/channel/:channel_username/ban-user',
	requestHandler(telegramChannelBanUser)
);
telegramChannelRouter.post(
	'/telegram/channel/:channel_username/unban-user',
	requestHandler(telegramChannelUnbanUser)
);

export default telegramChannelRouter;
