import mysqlConnection from '@root/libs/config/mysqlConnection';
import {
	checkoutGit,
	createDataCabang,
	declarativePostActions
} from './utility';

export function build_artifac() {
	const job_name = '${JOB_NAME}';
	const secrettoken = '${TOKEN_SECRET}';
	const host = '${HOST_IMG_REGISTRY}';
	return `stage('Build And Push Image') {
            steps {
                sh "docker build -t ${host}/${job_name} . --build-arg GITHUB_TOKEN=${secrettoken}"
                sh "docker push ${host}/${job_name}:latest"
            }
   } `;
}

export async function deploy_artifact(id: number, app_port: number) {
	const port = app_port;
	const secret = '${cabang.secret}';
	const job_name = '${JOB_NAME}';
	const host = '${HOST_IMG_REGISTRY}';

	let script_deploy = ` stage('Deploy Apps') {
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
  
                              stage("$cabang.name | Pull Registry Artifact") {
                                  sshCommand remote: remote, command: "docker pull ${host}/${job_name}:latest"
                              }
                              stage("$cabang.name | run container") {
                                  sshCommand remote: remote, command: "docker rm -f ${job_name}",failOnError: false 
                                  sshCommand remote: remote, command: """docker run -d \\\\
                                      --name ${job_name} \\\\
                                      --restart=always \\\\
                                      -p ${port}:8000 \\\\
                                      -e APP_PORT_HTTP=8000 \\\\
                                      -e NODE_ENV=development \\\\
                                      -e APP_NAME=${job_name} \\\\
                                      -e APP_SECRET_KEY=${secret} \\\\`;

	const queryStrEnvIsiData =
		'SELECT nama_env,CONCAT(\'${cabang.\',nama_variabel,\'}\') AS isidata FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE nama_cabang!=\'semua\' and id_job=? GROUP BY nama_env';
	const resultEnvIsiData: any[] = await mysqlConnection.raw(
		queryStrEnvIsiData,
		[id]
	);
	for (const data of resultEnvIsiData) {
		script_deploy += '\n' + `-e ${data.nama_env}=${data.isidata} \\\\`;
	}

	const queryStrJobEnv =
		'SELECT nama_env,value_env FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE nama_cabang=\'semua\' and id_job=? GROUP BY nama_env';
	const resultStrJobEnv: any[] = await mysqlConnection.raw(queryStrJobEnv, [
		id
	]);
	for (const data of resultStrJobEnv) {
		script_deploy += '\n' + `-e ${data.nama_env}=${data.value_env} \\\\`;
	}

	script_deploy += `\n ${host}/${job_name}:latest
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

	return script_deploy;
}

export async function createPipelineSingleScriptArtifact(dataJob: Entity.Job) {
	const checkoutGitScript = checkoutGit(dataJob.branch, dataJob.url_repo);
	const build = build_artifac();

	const deploy = await deploy_artifact(dataJob.id, dataJob.app_port);
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
              TOKEN_SECRET = credentials('193dd6e9-4d6d-4746-bb4b-723285acbf02') 
              HOST_IMG_REGISTRY = 'asia-southeast2-docker.pkg.dev/indigo-proxy-293308/knitto'
            }
      
          stages {
                ${checkoutGitScript}
                ${build}
                 ${deploy}
            }
          }
            ${declarativePostActionsScript}
        }
     `;
	return script;
}
