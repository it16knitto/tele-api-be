import cabangRequest from './cabang.request';
import {
	Router,
	requestHandler,
	requestValidator
} from '@knittotextile/knitto-http';
import { cabangFind } from './cabang.controller';
import authorizeMiddlware from '../middlewares/authorization';

const router = Router();
/**
 * GET /cabang
 * @tags Cabang
 * @summary get cabang
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
	'/cabang',
	requestValidator({
		requestType: 'query',
		type: cabangRequest.getCabangValidation
	}),
	authorizeMiddlware,
	requestHandler(cabangFind)
);

export default router;
