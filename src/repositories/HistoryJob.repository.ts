import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class HistoryJobRepository extends EntityRepo<Entity.HistoryJob> {
	tableName = 'history_job';
	async insert(data: Entity.HistoryJob): Promise<unknown> {
		data.create_date = new Date();
		return await super.insert(data);
	}
	async findHistory(
		perPage: number,
		page: number,
		search?: string,
		tanggal_awal?: string,
		tanggal_akhir?: string
	) {
		let query = `SELECT history_job.*, user.fullname FROM ${this.tableName} JOIN user ON history_job.id_user = user.id`;
		const values = [];
		if (search) {
			query += ' WHERE history_job.nama_job LIKE ?';
			values.push(`%${search}%`);
		} else {
			query += ' WHERE history_job.nama_job is not null';
		}
		if (tanggal_awal && tanggal_akhir) {
			query += ' AND history_job.create_date BETWEEN ? AND ?';
			values.push(tanggal_awal, tanggal_akhir);
		}
		const data = await this.dbConnector.basicPaginate({
			query,
			value: values,
			perPage,
			page
		});
		return data;
	}
}
