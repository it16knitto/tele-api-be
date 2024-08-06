import {
	any,
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

const getCabangValidation = object({
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
export type TCabangValidation = InferOutput<typeof getCabangValidation>;

export default {
	getCabangValidation
};
