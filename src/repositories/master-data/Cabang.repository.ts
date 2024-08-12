import { EntityRepo } from '@knittotextile/knitto-mysql';
export enum EnumTipeCabang {
	Production = 'production',
	Sandbox = 'sandbox'
}
export default class CabangRepository extends EntityRepo<Entity.Cabang> {
	tableName = 'cabang';

	async findAll(perPage: number, page: number, search?: string) {
		let query = `SELECT * FROM ${this.tableName}`;
		const values = [];

		if (search) {
			query += ' WHERE name LIKE ? OR tipe_cabang LIKE ?';
			values.push(`%${search}%`, `%${search}%`);
		}

		const data = await this.dbConnector.basicPaginate({
			query,
			perPage,
			page,
			value: values
		});

		return data;
	}
}
