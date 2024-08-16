import { TRequestFunction } from '@knittotextile/knitto-http';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import { fetchGithubBranch, fetchGithubRepos } from '@root/libs/helpers/fetch';
import { TRepositoryValidation } from './repository.request';
import RepositoryRepository from '@root/repositories/master-data/Repository.repository';
import { githubConfig } from '@root/libs/config';

const githuburl = githubConfig.URL;
const apiToken = githubConfig.API_TOKEN;
const username = githubConfig.USERNAME;

export const repositoryFetch: TRequestFunction = async () => {
	const repositories = await fetchGithubRepos(
		githuburl,
		username,
		apiToken,
		1,
		350
	);
	for (const repo of repositories) {
		if (repo.name.substring(0, 3) != 'ksm') {
			const repos: any = await mysqlConnection.raw(
				'SELECT * FROM repository WHERE name = ?',
				[repo.name]
			);
			await mysqlConnection.transaction(async (trx) => {
				let repoId: number;
				if (repos.length == 0) {
					const insertRepo: any = await trx.raw(
						'insert into repository values(null,now(),?,?,0,"","AKTIF")',
						[repo.name, repo.html_url]
					);
					repoId = insertRepo.insertId;
				} else {
					repoId = repos[0].id;
				}

				const branches = await fetchGithubBranch(
					githuburl,
					apiToken,
					username,
					repo.name
				);

				for (const branch of branches) {
					const branchdata: any[] = await trx.raw(
						'SELECT id FROM branch WHERE name = ? AND id_repository = ?',
						[branch.name, repoId]
					);

					if (branchdata.length === 0) {
						await mysqlConnection.raw(
							'INSERT INTO branch (id, create_date, id_repository, name, branch_tipe) VALUES (null, ?, ?, ?, \'sandbox\' )',
							[new Date(), repoId, branch.name]
						);
					}
				}
			});
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

export const repositoryFindComboBox: TRequestFunction = async () => {
	const data = await mysqlConnection.raw(
		'select id, name, url from repository'
	);
	return { result: data };
};
