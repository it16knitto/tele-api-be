import {
	any,
	array,
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

const getGroupJobValidation = object({
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

export type TGetGroupJobValidation = InferOutput<typeof getGroupJobValidation>;

const postGroupJobValidation = object({
	name: string(ERROR_VALIDATION_MSG.string('name')),
	jobs: array(number(ERROR_VALIDATION_MSG.number('jobs')))
});

export type TPostGroupJobValidation = InferOutput<
	typeof postGroupJobValidation
>;

export default {
	getGroupJobValidation,
	postGroupJobValidation
};
