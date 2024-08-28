import { InvalidParameterException } from '@knittotextile/knitto-core-backend/dist/CoreException';
import { ExpressType, TRequestFunction } from '@knittotextile/knitto-http';
import { googleDrive } from '@root/services/google.service';
import { drive_v3 } from 'googleapis';
import fs from 'fs';

export const googleDriveListFiles: TRequestFunction = async (req) => {
	const { folder_id } = req.query;
	const folderId = folder_id ? folder_id : 'root';
	const { data } = await googleDrive.files.list({
		// fields: 'nextPageToken, files(*)'
		fields:
			'nextPageToken, files(id, name, mimeType, parents, size, fileExtension, permissions(id, emailAddress, role))',
		q: `'${folderId}' in parents`
	});
	return { result: data };
};

export const googleDriveUploadFile: TRequestFunction = async (req) => {
	const { folder_id } = req.body;
	if (!req.file) {
		throw new InvalidParameterException('No file uploaded.');
	}

	const folderId = folder_id ? folder_id : 'root';
	const fileName = req.file.originalname;
	const mimeType = req.file.mimetype;
	const listFiles = await googleDrive.files.list({
		q: `'${folderId}' in parents and name = '${fileName}'`,
		fields: 'files(id, name)'
	});

	const existingFile = listFiles.data.files && listFiles.data.files[0];
	let response: any;
	let method: 'update' | 'create' = 'create';
	if (existingFile) {
		// Update existing file
		response = await googleDrive.files.update({
			fileId: existingFile.id!,
			media: {
				mimeType: mimeType,
				body: fs.createReadStream(req.file.path)
			},
			fields: 'id, name'
		});
		method = 'update';
	} else {
		// Upload new file
		const fileMetadata: drive_v3.Schema$File = {
			name: fileName,
			mimeType: mimeType,
			parents: folderId ? [folderId] : [] // Specify the parent folder ID
		};

		response = await googleDrive.files.create({
			requestBody: fileMetadata,
			media: {
				mimeType: mimeType,
				body: fs.createReadStream(req.file.path)
			},
			fields: 'id, name'
		});
		method = 'create';
	}
	fs.unlinkSync(req.file.path);

	return { result: { method, ...response.data } };
};
export const googleDriveDeleteFile: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const response = await googleDrive.files.delete({
		fileId: file_id
	});
	return { result: response };
};

export const googleDriveRenameFile: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const { new_name } = req.body;
	const response = await googleDrive.files.update({
		fileId: file_id,
		requestBody: { name: new_name }
	});
	return { result: response };
};
export const googleDriveGetOneFile: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const { data } = await googleDrive.files.get({
		fileId: file_id
	});
	return { result: data };
};

export const googleDriveReadFile: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const response: any = await googleDrive.files.get(
		{
			fileId: file_id,
			alt: 'media'
		},
		{
			responseType: 'arraybuffer' // To handle different types of file content
		}
	);

	const text = Buffer.from(response.data, 'binary').toString('utf-8');

	return { result: { text } };
};
export const googleDriveDownloadFile = async (
	req: ExpressType.Request,
	res: ExpressType.Response
) => {
	try {
		const { file_id } = req.params;

		const response = await googleDrive.files.get(
			{
				fileId: file_id,
				alt: 'media' // This parameter is required to get the file content
			},
			{
				responseType: 'stream' // The response type must be a stream to handle file downloads
			}
		);

		// Set headers for file download
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="${
				response.headers['content-disposition'].split('filename=')[1]
			}"`
		);
		res.setHeader('Content-Type', response.headers['content-type']);

		return res.send(response.data);
	} catch (e) {
		return res.status(500).send('Error downloading file');
	}
};
export const googleDriveShareFileFolder: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const { email, role } = req.body;
	const permissions = {
		type: 'user',
		role: role, // 'reader' or 'writer'
		emailAddress: email
	};

	const response = await googleDrive.permissions.create({
		fileId: file_id,
		requestBody: permissions,
		fields: 'id' // Fields to return after creating permission
	});

	return { result: response };
};
export const googleDriveUnShareFileFolder: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const { email } = req.body;
	const res = await googleDrive.permissions.list({
		fileId: file_id,
		fields: 'permissions(id, emailAddress)'
	});
	let permissionId = null;
	const permissions = res.data.permissions;
	if (permissions) {
		const permission = permissions.find((perm) => perm.emailAddress === email);
		if (permission) {
			permissionId = permission.id || null;
		}
	}
	if (!permissionId) {
		throw new InvalidParameterException('Permission not found');
	}
	const response = await googleDrive.permissions.delete({
		fileId: file_id,
		permissionId
	});
	return { result: response };
};
