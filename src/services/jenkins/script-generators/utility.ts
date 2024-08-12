import mysqlConnection from '@root/libs/config/mysqlConnection';

export async function createDataCabang(
	id: number,
	cabang: string,
	jenisServer: string,
	appPath: string
): Promise<string> {
	let scriptCabang = 'def CABANG = [';

	if (cabang === 'SEMUA') {
		const queryStrCabang = 'select * from cabang where tipe_cabang=? ';
		const resCabang: any[] = await mysqlConnection.raw(queryStrCabang, [
			jenisServer
		]);
		const queryStrJobEnvSemua =
			'SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=\'semua\'';

		const resJobEnvSemua: any[] = await mysqlConnection.raw(
			queryStrJobEnvSemua,
			[id]
		);
		for (let index = 0; index < resCabang.length; index++) {
			const element = resCabang[index];

			scriptCabang += `[
            name: "${element.name}",
            ip: "${element.ip_address}",
            credentialId: "${element.credentialid}", 
            appPath: "${appPath}",
            \n`;

			const queryStrJobEnv =
				'SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=? and nama_cabang = \'semua\' ';

			const resJobEnv: any[] = await mysqlConnection.raw(queryStrJobEnv, [
				id,
				element.name
			]);

			for (const data of resJobEnv) {
				scriptCabang += `${data.nama_variabel}: "${data.value_env}", \n`;
			}

			for (const data of resJobEnvSemua) {
				scriptCabang += `${data.nama_variabel}: "${data.value_env}", \n`;
			}

			scriptCabang += '],';
		}

		scriptCabang += ']';
	} else {
		const queryStrJobCabang =
			'select * from cabang join job_cabang on cabang.id = job_cabang.id_cabang where id_job=? ';

		const resJobCabang: any[] = await mysqlConnection.raw(queryStrJobCabang, [
			id
		]);

		for (let index = 0; index < resJobCabang.length; index++) {
			const element = resJobCabang[index];

			scriptCabang += `[
            name: "${element.name}",
            ip: "${element.ip_address}",
            credentialId: "${element.credentialid}", 
            appPath: "${appPath}",
            \n`;

			const queryStrJobEnv =
				'SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=?  ';

			const resJobEnv: any[] = await mysqlConnection.raw(queryStrJobEnv, [
				id,
				element.name
			]);
			for (const data of resJobEnv) {
				scriptCabang += `${data.nama_variabel}: "${data.value_env}", \n`;
			}

			scriptCabang += '],';
		}
	}
	return scriptCabang;
}

export function checkoutGit(branch: string, url_repo: string): string {
	return `stage('Checkout git') {
          steps {
             git branch: '${branch}', 
             credentialsId: 'github-knitto', 
             url: '${url_repo}' 
          }
     }`;
}

export const headerXML = `<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <description></description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.92">
    <script>`;

export const footerXML = ` </script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>`;
