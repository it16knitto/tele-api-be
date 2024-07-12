var tabel = require("../../conn/tabel");
const { create_datacabang, chekout_git } = require("../jenkins-api/utility");
const header = `<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <description></description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.92">
    <script>`;

const footer = ` </script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>`;

function build_pm2() {
  return `stage('Install npm dependencies') {
        steps {
          sh 'npm install --silent'
        }
   }`;
}

function compress_pm2() {
  const jobname = "${JOB_NAME}.tar.gz";
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

function deploy_pm2() {
  const jobname = "${JOB_NAME}.tar.gz";
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

async function create_pipelinescriptpm2(datajob) {
  const chekoutgit = chekout_git(datajob);
  const build = build_pm2();
  const compress = compress_pm2();
  const deploy = deploy_pm2();
  const data_cabang = await create_datacabang(datajob);
  const xmlData = `${header}
     ${data_cabang}
      pipeline {
        agent any
        stages {
              ${chekoutgit}
              ${build}
              ${compress}
               ${deploy}
          }
        }
      
      ${footer}
   `;

  return xmlData;
}

module.exports = {
  create_pipelinescriptpm2: create_pipelinescriptpm2,
};
