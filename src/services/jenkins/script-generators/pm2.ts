import {
	checkoutGit,
	createDataCabang,
	declarativePostActions
} from './utility';

export async function buildPm2() {
	return `stage('Install npm dependencies') {
              steps {
                sh 'npm install --silent'
              }
         }`;
}

export async function compressPm2() {
	const jobname = '${JOB_NAME}.tar.gz';
	return `stage('Compress') {
          steps {
           tar(
                      file: "${jobname}",
                      compress: true,
                      overwrite: true,
                      exclude: '.git',
                  )
          }
     }`;
}
function deployPm2() {
	const jobname = '${JOB_NAME}.tar.gz';
	return `stage('Deploy') {
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
                                  sshPut remote: remote, from:  "${jobname}", into: '.'
                              }
                              stage("$cabang.name | ensure app folder exists") {
                                  sshCommand remote: remote, command: "mkdir -p $cabang.appPath"
                              }
                              stage("$cabang.name | ensure ownership") {
                                  sshCommand remote: remote, command: "sudo chown -R $SSH_USER $cabang.appPath", sudo: true
                              }
                              stage("$cabang.name | ensure permission") {
                                  sshCommand remote: remote, command: "sudo chmod -R 777 $cabang.appPath", sudo: true
                              }
                              stage("$cabang.name | extract") {
                                  sshCommand remote: remote, command: "tar --overwrite -xzf  ${jobname} -C $cabang.appPath"
                                  sshRemove remote: remote, path:  "${jobname}", failOnError: false
                              }
                              stage("$cabang.name | cd app") {
                                  sshCommand remote: remote, command: "cd $cabang.appPath"
                              }
                              stage("$cabang.name | restart app") {
                                  sshCommand remote: remote, command: "pm2 restart ecosystem.config.js"
                              }
                          }
                      }
                  }
          }
     }`;
}

export async function createPipelineScriptPm2(dataJob: Entity.Job) {
	const checkoutGitScript = checkoutGit(dataJob.branch, dataJob.url_repo);
	const build = buildPm2();
	const compress = compressPm2();
	const deploy = deployPm2();
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
       stages {
             ${checkoutGitScript}
             ${build}
             ${compress}
              ${deploy}
         }
            ${declarativePostActionsScript}
       }
  `;

	return script;
}
