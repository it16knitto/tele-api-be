import { TRequestFunction } from '@knittotextile/knitto-http';
import { TEnvValidation } from './env.request';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import EnvRepository from '@root/repositories/master-data/Env.repository';

export const envFind: TRequestFunction = async (req) => {
	const { search, perPage, page } = req.query as unknown as TEnvValidation;
	const envRepository = new EnvRepository(mysqlConnection);
	const data = await envRepository.findAll(perPage, page, search);
	return { result: data };
};
