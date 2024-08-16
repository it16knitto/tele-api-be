import { TRequestFunction } from '@knittotextile/knitto-http';
import {
	TGetGroupJobValidation,
	TPostGroupJobValidation
} from './group-job.request';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import GroupJobRepository from '@root/repositories/group-job/GroupJob.repository';
import ListJobGroupRepository from '@root/repositories/group-job/ListGroupJob.repository';
import {
	EnumRunTypeJob,
	jenkinsRunJobItemWithParams
} from '@root/services/jenkins/jenkins.service';
import HistoryJobRepository from '@root/repositories/HistoryJob.repository';
import { NotFoundException } from '@knittotextile/knitto-core-backend/dist/CoreException';

export const groupJobFind: TRequestFunction = async (req) => {
	const { search, perPage, page } =
		req.query as unknown as TGetGroupJobValidation;
	const jobRepository = new GroupJobRepository(mysqlConnection);
	const data = await jobRepository.findAll(perPage, page, search);
	return { result: data };
};

export const groupJobCreate: TRequestFunction = async (req) => {
	const { name, jobs } = req.body as unknown as TPostGroupJobValidation;
	await mysqlConnection.transaction(async (trx) => {
		const groupJobRepository = new GroupJobRepository(trx);
		const groupJob = await groupJobRepository.insert({
			nama_job: name
		});

		const listJobGroupRepository = new ListJobGroupRepository(trx);
		await listJobGroupRepository.createMany(jobs, groupJob.insertId);
	});
	return {
		message: 'Group Job created successfully',
		statusCode: 201,
		result: null
	};
};

export const groupJobFindJobs: TRequestFunction = async (req) => {
	const { id } = req.params;

	const { perPage, page } = req.query as unknown as TGetGroupJobValidation;
	const data = await mysqlConnection.basicPaginate({
		query: `SELECT job.id, job.create_date, job.name, job.cabang, job.branch, job.app_port, 
		job.app_path, job.jenis_server, job.url_repo, job.tipe_runtime, 
		job.job_name, list_job_group.id_group, list_job_group.status_last_build 
		FROM job JOIN list_job_group ON job.id = list_job_group.id_job 
		WHERE list_job_group.id_group = ? 
		ORDER BY list_job_group.order ASC`,
		value: [id],
		perPage,
		page
	});
	return { result: data };
};
export const groupJobRun: TRequestFunction = async (req: any) => {
	const { id } = req.params;
	const id_user = req.user.id;
	try {
		const groupJob = await mysqlConnection
			.raw('select * from group_job where id = ?', [id])
			.then((result) => result[0] ?? null);

		if (!groupJob) {
			throw new NotFoundException('group job not found in database');
		}

		const dataJob: any[] = await mysqlConnection.raw(
			`SELECT job.id, job.create_date, job.name, job.cabang, job.branch, job.app_port, 
		job.app_path, job.jenis_server, job.url_repo, job.tipe_runtime, 
		job.job_name, list_job_group.id_group, list_job_group.status_last_build 
		FROM job JOIN list_job_group ON job.id = list_job_group.id_job 
		WHERE list_job_group.id_group = ? 
		ORDER BY list_job_group.order ASC`,
			[id]
		);

		await mysqlConnection.transaction(async (trx) => {
			await new HistoryJobRepository(trx).insert({
				nama_job: groupJob.nama_job,
				create_date: new Date(),
				id_user,
				jenis_job: 'Group Job'
			});
		});
		for (const data of dataJob) {
			jenkinsRunJobItemWithParams(data.job_name, EnumRunTypeJob.groupjob, id);
		}
		return { statusCode: 201, result: null };
	} catch (e) {
		throw e;
	}
};
export const groupJobDelete: TRequestFunction = async (req) => {
	const { id } = req.params;
	const data = await mysqlConnection
		.raw('select id from group_job where id = ?', [id])
		.then((result) => result[0]);
	if (!data) {
		throw new NotFoundException('Data group not found');
	}

	await mysqlConnection.transaction(async (trx) => {
		await new GroupJobRepository(trx).remove({ id: +id });
		await new ListJobGroupRepository(trx).remove({ id_group: +id });
	});
	return { result: null };
};
