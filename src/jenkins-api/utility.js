const axios = require("axios").default;

var tabel = require("../../conn/tabel");
var querystr = "";
var queryvalue = "";

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

        querystr = `SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=?  `;
        queryvalue = [id, element.name];
        await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
          onres.rows.forEach((data) => {
            console.log("ca", data);
            scriptcabang += `${data.nama_variabel}: "${data.value_env}", \n`;
          });
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

        querystr = `SELECT * FROM job_env je JOIN data_env de ON je.id_env=de.id WHERE id_job=? and nama_cabang=?  `;
        queryvalue = [id, element.name];
        await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
          onres.rows.forEach((data) => {
            console.log("ca", data);
            scriptcabang += `${data.nama_variabel}: "${data.value_env}", \n`;
          });
        });

        scriptcabang += `],`;
      }
      scriptcabang += `]`;
    });
  }
  return scriptcabang;
}

function chekout_git(datajob) {
  const { branch, url_repo } = datajob;
  return `stage('Chekout git') {
        steps {
           git branch: '${branch}', 
           credentialsId: 'github-knitto', 
           url: '${url_repo}' 
        }
   }`;
}

module.exports = {
  create_datacabang: create_datacabang,
  chekout_git: chekout_git,
};
