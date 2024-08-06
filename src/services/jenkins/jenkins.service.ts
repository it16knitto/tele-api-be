import { jenkinsConfig } from '@root/libs/config';
import mysqlConnection from '@root/libs/config/mysqlConnection';

class JenkinsService {
	private jenkinsUrl = jenkinsConfig.URL;
	private readonly apiToken = jenkinsConfig.API_TOKEN;
	private readonly username = jenkinsConfig.USERNAME;

	async createPipelineItem(
		id_job: number,
		tipe_runtime_pipeline: string,
		pipelinename: string
	) {
		let script: string;
		try {
			await mysqlConnection.raw(`SELECT * FROM job WHERE id = ${id_job}`);
			switch (tipe_runtime_pipeline) {
				case 'docker':
					break;
				case 'pm2':
					break;
				case 'artifact':
					break;
				case 'dbmysql':
					break;
				case 'website':
					break;
			}
			const response = await fetch(
				`${this.jenkinsUrl}/createItem?name=${pipelinename}&mode=Pipeline`,
				{
					method: 'POST',
					headers: {
						Authorization: `Basic ${Buffer.from(
							this.username + ':' + this.apiToken
						).toString('base64')}`,
						'Content-Type': 'application/xml'
					},
					body: script
				}
			);

			return response.json();
		} catch (e) {
			throw e;
		}
	}
}
export default JenkinsService;
