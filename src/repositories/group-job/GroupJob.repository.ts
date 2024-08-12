import { EntityRepo } from '@knittotextile/knitto-mysql';
export default class GroupJobRepository extends EntityRepo<Entity.GroupJob> {
	tableName = 'group_job';

	async findAll(perPage: number, page: number, search?: string) {
		let query = `SELECT * FROM ${this.tableName}`;
		const values = [];
		if (search) {
			query += ' WHERE nama_job LIKE ?';
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
	async insert(data: Entity.GroupJob): Promise<any> {
		data.create_date = new Date();
		return await super.insert(data);
	}
}
