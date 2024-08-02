// Membuat pipeline baru di Jenkins
const tabel = require("../../conn/tabel");

const job_name = "${JOB_NAME}";
const host = "${HOST_IMG_REGISTRY}";
const secrettoken = "${TOKEN_SECRET}";
const jobname = "${JOB_NAME}.tar.gz";

const { create_datacabang, chekout_git } = require("./utility");
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

async function deploy_artifact(datajob) {
  const cabangbackend = "${cabang.backendUrl}";
  const cabangnameapp = "${cabang.nameApp}";
  const host = "${HOST_IMG_REGISTRY}";
  const cabangname = "${cabang.name}";
  const jobname = "${JOB_NAME}";
  const tokensecret = "${TOKEN_SECRET}";
  const cabangport = "${cabang.port}";

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
                                 sh "rm -f .env"

                                // looping env
                                sh "echo VITE_BACKEND_URL=${cabangbackend} >> .env"
                                sh "echo VITE_APP_NAME=${cabangnameapp} >> .env"

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

async function create_pipelinesinglescriptwebsite(datajob) {
  const chekoutgit = chekout_git(datajob);
  const deploy = await deploy_artifact(datajob);
  const data_cabang = await create_datacabang(datajob);
  console.log("dt cabang", data_cabang);
  let xmlData = "";

  xmlData = `${header}
     ${data_cabang}
      pipeline {
         agent any
          environment {
            TOKEN_SECRET = credentials('193dd6e9-4d6d-4746-bb4b-723285acbf02') 
            HOST_IMG_REGISTRY = 'asia-southeast2-docker.pkg.dev/indigo-proxy-293308/knitto'
          }
    
        stages {
              ${chekoutgit}
               ${deploy}
          }
        }
      }
      ${footer}
   `;

  return xmlData;
}

module.exports = {
  create_pipelinesinglescriptwebsite: create_pipelinesinglescriptwebsite,
};
