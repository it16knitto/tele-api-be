// Membuat pipeline baru di Jenkins
const tabel = require("../../conn/tabel");
const { chekout_git } = require("./utility");
const header = `<?xml version='1.0' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <description></description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.92">
    <script><![CDATA[`;

const footer = ` ]]></script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>`;

async function create_datacabang(datacabang) {
  const { id, cabang, jenis_server, app_path } = datacabang;
  let scriptcabang = "def CABANG = [";

  if (cabang == "SEMUA") {
    querystr = "select * from cabang where tipe_cabang=? ";
    queryvalue = [jenis_server];
    await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
      for (let index = 0; index < onres.rows.length; index++) {
        const element = onres.rows[index];

        scriptcabang += `[
            name: "${element.name}",
            ip: "${element.ip_address}",
            credentialId: "${element.credentialid}", 
            appPath: "${app_path}",
            \n`;

        querystr = `SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=? and nama_env='DB_PORT_MYSQL'  `;
        queryvalue = [id, element.name];
        await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
          if (onres.rows.length > 0) {
            scriptcabang += `${onres.rows[0].nama_variabel}: "${onres.rows[0].value_env}", \n`;
          }
        });

        querystr = `SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=? and nama_env='DB_HOST_MYSQL'  `;
        queryvalue = [id, element.name];
        await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
          if (onres.rows.length > 0) {
            scriptcabang += `${onres.rows[0].nama_variabel}: "${onres.rows[0].value_env}", \n`;
          }
        });

        scriptcabang += `],`;
      }
      scriptcabang += `]`;
    });
  } else {
    querystr = "select * from cabang join job_cabang on cabang.id = job_cabang.id_cabang where id_job=? ";
    queryvalue = [id];
    await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
      for (let index = 0; index < onres.rows.length; index++) {
        const element = onres.rows[index];

        scriptcabang += `[
            name: "${element.name}",
            ip: "${element.ip_address}",
            credentialId: "${element.credentialid}", 
            appPath: "${app_path}",
            \n`;

        querystr = `SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=? and nama_env='DB_PORT_MYSQL'  `;
        queryvalue = [id, element.name];
        await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
          if (onres.rows.length > 0) {
            scriptcabang += `${data.nama_variabel}: "${data.value_env}", \n`;
          }
        });

        querystr = `SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=? and nama_env='DB_HOST_MYSQL'  `;
        queryvalue = [id, element.name];
        await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
          if (onres.rows.length > 0) {
            scriptcabang += `${data.nama_variabel}: "${data.value_env}", \n`;
          }
        });

        scriptcabang += `],`;
      }
      scriptcabang += `]`;
    });
  }
  return scriptcabang;
}

async function deploy_db(datajob) {
  const MYSQLUSERNAME = "${MYSQLUSERNAME}";
  const MYSQLPASSWORD = "${MYSQLPASSWORD}";
  const sqlFile = "${sqlFile}";
  const databaseHost = "${databaseHost}";
  const databasePort = "${databasePort}";
  const cabang = "${cabang.name}";

  let script_deploy = ` stage('Deploy Script sql') {
    steps {
                script {
                    for (cabang in CABANG) {
                    stage("${cabang} | execute mysql script") {
                            // Mendapatkan daftar file .sql dalam folder
                            def sqlFile = "excec-query.sql"
                            
                            def readSqlFile = readFile sqlFile
                            
                            def keywords = ["MODIFY COLUMN", "DROP TABLE","DROP DATABASE", "TRUNCATE"] 
                            
                            def foundKeyword = false
                            for (keyword in keywords) {
                                if (readSqlFile.contains(keyword)) {
                                    foundKeyword = true
                                    break
                                }
                            }
                            
                            if (foundKeyword) {
                                error("Script SQL yang tidak diperbolehkan ditemukan dalam file SQL. Jenkins pipeline dibatalkan.")
                            }
                            
                            // Menggunakan variable dengan benar dalam sh
                            def databaseHost = cabang.dbHost
                            def databasePort = cabang.dbPort
                            sh "mysql -h ${databaseHost} -P ${databasePort} -u ${MYSQLUSERNAME} -p${MYSQLPASSWORD} muliaabadi_baru < ${sqlFile}"
                           }
                        }
                    }
                  }
                       `;

  return script_deploy;
}

async function create_pipelinesinglesDB(datajob) {
  const chekoutgit = chekout_git(datajob);
  const deploy = await deploy_db(datajob);
  const data_cabang = await create_datacabang(datajob);

  let xmlData = "";

  xmlData = `${header}
     ${data_cabang}
      pipeline {
         agent any
           environment {
        MYSQLUSERNAME  = 'deployment' 
        MYSQLPASSWORD  = 'ka5vrSq5ATyGQxK4@'
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
  create_pipelinesinglesDB: create_pipelinesinglesDB,
};
