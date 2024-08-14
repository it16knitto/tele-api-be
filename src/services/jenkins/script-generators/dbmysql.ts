import {
	checkoutGit,
	createDataCabang,
	declarativePostActions
} from './utility';

export async function deployDb(branch: string) {
	const MYSQLUSERNAME = '${MYSQLUSERNAME}';
	const MYSQLPASSWORD = '${MYSQLPASSWORD}';
	const sqlFile = '${sqlFile}';
	const databaseHost = '${databaseHost}';
	const databasePort = '${databasePort}';
	const cabang = '${cabang.name}';

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
                              sh "mysql -h ${databaseHost} -P ${databasePort} -u ${MYSQLUSERNAME} -p${MYSQLPASSWORD} -e \\"INSERT INTO data_branch_db VALUES(null,'${branch}',now(),0);\\" muliaabadi_baru"
                             }
                          }
                      }
                    }
                         `;

	return script_deploy;
}
export async function createPipelineSinglesDB(datajob: Entity.Job) {
	const checkoutGitScript = checkoutGit(datajob.branch, datajob.url_repo);
	const deploy = await deployDb(datajob.branch);
	const declarativePostActionsScript = declarativePostActions();
	const data_cabang = await createDataCabang(
		datajob.id,
		datajob.cabang,
		datajob.jenis_server,
		datajob.app_path
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
        MYSQLUSERNAME  = 'deployment' 
        MYSQLPASSWORD  = 'ka5vrSq5ATyGQxK4@'
        }
    
        stages {
              ${checkoutGitScript}
              ${deploy}
          }
        }
          ${declarativePostActionsScript}
      }
   `;
	return script;
}
