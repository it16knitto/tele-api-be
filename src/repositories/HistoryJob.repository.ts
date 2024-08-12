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
		let query = `SELECT * FROM ${this.tableName}`;
		const values = [];
		if (search) {
			query += ' WHERE nama_job LIKE ?';
			values.push(`%${search}%`);
		} else {
			query += ' WHERE nama_job is not null';
		}
		if (tanggal_awal && tanggal_akhir) {
			query += ' AND create_date BETWEEN ? AND ?';
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
