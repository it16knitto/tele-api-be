import { TRequestFunction } from '@knittotextile/knitto-http';
import { TCabangValidation } from './cabang.request';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import CabangRepository from '@root/repositories/master-data/Cabang.repository';

export const cabangFind: TRequestFunction = async (req) => {
	const { search, perPage, page } = req.query as unknown as TCabangValidation;
	const cabangRepository = new CabangRepository(mysqlConnection);
	const data = await cabangRepository.findAll(perPage, page, search);
	return { result: data };
};
