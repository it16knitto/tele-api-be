import { TRequestFunction } from '@knittotextile/knitto-http';
import { TGetHistoryJobValidation } from './history.request';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import HistoryJobRepository from '@root/repositories/HistoryJob.repository';

export const historyJobFind: TRequestFunction = async (req) => {
	const { search, perPage, page, tanggal_awal, tanggal_akhir } =
		req.query as unknown as TGetHistoryJobValidation;
	const historyJobRepository = new HistoryJobRepository(mysqlConnection);
	const data = await historyJobRepository.findHistory(
		perPage,
		page,
		search,
		tanggal_awal,
		tanggal_akhir
	);
	return { result: data };
};
