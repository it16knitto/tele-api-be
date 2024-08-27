import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	telegramGetEntity,
	telegramGetUser,
	telegramMe,
	telegramSendCode,
	telegramVerifyCode
} from './telegram.controller';

const telegramRouter = Router();
telegramRouter.post('/telegram/send-code', requestHandler(telegramSendCode));
telegramRouter.post(
	'/telegram/verify-code',
	requestHandler(telegramVerifyCode)
);
telegramRouter.get('/telegram/me', requestHandler(telegramMe));
telegramRouter.get(
	'/telegram/get-entity/:username',
	requestHandler(telegramGetEntity)
);
telegramRouter.get(
	'/telegram/get-user/:username',
	requestHandler(telegramGetUser)
);
export default telegramRouter;
