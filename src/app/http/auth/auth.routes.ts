import {
	Router,
	requestHandler,
	requestValidator
} from '@knittotextile/knitto-http';
import { authLogin, authMe } from './auth.controller';
import authRequest from './auth.request';
import authorizeMiddlware from '../middlewares/authorization';
const defaultRouter = Router();
/**
 * POST /auth/login
 * @tags Auth
 * @summary Login
 * @typedef {object} Login
 * @property {string} username.required - The username
 * @property {string} password.required - The password
 * @param {Login} request.body.required - login request
 * @return {object} 200 - success
 * @return {object} 400 - bad request
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "result": {
 *     "token": "token"
 *   }
 * }
 * @example response - 400 - bad request
 * {
 *   "message": "Username dan Password harus berupa string",
 *   "result": null
 * }
 */
defaultRouter.post(
	'/auth/login',
	requestValidator({
		requestType: 'body',
		type: authRequest.loginValidation
	}),
	requestHandler(authLogin)
);

/**
 * GET /auth/me
 * @tags Auth
 * @summary Get current user information
 * @security BearerAuth
 * @return {object} 200 - success
 * @return {object} 401 - unauthorized
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "result": {
 *     "id": 1,
 *     "username": "johndoe"
 *   }
 * }
 * @example response - 403 - unauthorized
 * {
 *   "message": "Authentication required.",
 *   "result": null
 * }
 */
defaultRouter.get('/auth/me', authorizeMiddlware, requestHandler(authMe));

export default defaultRouter;
