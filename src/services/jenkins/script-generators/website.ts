import mysqlConnection from '@root/libs/config/mysqlConnection';
import {
	checkoutGit,
	createDataCabang,
	declarativePostActions
} from './utility';

export async function deployWebsite(jobId: number) {
	const host = '${HOST_IMG_REGISTRY}';
	const cabangname = '${cabang.name}';
	const jobname = '${JOB_NAME}';
	const tokensecret = '${TOKEN_SECRET}';
	const cabangport = '${cabang.port}';

	let script_deploy = ` stage('Build and Deploy') {
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
  
                              stage("$cabang.name | Build docker image and Push Artifact") {
                                   sh "rm -f .env"`;
	const queryStrEnvIsiData =
		'SELECT nama_env,CONCAT(\'${cabang.\',nama_variabel,\'}\') AS isidata FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE nama_cabang!=\'semua\' and id_job=? GROUP BY nama_env';
	const resultEnvIsiData: any[] = await mysqlConnection.raw(
		queryStrEnvIsiData,
		[jobId]
	);
	for (const data of resultEnvIsiData) {
		script_deploy +=
			'\n                                     ' +
			`sh "echo ${data.nama_env}=${data.isidata} >> .env" `;
	}

	script_deploy += `
                                  sh "docker build -t ${host}/${cabangname}/${jobname} . --build-arg GITHUB_TOKEN=${tokensecret}"
                                  sh "docker push ${host}/${cabangname}/${jobname}:latest"
                              }
                               stage("$cabang.name | Pull Image and Deploy"){
                                  sshCommand remote: remote, command: "docker pull ${host}/${cabangname}/${jobname}:latest"
                                  sshCommand remote: remote, command: "docker rm -f ${jobname}", failOnError: false
                                  sshCommand remote: remote, command: """docker run -d \\
                                      --name ${jobname} \\
                                      --restart=always \\
                                      -p ${cabangport}:80 \\
                                      ${host}/${cabangname}/${jobname}:latest
                                  """
                              
                                  // remove image unused
                                  sshCommand remote: remote, command: "docker image prune -f", failOnError: false
                              }
                             
                           }
                       }
                   }
               }
             `;

	return script_deploy;
}
export async function createPipelineSingleScriptWebsite(dataJob: Entity.Job) {
	const checkoutGitScript = checkoutGit(dataJob.branch, dataJob.url_repo);
	const deploy = await deployWebsite(dataJob.id);
	const declarativePostActionsScript = declarativePostActions();
	const data_cabang = await createDataCabang(
		dataJob.id,
		dataJob.cabang,
		dataJob.jenis_server,
		dataJob.app_path
	);
	const xmlData = `
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
               ${deploy}
          }
        }
          ${declarativePostActionsScript}
      }
      
   `;

	return xmlData;
}
