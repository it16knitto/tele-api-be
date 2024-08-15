import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import BranchRepository from '@root/repositories/Branch.repository';

export const branchFindComboBox: TRequestFunction = async (req) => {
	const { id_repository } = req.query;
	const data = await new BranchRepository(mysqlConnection).findAllComboBox(
		+id_repository
	);
	return { result: data };
};
