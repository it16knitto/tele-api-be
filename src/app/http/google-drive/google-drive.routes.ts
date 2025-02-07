import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import {
	googleDriveDeleteFile,
	googleDriveRenameFile,
	googleDriveUploadFile,
	googleDriveGetOneFile,
	googleDriveReadFile,
	googleDriveDownloadFile,
	googleDriveShareFileFolder,
	googleDriveUnShareFileFolder,
	googleDriveCopyFileFolder,
	googleDriveMoveFileFolder,
	googleDriveListFilesAndFolders,
	googleDriveRetrieveOnlyFile
} from './google-drive.controller';
import { requestHandler, Router } from '@knittotextile/knitto-http';
const storage = multer.diskStorage({
	destination: function (_, __, cb) {
		cb(null, 'uploads/');
	},
	filename: function (_, file, cb) {
		const uniqueSuffix =
			Date.now() + '-' + crypto.randomBytes(4).toString('hex');
		cb(
			null,
			file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
		);
	}
});
const upload = multer({ storage });
const googleDriveRouter = Router();
googleDriveRouter.get(
	'/google-drive/list-files-folders',
	requestHandler(googleDriveListFilesAndFolders)
);
googleDriveRouter.post(
	'/google-drive/upload-file',
	upload.single('file'),
	requestHandler(googleDriveUploadFile)
);
googleDriveRouter.delete(
	'/google-drive/delete/:file_id',
	requestHandler(googleDriveDeleteFile)
);
googleDriveRouter.put(
	'/google-drive/rename/:file_id',
	requestHandler(googleDriveRenameFile)
);
googleDriveRouter.get(
	'/google-drive/get-one/:file_id',
	requestHandler(googleDriveGetOneFile)
);
googleDriveRouter.get(
	'/google-drive/read/:file_id',
	requestHandler(googleDriveReadFile)
);
googleDriveRouter.get(
	'/google-drive/download/:file_id',
	googleDriveDownloadFile
);
googleDriveRouter.post(
	'/google-drive/share/:file_id',
	requestHandler(googleDriveShareFileFolder)
);
googleDriveRouter.post(
	'/google-drive/unshare/:file_id',
	requestHandler(googleDriveUnShareFileFolder)
);
googleDriveRouter.post(
	'/google-drive/copy/:file_id',
	requestHandler(googleDriveCopyFileFolder)
);
googleDriveRouter.post(
	'/google-drive/move/:file_id',
	requestHandler(googleDriveMoveFileFolder)
);
googleDriveRouter.get(
	'/google-drive/files-list',
	requestHandler(googleDriveRetrieveOnlyFile)
);

export default googleDriveRouter;
