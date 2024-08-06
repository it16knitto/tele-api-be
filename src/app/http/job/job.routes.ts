import jobRequest from './job.request';
import repositoryRequest from '../repository/repository.request';
import envRequest from '../env/env.request';
import {
	Router,
	requestHandler,
	requestValidator
} from '@knittotextile/knitto-http';
import {
	jobFind,
	jobEnvFind,
	jobComboBoxPilihCabang,
	jobComboBoxPilihRepository,
	jobComboBoxPilihEnv,
	jobCreate
} from './job.controller';
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
 *   "message": "Success",
 *   "result": {
 *   }
 * }
 */
router.get(
	'/job',
	requestValidator({
		requestType: 'query',
		type: jobRequest.getJobValidation
	}),
	authorizeMiddlware,
	requestHandler(jobFind)
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
	requestHandler(jobEnvFind)
);

/**
 * GET /job/combo-box-pilih-cabang
 * @tags Job
 * @summary combo box pilih cabang
 * @security BearerAuth
 * @param {string} server.query.required - string enum:sandbox,production
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
 *   "message": "Success",
 *   "result": [
 *     {
 *       "id": 0,
 *       "nama_cabang": "string"
 *     }
 *   ]
 * }
 */
router.get(
	'/job/combo-box-pilih-cabang',
	requestValidator({
		requestType: 'query',
		type: jobRequest.getJobComboBoxPilihCabangValidation
	}),
	authorizeMiddlware,
	requestHandler(jobComboBoxPilihCabang)
);

/**
 * GET /job/combo-box-pilih-repository
 * @tags Job
 * @summary combo box pilih repository
 * @security BearerAuth
 * @param {string} search.query - string
 * @param {number} perPage.query.required - number
 * @param {number} page.query.required - number
 * @return {object} 200 - success
 * @return {object} 400 - bad request
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": {
    "data": [
      {
        "id": 1,
        "create_date": "1970-01-01T00:00:00.000Z",
        "name": "string",
        "url": "string",
        "app_port": 0,
        "app_path": "string",
        "status_aktif": "string"
      }
    ],
    "paginate": {
      "page": 1,
      "perPage": 1,
      "totalItem": 1,
      "totalPage": 1
    }
  }
}
 */
router.get(
	'/job/combo-box-pilih-repository',
	requestValidator({
		requestType: 'query',
		type: repositoryRequest.getRepositoryValidation
	}),
	authorizeMiddlware,
	requestHandler(jobComboBoxPilihRepository)
);

/**
 * GET /job/combo-box-pilih-env
 * @tags Job
 * @summary combo box pilih env
 * @security BearerAuth
 * @param {string} search.query - string
 * @param {number} perPage.query.required - number
 * @param {number} page.query.required - number
 * @return {object} 200 - success
 * @return {object} 400 - bad request
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": {
    "data": [
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
    ],
    "paginate": {
      "page": 1,
      "perPage": 1,
      "totalItem": 1,
      "totalPage": 1
    }
  }
}
 */
router.get(
	'/job/combo-box-pilih-env',
	requestValidator({
		requestType: 'query',
		type: envRequest.getEnvValidation
	}),
	authorizeMiddlware,
	requestHandler(jobComboBoxPilihEnv)
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
 * @property {string} jenis_server.required - The server type
 * @property {string} tipe_runtime_pipeline.required - The deploy type  - enum:docker,pm2,artifact,dbmysql,website
 * @property {string} url_repo.required - The repository URL
 * @property {array<number>} cabang.required - The branch array
 * @property {array<number>} env.required - The environment array
 * @param {JobCreate} request.body.required - job creation request
 * @return {object} 200 - success
 * @return {object} 400 - bad request
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": {}
}
 */
router.post(
	'/job',
	requestValidator({
		requestType: 'body',
		type: jobRequest.postJobValidation
	}),
	authorizeMiddlware,
	requestHandler(jobCreate)
);

export default router;