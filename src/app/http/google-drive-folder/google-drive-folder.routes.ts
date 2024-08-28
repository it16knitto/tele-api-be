import { requestHandler, Router } from '@knittotextile/knitto-http';
import {
	googleDriveFolderCreate,
	googleDriveFolderGetAll
} from './google-drive-folder.controller';

const googleDriveFolderRouter = Router();
googleDriveFolderRouter.get(
	'/google-drive/folders',
	requestHandler(googleDriveFolderGetAll)
);
googleDriveFolderRouter.post(
	'/google-drive/folders',
	requestHandler(googleDriveFolderCreate)
);
export default googleDriveFolderRouter;
