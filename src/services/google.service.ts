import { google } from 'googleapis';
import path from 'path';
import * as fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
export const SERVICE_ACCOUNT_FILE = path.join(
	__dirname,
	'../../storage/cache/google-drive-service-account.json'
);

// Authenticate using the service account
export const googleDriveAuth = new google.auth.GoogleAuth({
	keyFile: SERVICE_ACCOUNT_FILE,
	scopes: SCOPES
});
export const googleDrive = google.drive({
	version: 'v3',
	auth: googleDriveAuth
});

export const googleDriveCreateCredential = async () => {
	const serviceAccountData = {
		type: process.env.GOOGLE_DRIVE_TYPE,
		project_id: process.env.GOOGLE_DRIVE_PROJECT_ID,
		private_key_id: process.env.GOOGLE_DRIVE_PRIVATE_KEY_ID,
		private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY,
		client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
		client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
		auth_uri: process.env.GOOGLE_DRIVE_AUTH_URI,
		token_uri: process.env.GOOGLE_DRIVE_TOKEN_URI,
		auth_provider_x509_cert_url:
			process.env.GOOGLE_DRIVE_AUTH_PROVIDER_X509_CERT_URL,
		client_x509_cert_url: process.env.GOOGLE_DRIVE_CLIENT_X509_CERT_URL,
		universe_domain: process.env.GOOGLE_DRIVE_UNIVERSE_DOMAIN
	};

	fs.writeFileSync(
		SERVICE_ACCOUNT_FILE,
		JSON.stringify(serviceAccountData, null, 2)
	);
};
