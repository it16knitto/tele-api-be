import envRequest from './env.request';
import {
	Router,
	requestHandler,
	requestValidator
} from '@knittotextile/knitto-http';
import { envFind } from './env.controller';
import authorizeMiddlware from '../middlewares/authorization';

const router = Router();
/**
 * GET /env
 * @tags Env
 * @summary get env
 * @security BearerAuth
 * @param {string} search.query - string
 * @param {number} perPage.query.required - number
 * @param {number} page.query.required - number
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "result": {
 *   }
 * }
 */
router.get(
	'/env',
	requestValidator({
		requestType: 'query',
		type: envRequest.getEnvValidation
	}),
	authorizeMiddlware,
	requestHandler(envFind)
);

export default router;
