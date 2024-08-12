import { TRequestFunction } from '@knittotextile/knitto-http';
import {
	TGetGroupJobValidation,
	TPostGroupJobValidation
} from './group-job.request';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import GroupJobRepository from '@root/repositories/group-job/GroupJob.repository';
import ListJobGroupRepository from '@root/repositories/group-job/ListGroupJob.repository';

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
		query: ` SELECT job.*, list_job_group.id_group FROM job JOIN list_job_group ON job.id = list_job_group.id_job
    WHERE list_job_group.id_group = ?`,
		value: [id],
		perPage,
		page
	});
	return { result: data };
};
