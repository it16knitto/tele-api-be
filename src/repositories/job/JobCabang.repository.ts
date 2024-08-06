import { EntityRepo } from '@knittotextile/knitto-mysql';

export default class JobCabangRepository extends EntityRepo<JobCabangEntity> {
	tableName = 'job_cabang';
	async insert(data: JobCabangEntity): Promise<unknown> {
		data.create_date = new Date();
		return await super.insert(data);
	}
	async insertManys(arrCabang: number[], idJob: number): Promise<any> {
		const data: JobCabangEntity[] = [];
		arrCabang.forEach((cabang) => {
			data.push({
				id_job: idJob,
				id_cabang: cabang,
				create_date: new Date()
			});
		});
		return await super.insertMany(data);
	}
}
