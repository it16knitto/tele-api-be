import { TRequestFunction } from '@knittotextile/knitto-http';
import { googleDrive } from '@root/services/google.service';
import { drive_v3 } from 'googleapis';

export const googleDriveFolderGetAll: TRequestFunction = async (req) => {
	const { folder_id } = req.query;
	const folderId = folder_id ? folder_id : 'root';
	const { data } = await googleDrive.files.list({
		q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
		fields:
			'files(id, name, mimeType, parents, createdTime, modifiedTime,  iconLink, size)'
	});
	return { result: data };
};
export const googleDriveFolderCreate: TRequestFunction = async (req) => {
	const { name, folder_id } = req.body;
	const fileMetadata: drive_v3.Schema$File = {
		name,
		mimeType: 'application/vnd.google-apps.folder',
		parents: folder_id ? [folder_id] : []
	};
	const response = await googleDrive.files.create({
		requestBody: fileMetadata,
		fields: 'id'
	});
	return { result: response };
};
