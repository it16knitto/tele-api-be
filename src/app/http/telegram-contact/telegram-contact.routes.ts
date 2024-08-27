import { requestHandler, Router } from '@knittotextile/knitto-http';
import { telegramContactGet } from './telegram-contact.controller';

const telegramContactRouter = Router();
telegramContactRouter.get(
	'/telegram/contact',
	requestHandler(telegramContactGet)
);

export default telegramContactRouter;
