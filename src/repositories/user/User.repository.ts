import { EntityRepo } from '@knittotextile/knitto-mysql';
export default class UserRepository extends EntityRepo<UserEntity> {
	tableName = 'user';

	async findOneByUsername(username: string) {
		const user = await this.dbConnector
			.raw<object>(
			`SELECT * FROM ${this.tableName} WHERE username = ? LIMIT 1`,
			[username]
		)
			.then((result) => {
				return result[0];
			});
		return user;
	}
}
