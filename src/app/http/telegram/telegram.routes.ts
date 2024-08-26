import { requestHandler, Router } from '@knittotextile/knitto-http';
import { telegramMe } from './telegram.controller';

const telegramRouter = Router();
telegramRouter.get('/telegram/me', requestHandler(telegramMe));
export default telegramRouter;
