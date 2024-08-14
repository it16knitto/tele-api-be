import mysqlConnection from '@root/libs/config/mysqlConnection';
import {
	checkoutGit,
	createDataCabang,
	declarativePostActions
} from './utility';

export function buildDocker(): string {
	let jobname = '${JOB_NAME}';
	let secrettoken = '${TOKEN_SECRET}';
	return `stage('Build') {
          steps {
           sh "docker build -t ${jobname} . --build-arg GITHUB_TOKEN=${secrettoken}"
          }
     }`;
}

export function compressDocker(): string {
	const jobnameTarGz: string = '${JOB_NAME}.tar.gz';
	const jobName: string = '${JOB_NAME}';
	return `stage('Compress docker image') {
          steps {
            sh "docker save ${jobName}:latest | gzip > ${jobnameTarGz}"
          }
     }`;
}
async function deployDocker(id: number, app_port: number): Promise<string> {
	const jobname: string = '${JOB_NAME}.tar.gz';
	const jobName: string = '${JOB_NAME}';
	const port: number = app_port;
	const secret: string = '${cabang.secret}';

	let scriptDeploy: string = `stage('Deploy') {
      steps {
                  script {
                      for (cabang in CABANG) {
                          withCredentials([sshUserPrivateKey(
                              credentialsId: cabang.credentialId,
                              keyFileVariable: "SSH_KEY",
                              usernameVariable: "SSH_USER",
                          )]) {
                              def remote = [: ]

                              remote.name = cabang.ip
                              remote.host = cabang.ip
                              remote.allowAnyHosts = true
                              remote.user = SSH_USER
                              remote.identityFile = SSH_KEY
                              remote.pty = true

                              stage("$cabang.name | remove existing compressed file") {
                                  sshRemove remote: remote, path: "${jobname}", failOnError: false
                              }
                              stage("$cabang.name | copy compressed file") {
                                  sshPut remote: remote, from: "${jobname}", into: '.'
                              }
                              stage("$cabang.name | docker load image") {
                                  sshCommand remote: remote, command: "docker load -i ${jobname}"
                                  sshRemove remote: remote, path: "${jobname}", failOnError: false
                              }
                              stage("$cabang.name | remove existing container") {
                                sshCommand remote: remote, command: "docker rm -f ${jobName}", failOnError: false
                              }
                              stage("$cabang.name | run container") {
                                  sshCommand remote: remote, command: """docker run -d \\\\
                                      --name ${jobName} \\\\
                                      --restart=always \\\\
                                      -p ${port}:8000 \\\\
                                      -e APP_PORT_HTTP=8000 \\\\
                                      -e NODE_ENV=development \\\\
                                      -e APP_NAME=${jobName} \\\\
                                      -e APP_SECRET_KEY=${secret} \\\\`;

	const queryStrEnv =
		'SELECT nama_env,CONCAT(\'${cabang.\',nama_variabel,\'}\') AS isidata FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE nama_cabang!=\'semua\' and id_job=? GROUP BY nama_env';
	const res: any[] = await mysqlConnection.raw(queryStrEnv, [id]);
	for (const data of res) {
		scriptDeploy += `\n-e ${data.nama_env}=${data.isidata} \\\\`;
	}

	const queryStrEnvIsi =
		'SELECT nama_env,value_env FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE nama_cabang=\'semua\' and id_job=? GROUP BY nama_env';
	const resultStrEnvIsi: any[] = await mysqlConnection.raw(queryStrEnvIsi, [
		id
	]);
	for (const data of resultStrEnvIsi) {
		scriptDeploy += `\n-e ${data.nama_env}=${data.value_env} \\\\`;
	}

	scriptDeploy += `\n ${jobName}:latest
                                  """
                              }
                              stage("$cabang.name | remove image unused") {
                                 sshCommand remote: remote, command: 'docker rmi $(docker images --filter "dangling=true" -q --no-trunc)', failOnError: false
                               }
                           }
                       }
                   }
               }
             `;

	return scriptDeploy;
}
export async function createPipelineScriptDocker(dataJob: Entity.Job) {
	const checkoutGitScript = checkoutGit(dataJob.branch, dataJob.url_repo);
	const build = buildDocker();
	const compress = compressDocker();
	const deploy = await deployDocker(dataJob.id, dataJob.app_port);
	const declarativePostActionsScript = declarativePostActions();
	const data_cabang = await createDataCabang(
		dataJob.id,
		dataJob.cabang,
		dataJob.jenis_server,
		dataJob.app_path
	);
	const script = `
    ${data_cabang}
     pipeline {
        agent any
        parameters {
            string(name: 'GROUP_JOB_ID', defaultValue: null, description: 'Group Job ID')
            string(name: 'WEBHOOK_URL', defaultValue: '', description: 'Webhook endpoint URL')
            string(name: 'RUN_TYPE', defaultValue: '', description: 'Webhook endpoint URL')
        }
         environment {
             def TOKEN_SECRET = credentials('193dd6e9-4d6d-4746-bb4b-723285acbf02') 
         }
   
       stages {
             ${checkoutGitScript}
             ${build}
             ${compress}
              ${deploy}
         }
       }
         ${declarativePostActionsScript}
     }
     
  `;

	return script;
}
