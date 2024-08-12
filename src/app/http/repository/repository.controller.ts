import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import { fetchGithubRepos } from '@root/libs/helpers/fetch';
import { TRepositoryValidation } from './repository.request';
import RepositoryRepository from '@root/repositories/master-data/Repository.repository';
import { githubConfig } from '@root/libs/config';

const githuburl = githubConfig.URL;
const apiToken = githubConfig.API_TOKEN;
const username = githubConfig.USERNAME;

export const repositoryFetch: TRequestFunction = async () => {
	const element = await fetchGithubRepos(githuburl, username, apiToken, 1, 350);
	for (const repo of element) {
		if (repo.name.substring(0, 3) != 'ksm') {
			const repos: any = await mysqlConnection.raw(
				'SELECT * FROM repository WHERE name = ?',
				[repo.name]
			);
			if (repos.length == 0) {
				await mysqlConnection.transaction(async (trx) => {
					await trx.raw(
						'insert into repository values(null,now(),?,?,0,"","AKTIF")',
						[repo.name, repo.html_url]
					);
				});
			}
		}
	}
	return { message: 'Successfully' };
};

export const repositoryFindAll: TRequestFunction = async (req) => {
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
