import {
	any,
	array,
	enum_,
	InferOutput,
	minValue,
	number,
	object,
	optional,
	pipe,
	string,
	transform
} from 'valibot';
import { ERROR_VALIDATION_MSG } from '@root/libs/config/errorMessage';

const getJobValidation = object({
	search: optional(string(ERROR_VALIDATION_MSG.string('search'))),
	page: pipe(
		any(),
		transform((input) => parseInt(input, 10)),
		number(ERROR_VALIDATION_MSG.number('Page')),
		minValue(0, ERROR_VALIDATION_MSG.minValue('Page', 0))
	),
	perPage: pipe(
		any(),
		transform((input) => parseInt(input, 10)),
		number(ERROR_VALIDATION_MSG.number('Per Page')),
		minValue(5, ERROR_VALIDATION_MSG.minValue('Per Page', 10))
	)
});

export type TGetJobValidation = InferOutput<typeof getJobValidation>;

const getJobEnvValidation = object({
	page: pipe(
		any(),
		transform((input) => parseInt(input, 10)),
		number(ERROR_VALIDATION_MSG.number('Page')),
		minValue(0, ERROR_VALIDATION_MSG.minValue('Page', 0))
	),
	perPage: pipe(
		any(),
		transform((input) => parseInt(input, 10)),
		number(ERROR_VALIDATION_MSG.number('Per Page')),
		minValue(5, ERROR_VALIDATION_MSG.minValue('Per Page', 10))
	)
});
export type TGetJobEnvValidation = InferOutput<typeof getJobEnvValidation>;

const getJobComboBoxPilihCabangValidation = object({
	server: string(ERROR_VALIDATION_MSG.string('server'))
});

export type TGetJobComboBoxPilihCabangValidation = InferOutput<
	typeof getJobComboBoxPilihCabangValidation
>;
export enum TipeRuntimePipelineEnum {
	docker = 'docker',
	pm2 = 'pm2',
	artifact = 'artifact',
	dbmysql = 'Db-mysql',
	website = 'website'
}
export enum JenisServerEnum {
	production = 'production',
	sandbox = 'sandbox'
}
const postJobValidation = object({
	name: string(ERROR_VALIDATION_MSG.string('name')),
	branch: string(ERROR_VALIDATION_MSG.string('branch')),
	app_port: number(ERROR_VALIDATION_MSG.number('app_port')),
	app_path: string(ERROR_VALIDATION_MSG.string('app_path')),
	jenis_server: enum_(
		JenisServerEnum,
		ERROR_VALIDATION_MSG.string('jenis_server')
	),
	url_repo: string(ERROR_VALIDATION_MSG.string('url_repo')),
	cabang: array(number(ERROR_VALIDATION_MSG.number('cabang'))),
	env: array(number(ERROR_VALIDATION_MSG.number('env'))),
	tipe_runtime_pipeline: enum_(TipeRuntimePipelineEnum)
});

export type TPostJobValidation = InferOutput<typeof postJobValidation>;

export default {
	getJobValidation,
	getJobEnvValidation,
	getJobComboBoxPilihCabangValidation,
	postJobValidation
};
