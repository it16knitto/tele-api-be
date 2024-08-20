import { Router, requestHandler } from '@knittotextile/knitto-http';
import {
	repositoryFetch,
	repositoryFindAll,
	repositoryFindComboBox,
	repositoryFindLastFetch
} from './repository.controller';
import authorizeMiddlware from '../middlewares/authorization';
const repositoryRouter = Router();

/**
 * GET /repository/fetch
 * @tags Repository
 * @summary Fetch repositories from GitHub and sync to database
 * @security BearerAuth
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
  "message": "Successfully",
  "result": null
}
 */
repositoryRouter.get(
	'/repository/fetch',
	authorizeMiddlware,
	requestHandler(repositoryFetch)
);
/**
 * GET /repository
 * @tags Repository
 * @summary Get all repositories with pagination
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
repositoryRouter.get(
	'/repository',
	authorizeMiddlware,
	requestHandler(repositoryFindAll)
);

/**
 * GET /repository/combo-box
 * @tags Repository
 * @summary combo box pilih repository
 * @security BearerAuth
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": [
    {
      "id": 616,
      "name": "order-web-knitto",
      "url": "https://github.com/knittotextile/order-web-knitto"
    }
  ]
}
 */
repositoryRouter.get(
	'/repository/combo-box',
	authorizeMiddlware,
	requestHandler(repositoryFindComboBox)
);

/**
 * GET /repository/last-fetch
 * @tags Repository
 * @summary last-fetch repository
 * @security BearerAuth
 * @return {object} 200 - success
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": {
    "last_fetch_repo": "2024-08-20T06:15:51.585Z",
    "last_fetch_repo_epoch_time": 1724134551585
  }
}
 */
repositoryRouter.get(
	'/repository/last-fetch',
	authorizeMiddlware,
	requestHandler(repositoryFindLastFetch)
);
export default repositoryRouter;
