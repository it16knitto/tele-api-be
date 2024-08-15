import { requestHandler, Router } from '@knittotextile/knitto-http';
import authorizeMiddlware from '../middlewares/authorization';
import { branchFindComboBox } from './branch.controller';

const branchRouter = Router();
/**
 * GET /branch/combo-box
 * @tags Branch
 * @summary combo box pilih repository
 * @security BearerAuth
 * @param {number} id_repository.query.required - number
 * @return {object} 200 - success
 * 
 * @example request - 200 - success
 * GET /branch/combo-box?id_repository=617
 * 
 * @example response - 200 - success
 * {
  "message": "Success",
  "result": [
    {
      "id": 2,
      "name": "dev",
      "branch_tipe": "sandbox"
    }
  ]
}
 */
branchRouter.get(
	'/branch/combo-box',
	authorizeMiddlware,
	requestHandler(branchFindComboBox)
);
export default branchRouter;
