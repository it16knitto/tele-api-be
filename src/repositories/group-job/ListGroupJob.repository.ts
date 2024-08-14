import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class ListJobGroupRepository extends EntityRepo<Entity.ListGroupJob> {
	tableName = 'list_job_group';
	async insert(data: Entity.ListGroupJob): Promise<unknown> {
		data.create_date = new Date();
		return await super.insert(data);
	}
	async createMany(arrJobs: number[], id_group: number): Promise<any> {
		const data: Entity.ListGroupJob[] = [];
		let order = 1;
		for (const job of arrJobs) {
			data.push({
				id_job: job,
				id_group,
				create_date: new Date(),
				order: order++
			});
		}
		return await super.insertMany(data);
	}
}
