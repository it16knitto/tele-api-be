import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class BranchRepository extends EntityRepo<Entity.Branch> {
	tableName = 'branch';
	async insert(data: Entity.Branch): Promise<unknown> {
		data.create_date = new Date();
		return await super.insert(data);
	}
	async findAllComboBox(id_repository: number) {
		const data = await this.dbConnector.raw(
			`SELECT id,name,branch_tipe FROM ${this.tableName} WHERE id_repository = ?`,
			[id_repository]
		);
		return data;
	}
}
