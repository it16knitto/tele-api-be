import { EntityRepo } from '@knittotextile/knitto-mysql';
export default class EnvRepository extends EntityRepo<Entity.Env> {
	tableName = 'data_env';

	async findAll(perPage: number, page: number, search?: string) {
		let query = `SELECT * FROM ${this.tableName}`;
		const values = [];

		if (search) {
			query += ' WHERE nama_env LIKE ? OR catatan_env LIKE ?';
			values.push(`%${search}%`, `%${search}%`);
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
