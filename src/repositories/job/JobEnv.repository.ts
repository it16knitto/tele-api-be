import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class JobEnvRepository extends EntityRepo<Entity.JobEnv> {
	tableName = 'job_env';
	async insert(data: Entity.JobEnv): Promise<unknown> {
		data.create_date = new Date();
		return await super.insert(data);
	}
	async createMany(arrEnv: number[], idJob: number): Promise<unknown> {
		const data: Entity.JobEnv[] = [];
		for (const env of arrEnv) {
			data.push({
				id_job: idJob,
				id_env: env,
				create_date: new Date()
			});
		}
		return await super.insertMany(data);
	}
}
