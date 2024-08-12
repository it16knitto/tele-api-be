import { TRequestFunction } from '@knittotextile/knitto-http';
import { TLoginValidation } from './auth.request';
import { InvalidParameterException } from '@knittotextile/knitto-core-backend/dist/CoreException';
import mysqlConnection from '@root/libs/config/mysqlConnection';
import CreateCredentialJWT from '@root/services/CreateCredentialJWT';
import bcryptjs from 'bcryptjs';
import UserRepository from '@root/repositories/User.repository';

export const authLogin: TRequestFunction = async (req) => {
	const { username, password } = req.body as TLoginValidation;
	const userRepository = new UserRepository(mysqlConnection);
	const user = await userRepository.findOneByUsername(username);
	if (!user) {
		throw new InvalidParameterException('Username or Password not valid');
	}
	const isPasswordValid = await bcryptjs.compare(password, user.password);
	if (!isPasswordValid) {
		throw new InvalidParameterException('Username or Password not valid');
	}
	try {
		const token = await new CreateCredentialJWT(user.id).generateToken();
		return { result: { token } };
	} catch (error) {
		throw new Error(error as string);
	}
};
export const authMe: TRequestFunction = async (req: any) => {
	const user = await mysqlConnection
		.raw('SELECT id, username ,fullname FROM user WHERE id = ? limit 1', [
			req.user.id
		])
		.then((result) => {
			return result[0];
		});
	return { result: user };
};
