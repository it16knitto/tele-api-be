import { any, InferOutput, number, object, pipe } from 'valibot';
import { ERROR_VALIDATION_MSG } from '@root/libs/config/errorMessage';

const getBranchComboBoxValidation = object({
	id_repository: pipe(
		any(),
		number(ERROR_VALIDATION_MSG.number('repository_id'))
	)
});
export type TGetBranchComboBoxValidation = InferOutput<
	typeof getBranchComboBoxValidation
>;
