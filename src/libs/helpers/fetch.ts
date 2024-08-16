import { URLSearchParams } from 'url';

export async function fetchGithubRepos(
	githuburl: string,
	username: string,
	apiToken: string,
	page: number,
	per_page: number
) {
	const url = new URL(`${githuburl}/orgs/${username}/repos`);
	const params = new URLSearchParams({
		type: 'all',
		page: page.toString(),
		per_page: per_page.toString()
	});
	url.search = params.toString();

	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiToken}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'YourAppName'
		}
	});
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data;
}

export async function fetchGithubBranch(
	githuburl: string,
	apiToken: string,
	username: string,
	repositoryName: string
) {
	const url = new URL(
		`${githuburl}/repos/${username}/${repositoryName}/branches`
	);
	const response = await fetch(url.toString(), {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiToken}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'YourAppName'
		}
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
	return data;
}
