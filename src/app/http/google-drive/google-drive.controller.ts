import { InvalidParameterException } from '@knittotextile/knitto-core-backend/dist/CoreException';
import { ExpressType, TRequestFunction } from '@knittotextile/knitto-http';
import { googleDrive } from '@root/services/google.service';
import { drive_v3 } from 'googleapis';
import fs from 'fs';

export const googleDriveListFilesAndFolders: TRequestFunction = async (req) => {
	const { folder_id, page_size = '10', page_token } = req.query;
	const folderId = folder_id ? folder_id : '0AAYg9y915Se9Uk9PVA';
	const { data } = await googleDrive.files.list({
		pageSize: parseInt(page_size as string),
		pageToken: page_token as string | undefined,
		fields:
			'nextPageToken, files(id, name, mimeType, parents, size, fileExtension, permissions(id, emailAddress, role), iconLink)',
		q: `'${folderId}' in parents`
	});

	// Get total count of files in the folder
	const totalCountResponse = await googleDrive.files.list({
		q: `'${folderId}' in parents`,
		fields: 'files(id)',
		pageSize: 1000 // Set a large page size to get all files (adjust if needed)
	});

	const totalCount = totalCountResponse.data.files?.length || 0;

	return {
		result: {
			data: data.files,
			nextPageToken: data.nextPageToken,
			totalCount
		}
	};
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
		const { data } = await googleDrive.files.get({
			fileId: file_id
		});

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

		res.setHeader('Content-Disposition', `attachment; filename="${data.name}"`);
		res.setHeader('Content-Type', response.headers['content-type']);

		return response.data.pipe(res);
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

export const googleDriveCopyFileFolder: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const { folder_id } = req.body;
	// Get the file details to retrieve the name
	const fileDetails = await googleDrive.files.get({
		fileId: file_id,
		fields: 'name'
	});

	const fileName = fileDetails.data.name;

	const response = await googleDrive.files.copy({
		fileId: file_id,
		requestBody: {
			name: fileName,
			parents: [folder_id]
		}
	});
	return { result: response };
};

export const googleDriveMoveFileFolder: TRequestFunction = async (req) => {
	const { file_id } = req.params;
	const { folder_id } = req.body;

	// Get the current parent folders
	const file = await googleDrive.files.get({
		fileId: file_id,
		fields: 'parents'
	});

	const currentParents = file.data.parents?.join(',') || '';

	// Move the file to the new folder
	const response = await googleDrive.files.update({
		fileId: file_id,
		addParents: folder_id,
		removeParents: currentParents,
		fields: 'id, parents'
	});

	return { result: response };
};

export const googleDriveRetrieveOnlyFile: TRequestFunction = async (req) => {
	const { folder_id } = req.query;
	const folderId = folder_id ? folder_id : '0AAYg9y915Se9Uk9PVA';
	const response = await googleDrive.files.list({
		fields:
			'files(id, name, mimeType, parents, size, fileExtension, permissions(id, emailAddress, role), iconLink)',
		q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder'`
	});
	return { result: response.data.files };
};
