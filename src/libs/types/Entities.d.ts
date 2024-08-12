declare namespace Entity {
	interface Cabang {
		id?: number;
		create_date?: string;
		name?: string;
		ip_address?: string;
		credentialid?: string;
		tipe_cabang?: string;
	}

	interface Env {
		id?: number;
		create_date?: string;
		catatan_env?: string;
		nama_env?: string;
		value_env?: string;
		nama_cabang?: string;
		nama_variabel?: string;
		script?: string;
	}

	interface Repository {
		id?: number;
		create_date?: string;
		name?: string;
		url?: string;
		app_port?: number;
		app_path?: string;
		status_aktif?: string;
	}

	interface User {
		id?: number;
		username?: string;
		fullname?: string;
		password?: string;
	}

	interface Job {
		id?: number;
		create_date?: Date;
		name?: string;
		cabang?: string;
		branch?: string;
		app_port?: number;
		app_path?: string;
		jenis_server?: string;
		url_repo?: string;
		tipe_runtime?: string;
		job_name?: string;
	}

	interface JobCabang {
		id?: number;
		create_date?: Date;
		id_job?: number;
		id_cabang?: number;
	}

	interface JobEnv {
		id?: number;
		create_date?: Date;
		id_job?: number;
		id_env?: number;
	}
	interface GroupJob {
		id?: number;
		create_date?: Date;
		nama_job?: string;
		catatan?: string;
	}
	interface ListGroupJob {
		id?: number;
		create_date?: Date;
		id_job?: number;
		id_group?: number;
		stage_name?: string;
	}

	interface HistoryJob {
		id?: number;
		create_date?: Date;
		jenis_job?: string;
		jenis_transaksi?: string;
		id_user?: number;
		nama_job?: string;
	}
}
