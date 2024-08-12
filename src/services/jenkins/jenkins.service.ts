import { jenkinsConfig } from '@root/libs/config';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import { createPipelineScriptDocker } from './script-generators/docker';
import { createPipelineScriptPm2 } from './script-generators/pm2';
import { createPipelineSinglesDB } from './script-generators/dbmysql';
import { createPipelineSingleScriptWebsite } from './script-generators/website';
import { createPipelineSingleScriptArtifact } from './script-generators/artifact';

const jenkinsUrl = jenkinsConfig.URL;
const apiToken = jenkinsConfig.API_TOKEN;
const username = jenkinsConfig.USERNAME;

export const jenkinsGeneratePipelineScript = async (
	id_job: number,
	tipe_runtime_pipeline: string
) => {
	let script: string;
	try {
		const dataJob = await mysqlConnection
			.raw('SELECT * FROM job WHERE id = ?', [id_job])
			.then((result) => result[0] || null);

		if (!dataJob) {
			throw 'Error data job not found';
		}
		switch (tipe_runtime_pipeline) {
			case 'docker':
				script = await createPipelineScriptDocker(dataJob);
				break;
			case 'pm2':
				script = await createPipelineScriptPm2(dataJob);
				break;
			case 'artifact':
				script = await createPipelineSingleScriptArtifact(dataJob);
				break;
			case 'Db-mysql':
				script = await createPipelineSinglesDB(dataJob);
				break;
			case 'website':
				script = await createPipelineSingleScriptWebsite(dataJob);
				break;
		}
		return script;
	} catch (e) {
		throw e;
	}
};

export const jenkinsPostCreateJobItem = async (
	xmlData: string,
	pipelineName: string
) => {
	try {
		const response = await fetch(
			`${jenkinsUrl}/createItem?name=${pipelineName}&mode=Pipeline`,
			{
				method: 'POST',
				headers: {
					Authorization: `Basic ${Buffer.from(
						username + ':' + apiToken
					).toString('base64')}`,
					'Content-Type': 'application/xml'
				},
				body: xmlData
			}
		);
		if (response.ok) {
			return true;
		} else {
			return false;
		}
	} catch (e) {
		throw e;
	}
};

export const jenkinsRunJobItem = async (pipelineName: string) => {
	try {
		const response = await fetch(`${jenkinsUrl}/job/${pipelineName}/build`, {
			method: 'POST',
			headers: {
				Authorization: `Basic ${Buffer.from(username + ':' + apiToken).toString(
					'base64'
				)}`
			}
		});

		if (response.ok) {
			return true;
		} else {
			throw new Error(`Failed to run job: ${pipelineName}`);
		}
	} catch (e) {
		throw e;
	}
};

export const jenkinsStatusJobItem = async (pipelineName: string) => {
	try {
		const response = await fetch(
			`${jenkinsUrl}/job/${pipelineName}/lastBuild/api/json`,
			{
				method: 'GET',
				headers: {
					Authorization: `Basic ${Buffer.from(
						username + ':' + apiToken
					).toString('base64')}`
				}
			}
		);
		return response.json();
	} catch (e) {
		throw e;
	}
};

export const jenkinsDeleteJobItem = async (pipelineName: string) => {
	try {
		const response = await fetch(`${jenkinsUrl}/job/${pipelineName}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Basic ${Buffer.from(username + ':' + apiToken).toString(
					'base64'
				)}`
			}
		});
		return response;
	} catch (e) {
		throw e;
	}
};
