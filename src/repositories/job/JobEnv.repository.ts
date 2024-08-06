import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class JobEnvRepository extends EntityRepo<JobEnvEntity> {
	tableName = 'job_env';
	async insert(data: JobEnvEntity): Promise<unknown> {
		data.create_date = new Date();
		return await super.insert(data);
	}
	async insertManys(arrEnv: number[], idJob: number): Promise<unknown> {
		const data: JobEnvEntity[] = [];
		arrEnv.forEach((env) => {
			data.push({
				id_job: idJob,
				id_env: env,
				create_date: new Date()
			});
		});
		return await super.insertMany(data);
	}
}
