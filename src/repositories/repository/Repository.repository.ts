import { EntityRepo } from '@knittotextile/knitto-mysql';
export default class RepositoryRepository extends EntityRepo<RepositoryEntity> {
	tableName = 'repository';

	async findAll(perPage: number, page: number, search?: string) {
		let query = `SELECT * FROM ${this.tableName}`;
		const values = [];

		if (search) {
			query += ' WHERE name LIKE ?';
			values.push(`%${search}%`);
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
