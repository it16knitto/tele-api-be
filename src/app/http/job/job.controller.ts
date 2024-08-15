import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import JobRepository from '@root/repositories/job/Job.repository';
import {
	TGetJobEnvValidation,
	TGetJobValidation,
	TipeRuntimePipelineEnum,
	TPostJobValidation
} from './job.request';
import JobCabangRepository from '@root/repositories/job/JobCabang.repository';
import JobEnvRepository from '@root/repositories/job/JobEnv.repository';

import { NotFoundException } from '@knittotextile/knitto-core-backend/dist/CoreException';
import {
	EnumRunTypeJob,
	jenkinsDeleteJobItem,
	jenkinsGeneratePipelineScript,
	jenkinsPostCreateJobItem,
	jenkinsRunJobItemWithParams,
	jenkinsStatusJobItem
} from '@root/services/jenkins/jenkins.service';
import {
	footerXML,
	headerXML
} from '@root/services/jenkins/script-generators/utility';
import HistoryJobRepository from '@root/repositories/HistoryJob.repository';
import ListJobGroupRepository from '@root/repositories/group-job/ListGroupJob.repository';

const jobFind: TRequestFunction = async (req) => {
	const { search, perPage, page } = req.query as unknown as TGetJobValidation;
	const jobRepository = new JobRepository(mysqlConnection);
	const data = await jobRepository.findAll(perPage, page, search);
	return { result: data };
};
const jobEnvFind: TRequestFunction = async (req) => {
	const { id } = req.params;

	const { perPage, page } = req.query as unknown as TGetJobEnvValidation;
	const data = await mysqlConnection.basicPaginate({
		query: `SELECT data_env.id, data_env.create_date, data_env.catatan_env, data_env.nama_env, data_env.nama_cabang, data_env.nama_variabel, data_env.script, job_env.id_job 
		FROM data_env JOIN job_env ON data_env.id = job_env.id_env
		WHERE job_env.id_job = ?`,
		value: [id],
		perPage,
		page
	});
	return { result: data };
};

const jobCreate: TRequestFunction = async (req) => {
	const {
		name,
		branch,
		app_port,
		app_path,
		jenis_server,
		url_repo,
		cabang,
		env,
		tipe_runtime_pipeline
	} = req.body as unknown as TPostJobValidation;
	let jobId: number;

	const pipelineNameJenkins = `${name}-${jenis_server}-${tipe_runtime_pipeline}`;
	try {
		const arrCabang: number[] = [...new Set(cabang)];
		const countCabang = await mysqlConnection
			.raw('SELECT COUNT(id) as count FROM cabang WHERE tipe_cabang = ?', [
				jenis_server
			])
			.then((result) => result[0] ?? null);

		await mysqlConnection.transaction(async (trx) => {
			const jobRepository = new JobRepository(trx);
			const job = await jobRepository.insert({
				name,
				cabang: arrCabang.length === countCabang?.count ? 'SEMUA' : 'SEBAGIAN',
				branch,
				app_port,
				app_path,
				jenis_server,
				url_repo,
				tipe_runtime: tipe_runtime_pipeline,
				job_name: pipelineNameJenkins
			});
			jobId = job.insertId;

			if (cabang.length === 0) {
				const findCabang: any[] = await trx.raw(
					'select * from cabang where tipe_cabang = ?',
					[jenis_server]
				);
				for (const cabang of findCabang) {
					arrCabang.push(cabang.id);
				}
			}
			const jobCabangRepository = new JobCabangRepository(trx);
			await jobCabangRepository.createMany(arrCabang, job.insertId);
			const jobEnvRepository = new JobEnvRepository(trx);
			await jobEnvRepository.createMany(env, job.insertId);
		});
		const scriptPipeline = await jenkinsGeneratePipelineScript(
			jobId,
			tipe_runtime_pipeline
		);
		const xmlData = `${headerXML}
				${scriptPipeline}
			 ${footerXML}
		  `;
		const postJenkinsCreatePipeline = await jenkinsPostCreateJobItem(
			xmlData,
			pipelineNameJenkins
		);
		if (!postJenkinsCreatePipeline) {
			/// rollback ketika gagal
			await mysqlConnection.transaction(async (trx) => {
				await new JobRepository(trx).remove({ id: jobId });
				await new JobCabangRepository(trx).remove({ id_job: jobId });
				await new JobEnvRepository(trx).remove({ id_job: jobId });
			});
			throw new Error('Failed to hit the jenkins create endpoint');
		}
		return {
			message: 'Job created successfully',
			statusCode: 201,
			result: null
		};
	} catch (e: any) {
		throw new Error(e.message ? e.message : 'An error occurred');
	}
};

const jobComboBoxPilihJenisRuntime: TRequestFunction = async () => {
	return { result: Object.values(TipeRuntimePipelineEnum) };
};

const jobRun: TRequestFunction = async (req: any) => {
	const id = req.params.id;
	const id_user = req.user.id;
	const data = await mysqlConnection
		.raw('select * from job where id = ?', [id])
		.then((data) => data[0] ?? null);
	if (!data) {
		throw new NotFoundException('job not found in database');
	}
	try {
		await jenkinsRunJobItemWithParams(data.job_name, EnumRunTypeJob.single);
		await mysqlConnection.transaction(async (trx) => {
			await new HistoryJobRepository(trx).insert({
				nama_job: data.job_name,
				create_date: new Date(),
				id_user,
				jenis_job: 'Job'
			});
		});
		return { statusCode: 201, result: null };
	} catch (e: any) {
		throw new Error(e.message ? e.message : 'An error occurred');
	}
};

const jobStatus: TRequestFunction = async (req) => {
	try {
		const id = req.params.id;
		const data = await mysqlConnection
			.raw('select * from job where id = ?', [id])
			.then((data) => data[0] ?? null);
		if (!data) {
			throw new NotFoundException('data job not found');
		}

		const status = await jenkinsStatusJobItem(data.job_name);
		const result = {
			status: status.result,
			timestamp: status.timestamp,
			duration: status.duration,
			estimated_duration: status.estimatedDuration,
			number: status.number,
			queue_id: status.queueId,
			url: status.url
		};
		return { result };
	} catch (e: any) {
		throw new Error(e.message ? e.message : 'An error occurred');
	}
};

const jobDelete: TRequestFunction = async (req) => {
	const id = req.params.id;
	const data = await mysqlConnection
		.raw('select * from job where id = ?', [id])
		.then((data) => data[0] ?? null);
	if (!data) {
		throw new NotFoundException('job not found');
	}
	try {
		await mysqlConnection.transaction(async (trx) => {
			await new JobRepository(trx).remove({ id: +id });
			await new JobCabangRepository(trx).remove({ id_job: +id });
			await new JobEnvRepository(trx).remove({ id_job: +id });
			await jenkinsDeleteJobItem(data.job_name);
		});
		return { result: null };
	} catch (e: any) {
		throw new Error(e.message ? e.message : 'An error occurred');
	}
};
const jobWebhook: TRequestFunction = async (req) => {
	const { status, job_name, group_job_id, run_type } = req.body;
	try {
		switch (run_type) {
			case EnumRunTypeJob.single:
				await mysqlConnection.transaction(async (trx) => {
					await new JobRepository(trx).update(
						{ status_last_build: status.toUpperCase() },
						{ job_name }
					);
				});
				break;
			case EnumRunTypeJob.groupjob:
				const job = await mysqlConnection
					.raw('select id from job where job_name = ?', [job_name])
					.then((result) => result[0] ?? null);
				if (!job) {
					break;
				}
				await mysqlConnection.transaction(async (trx) => {
					await new ListJobGroupRepository(trx).update(
						{ status_last_build: status.toUpperCase() },
						{ id_group: group_job_id, id_job: job.id }
					);
				});
				break;
			default:
				await mysqlConnection.transaction(async (trx) => {
					await new JobRepository(trx).update(
						{ status_last_build: status.toUpperCase() },
						{ job_name }
					);
				});
		}
		return { statusCode: 201, result: null };
	} catch (e) {
		throw e;
	}
};
export default {
	jobFind,
	jobEnvFind,
	jobCreate,
	jobComboBoxPilihJenisRuntime,
	jobRun,
	jobStatus,
	jobDelete,
	jobWebhook
};
