import jobRequest from './job.request';
import {
	Router,
	requestHandler,
	requestValidator
} from '@knittotextile/knitto-http';
import jobController from './job.controller';
import authorizeMiddlware from '../middlewares/authorization';

const router = Router();
/**
 * GET /job
 * @tags Job
 * @summary get job
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
        "id": 59,
        "create_date": "2024-08-14T03:18:38.000Z",
        "name": "test-timbangan",
        "cabang": "SEMUA",
        "branch": "dev",
        "app_port": 8399,
        "app_path": "",
        "jenis_server": "sandbox",
        "url_repo": "https://github.com/knittotextile/knitto-api-timbangan",
        "tipe_runtime": "artifact",
        "job_name": "test-timbangan-sandbox-artifact",
        "status_last_build": "FAILURE",
        "nama_cabang": "holis, surabaya, semarang, yogya, kebon-jukut"
      }
    ],
    "paginate": {
      "page": 1,
      "perPage": 10,
      "totalItem": 6,
      "totalPage": 1
    }
  }
}
 */
router.get(
	'/job',
	requestValidator({
		requestType: 'query',
		type: jobRequest.getJobValidation
	}),
	authorizeMiddlware,
	requestHandler(jobController.jobFind)
);

/**
 * GET /job/{id}/env
 * @tags Job
 * @summary job env
 * @security BearerAuth
 * @param {number} id.path.required - number
 * @param {number} perPage.query.required - number
 * @param {number} page.query.required - number
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "data": [
      {
        "id": 0,
        "create_date": "1970-01-01T00:00:00.000Z",
        "catatan_env": "string",
        "nama_env": "string",
        "nama_cabang": "string",
        "nama_variabel": "string",
        "script": "string",
        "id_job": 0
      }
    ]
 * }
 */
router.get(
	'/job/:id/env',
	requestValidator({
		requestType: 'query',
		type: jobRequest.getJobEnvValidation
	}),
	authorizeMiddlware,
	requestHandler(jobController.jobEnvFind)
);

/**
 * POST /job
 * @tags Job
 * @summary create job
 * @security BearerAuth
 * @typedef {object} JobCreate
 * @property {string} name.required - The job name
 * @property {string} branch.required - The branch name
 * @property {number} app_port.required - The application port
 * @property {string} app_path.required - The application path
 * @property {string} jenis_server.required - The server type -enum:sandbox,production
 * @property {string} tipe_runtime_pipeline.required - The deploy type  - enum:docker,pm2,artifact,dbmysql,website
 * @property {string} url_repo.required - The repository URL
 * @property {array<number>} cabang.required - The branch array
 * @property {array<number>} env.required - The environment array
 * @param {JobCreate} request.body.required - job creation request
 * @return {object} 201 - created
 * @return {object} 400 - bad request
 * @example response - 201 - created
 * {
  "message": "Job created successfully",
  "result": null
}
 */
router.post(
	'/job',
	requestValidator({
		requestType: 'body',
		type: jobRequest.postJobValidation
	}),
	authorizeMiddlware,
	requestHandler(jobController.jobCreate)
);

/**
 * GET /job/combo-box-pilih-runtime-pipeline
 * @tags Job
 * @summary Get runtime pipeline options for combo box
 * @security BearerAuth
 * @return {array<string>} 200 - List of runtime pipeline options
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": [
    "docker",
    "pm2",
    "artifact",
    "Db-mysql",
    "website"
  ]
}
 */
router.get(
	'/job/combo-box-pilih-runtime-pipeline',
	authorizeMiddlware,
	requestHandler(jobController.jobComboBoxPilihJenisRuntime)
);

/**
 * POST /job/{id}/run
 * @tags Job
 * @summary job run
 * @security BearerAuth
 * @param {number} id.path.required - number
 * @return {object} 201 - created
 * @example response - 201 - created
 * {
 *   "message": "Created",
 *   "result": null
 * }
 */
router.post(
	'/job/:id/run',
	authorizeMiddlware,
	requestHandler(jobController.jobRun)
);

/**
 * GET /job/{id}/status
 * @tags Job
 * @summary job status
 * @security BearerAuth
 * @param {number} id.path.required - number
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": {
    "status": "FAILURE",
    "timestamp": 1723690607446,
    "duration": 23044,
    "estimated_duration": 26964,
    "number": 6,
    "queue_id": 442,
    "url": "http://192.168.20.12:8080/job/test-timbangan-sandbox-artifact/6/"
  }
}
 */
router.get(
	'/job/:id/status',
	authorizeMiddlware,
	requestHandler(jobController.jobStatus)
);

/**
 * DELETE /job/{id}
 * @tags Job
 * @summary job delete
 * @security BearerAuth
 * @param {number} id.path.required - number
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "result": null
 * }
 */
router.delete(
	'/job/:id',
	authorizeMiddlware,
	requestHandler(jobController.jobDelete)
);

router.post('/job/webhook', requestHandler(jobController.jobWebhook));
export default router;
