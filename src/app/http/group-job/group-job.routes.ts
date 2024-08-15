import {
	requestHandler,
	requestValidator,
	Router
} from '@knittotextile/knitto-http';
import jobGroupRequest from './group-job.request';
import authorizeMiddlware from '../middlewares/authorization';
import {
	groupJobCreate,
	groupJobFind,
	groupJobFindJobs,
	groupJobRun
} from './group-job.controller';
const router = Router();
/**
 * GET /group-job
 * @tags Group Job
 * @summary get group job
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
        "id": 1,
        "create_date": "2024-05-30T01:44:24.000Z",
        "nama_job": "Testing Group Job",
        "catatan": "untuk deploy job docker-penimbangan  dan docker-penimbangan-holis-kej"
      }
    ],
    "paginate": {
      "page": 1,
      "perPage": 10,
      "totalItem": 11,
      "totalPage": 2
    }
  }
}
 */
router.get(
	'/group-job',
	requestValidator({
		requestType: 'query',
		type: jobGroupRequest.getGroupJobValidation
	}),
	authorizeMiddlware,
	requestHandler(groupJobFind)
);

/**
 * POST /group-job
 * @tags Group Job
 * @summary create group job
 * @security BearerAuth
 * @typedef {object} GroupJobCreate
 * @property {string} name.required - The group job name
 * @property {array<number>} jobs.required - The job array
 * @param {GroupJobCreate} request.body.required - group job creation request
 * @return {object} 200 - success
 * @return {object} 400 - bad request
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": null
}
 */
router.post(
	'/group-job',
	requestValidator({
		requestType: 'body',
		type: jobGroupRequest.postGroupJobValidation
	}),
	authorizeMiddlware,
	requestHandler(groupJobCreate)
);

/**
 * GET /group-job/{id}/job
 * @tags Group Job
 * @summary group job job
 * @security BearerAuth
 * @param {number} id.path.required - number
 * @param {number} perPage.query.required - number
 * @param {number} page.query.required - number
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "result": {
 *     "data": [
        {
          "id": 1,
          "create_date": "1970-01-01T00:00:00.000Z",
          "name": "string",
          "cabang": "string",
          "branch": "string",
          "app_port": 0,
          "app_path": "string",
          "jenis_server": "string",
          "url_repo": "string",
          "id_group": 0
        }
      ],
 *     "paginate": {
 *       "page": 0,
 *       "perPage": 0,
 *       "totalItem": 0,
 *       "totalPage": 0
 *     }
 *   }
 * }
 */
router.get(
	'/group-job/:id/job',
	requestValidator({
		requestType: 'query',
		type: jobGroupRequest.getGroupJobValidation
	}),
	authorizeMiddlware,
	requestHandler(groupJobFindJobs)
);

/**
 * POST /group-job/{id}/run
 * @tags Group Job
 * @summary group job run
 * @security BearerAuth
 * @param {number} id.path.required - number
 * @return {object} 201 - success
 * @example response - 201 - success
 * {
 *   "message": "Success",
 *   "result": null
 * }
 */
router.post(
	'/group-job/:id/run',
	authorizeMiddlware,
	requestHandler(groupJobRun)
);
export default router;
