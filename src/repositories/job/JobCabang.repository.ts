import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class JobCabangRepository extends EntityRepo<Entity.JobCabang> {
	tableName = 'job_cabang';
	async insert(data: Entity.JobCabang): Promise<unknown> {
		data.create_date = new Date();
		return await super.insert(data);
	}
	async createMany(arrCabang: number[], idJob: number): Promise<any> {
		const data: Entity.JobCabang[] = [];
		for (const cabang of arrCabang) {
			data.push({
				id_job: idJob,
				id_cabang: cabang,
				create_date: new Date()
			});
		}
		return await super.insertMany(data);
	}
}
