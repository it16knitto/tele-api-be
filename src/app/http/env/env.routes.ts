import envRequest from './env.request';
import {
	Router,
	requestHandler,
	requestValidator
} from '@knittotextile/knitto-http';
import { envFind, envFindComboBox } from './env.controller';
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
  "message": "Success",
  "result": {
    "data": [
      {
        "id": 2,
        "create_date": "2024-05-28T09:17:38.000Z",
        "catatan_env": "host mysql",
        "nama_env": "DB_HOST_MYSQL",
        "value_env": "192.168.20.25",
        "nama_cabang": "holis",
        "nama_variabel": "dbHost",
        "script": null
      }
    ],
    "paginate": {
      "page": 1,
      "perPage": 10,
      "totalItem": 36,
      "totalPage": 4
    }
  }
}
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

/**
 * GET /env/combo-box
 * @tags Env
 * @summary combo box pilih env
 * @security BearerAuth
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": [
      {
        "id": 1,
        "create_date": "1970-01-01T00:00:00.000Z",
        "catatan_env": "string",
        "nama_env": "string",
        "value_env": "string",
        "nama_cabang": "string",
        "nama_variabel": "string",
        "script": "string"
      }
	]
}
 */
router.get(
	'/env/combo-box',
	authorizeMiddlware,
	requestHandler(envFindComboBox)
);

export default router;
