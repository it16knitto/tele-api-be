import {
	requestHandler,
	requestValidator,
	Router
} from '@knittotextile/knitto-http';
import historyRequest from './history.request';
import authorizeMiddlware from '../middlewares/authorization';
import { historyJobFind } from './history.controller';
const router = Router();
/**
 * GET /history/job
 * @tags History Job
 * @summary get history job
 * @security BearerAuth
 * @param {string} search.query - string
 * @param {number} perPage.query.required - number
 * @param {number} page.query.required - number
 * @param {string} tanggal_awal.query - string
 * @param {string} tanggal_akhir.query - string
 * @return {object} 200 - success
 * @example response - 200 - success
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": {
    "data": [
      {
        "id": 1,
        "create_date": "1970-01-01T00:00:00.000Z",
        "jenis_job": "string",
        "jenis_transaksi": "string",
        "id_user": 1,
        "nama_job": "string"
      }
    ],
    "paginate": {
      "page": 1,
      "perPage": 10,
      "totalItem": 1,
      "totalPage": 1
    }
  }
}
 */
router.get(
	'/history/job',
	requestValidator({
		requestType: 'query',
		type: historyRequest.getHistoryJobValidation
	}),
	authorizeMiddlware,
	requestHandler(historyJobFind)
);

export default router;
