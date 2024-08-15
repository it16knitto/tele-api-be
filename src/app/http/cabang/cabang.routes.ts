import cabangRequest from './cabang.request';
import {
	Router,
	requestHandler,
	requestValidator
} from '@knittotextile/knitto-http';
import { cabangFind, cabangFindComboBox } from './cabang.controller';
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
 {
  "message": "Success",
  "result": {
    "data": [
      {
        "id": 1,
        "create_date": "2024-05-27T07:37:08.000Z",
        "name": "holis",
        "ip_address": "192.168.20.25",
        "credentialid": "b049467c-2ec0-42ac-bc20-c4a064fb12c0",
        "tipe_cabang": "sandbox"
      }
    ],
    "paginate": {
      "page": 1,
      "perPage": 10,
      "totalItem": 5,
      "totalPage": 1
    }
  }
}
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

/**
 * GET /cabang/combo-box
 * @tags Cabang
 * @summary get cabang
 * @security BearerAuth
 * @param {string} server.query.required -string enum:sandbox,production
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": [
    {
      "id": 1,
      "name": "holis"
    }
  ]
}
 */
router.get(
	'/cabang/combo-box',
	requestValidator({
		requestType: 'query',
		type: cabangRequest.getCabangComboBoxValidation
	}),
	authorizeMiddlware,
	requestHandler(cabangFindComboBox)
);

export default router;
