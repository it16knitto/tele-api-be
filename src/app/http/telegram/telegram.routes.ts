import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
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
export default telegramRouter;
