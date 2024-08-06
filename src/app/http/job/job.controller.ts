import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import JobRepository from '@root/repositories/job/Job.repository';
import {
	TGetJobComboBoxPilihCabangValidation,
	TGetJobEnvValidation,
	TGetJobValidation,
	TPostJobValidation
} from './job.request';
import { TRepositoryValidation } from '../repository/repository.request';
import RepositoryRepository from '@root/repositories/repository/Repository.repository';
import { TEnvValidation } from '../env/env.request';
import EnvRepository from '@root/repositories/env/Env.repository';
import JobCabangRepository from '@root/repositories/job/JobCabang.repository';
import JobEnvRepository from '@root/repositories/job/JobEnv.repository';

export const jobFind: TRequestFunction = async (req) => {
	const { search, perPage, page } = req.query as unknown as TGetJobValidation;
	const jobRepository = new JobRepository(mysqlConnection);
	const data = await jobRepository.findAll(perPage, page, search);
	return { result: data };
};
export const jobEnvFind: TRequestFunction = async (req) => {
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

export const jobComboBoxPilihCabang: TRequestFunction = async (req) => {
	const { server } =
		req.query as unknown as TGetJobComboBoxPilihCabangValidation;
	const data = await mysqlConnection.raw(
		'SELECT * FROM cabang WHERE tipe_cabang = ?',
		[server]
	);
	return { result: data };
};

export const jobComboBoxPilihRepository: TRequestFunction = async (req) => {
	const { perPage, page, search } =
		req.query as unknown as TRepositoryValidation;
	try {
		const repositoryRepository = new RepositoryRepository(mysqlConnection);
		const repos = await repositoryRepository.findAll(
			+perPage || 10,
			+page || 1,
			search
		);
		return { result: repos };
	} catch (error) {
		throw new Error(error as string);
	}
};

export const jobComboBoxPilihEnv: TRequestFunction = async (req) => {
	const { search, perPage, page } = req.query as unknown as TEnvValidation;
	const envRepository = new EnvRepository(mysqlConnection);
	const data = await envRepository.findAll(perPage, page, search);
	return { result: data };
};

export const jobCreate: TRequestFunction = async (req) => {
	const {
		name,
		branch,
		app_port,
		app_path,
		jenis_server,
		url_repo,
		cabang,
		env
	} = req.body as unknown as TPostJobValidation;
	let jobId: number;
	await mysqlConnection.transaction(async (trx) => {
		const jobRepository = new JobRepository(trx);
		const job = await jobRepository.insert({
			name,
			cabang: cabang.length > 0 ? 'SEBAGIAN' : 'SEMUA',
			branch,
			app_port,
			app_path,
			jenis_server,
			url_repo
		});
		jobId = job.insertId;
		const jobCabangRepository = new JobCabangRepository(trx);
		const jobEnvRepository = new JobEnvRepository(trx);
		await jobCabangRepository.insertManys(cabang, job.insertId);
		await jobEnvRepository.insertManys(env, job.insertId);
	});
	return {
		message: 'Job created successfully',
		statusCode: 201,
		result: { jobId }
	};
};
