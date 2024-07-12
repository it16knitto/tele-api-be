// Membuat pipeline baru di Jenkins
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

function build_docker() {
  let jobname = "${JOB_NAME}";
  let secrettoken = "${TOKEN_SECRET}";
  return `stage('Build') {
        steps {
         sh "docker build -t ${jobname} . --build-arg GITHUB_TOKEN=${secrettoken}"
        }
   }`;
}

function compress_docker() {
  const jobname = "${JOB_NAME}.tar.gz";
  const job_name = "${JOB_NAME}";
  return `stage('Compress docker image') {
        steps {
          sh "docker save ${job_name}:latest | gzip > ${jobname}"
        }
   }`;
}

async function deploy_docker(datajob) {
  const { id, app_port } = datajob;
  const jobname = "${JOB_NAME}.tar.gz";
  const job_name = "${JOB_NAME}";
  const port = app_port;
  const secret = "${cabang.secret}";

  let script_deploy = ` stage('Deploy') {
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
                              sshCommand remote: remote, command: "docker rm -f ${job_name}", failOnError: false
                            }
                            stage("$cabang.name | run container") {
                                sshCommand remote: remote, command: """docker run -d \\\\
                                    --name ${job_name} \\\\
                                    --restart=always \\\\
                                    -p ${port}:8000 \\\\
                                    -e APP_PORT_HTTP=8000 \\\\
                                    -e NODE_ENV=development \\\\
                                    -e APP_NAME=${job_name} \\\\
                                    -e APP_SECRET_KEY=${secret} \\\\`;

  querystr = "SELECT nama_env,CONCAT('${cabang.',nama_variabel,'}') AS isidata FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE nama_cabang!='semua' and id_job=? GROUP BY nama_env";
  queryvalue = [id];
  await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
    onres.rows.forEach((data) => {
      console.log("ca", data);
      script_deploy += `\n` + `-e ${data.nama_env}=${data.isidata} \\\\`;
    });
  });

  querystr = "SELECT nama_env,value_env FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE nama_cabang='semua' and id_job=? GROUP BY nama_env";
  queryvalue = [id];
  await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
    onres.rows.forEach((data) => {
      console.log("ca", data);
      script_deploy += `\n` + `-e ${data.nama_env}=${data.value_env} \\\\`;
    });
  });

  script_deploy += `\n ${job_name}:latest
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

async function create_pipelinesinglescriptdocker(datajob) {
  const chekoutgit = chekout_git(datajob);
  const build = build_docker();
  const compress = compress_docker();
  const deploy = await deploy_docker(datajob);
  const data_cabang = await create_datacabang(datajob);
  console.log("dt cabang", data_cabang);
  let xmlData = "";

  xmlData = `${header}
     ${data_cabang}
      pipeline {
         agent any
          environment {
              def TOKEN_SECRET = credentials('193dd6e9-4d6d-4746-bb4b-723285acbf02') 
          }
    
        stages {
              ${chekoutgit}
              ${build}
              ${compress}
               ${deploy}
          }
        }
      }
      ${footer}
   `;

  return xmlData;
}

module.exports = {
  create_pipelinesinglescriptdocker: create_pipelinesinglescriptdocker,
};
