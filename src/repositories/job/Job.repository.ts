import { EntityRepo } from '@knittotextile/knitto-mysql';
export default class JobRepository extends EntityRepo<JobEntity> {
	tableName = 'job';

	async findAll(perPage: number, page: number, search?: string) {
		let query = `SELECT job.*, GROUP_CONCAT(cabang.name SEPARATOR ', ') AS nama_cabang FROM ${this.tableName}
			LEFT JOIN job_cabang ON job.id = job_cabang.id_job
			LEFT JOIN cabang ON job_cabang.id_cabang = cabang.id`;
		const values = [];

		if (search) {
			query += ' WHERE job.name LIKE ?';
			values.push(`%${search}%`);
		}

		query += ' GROUP BY job.id';

		const data = await this.dbConnector.basicPaginate({
			query,
			value: values,
			perPage,
			page
		});
		return data;
	}
	async insert(data: JobEntity): Promise<any> {
		data.create_date = new Date();
		return await super.insert(data);
	}
}
