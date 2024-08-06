import { TRequestFunction } from '@knittotextile/knitto-http';
import { APP_NAME, APP_VERSION } from '@root/libs/config';
import { TSampleValidation } from './home.request';

export const home: TRequestFunction = async () => {
	return {
		result: { APP_NAME, APP_VERSION }
	};
};

export const sampleValidation: TRequestFunction = async (req) => {
	const {name} = req.query as TSampleValidation;

	return { result: { name } };
};

