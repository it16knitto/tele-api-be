const axios = require("axios").default;
var response = require("../../res/res");
var tabel = require("../../conn/tabel");
var querystr = "";
var queryvalue = "";
const { create_pipelinesinglescriptdocker } = require("../jenkins-api/create_pipelinedocker");
const { create_pipelinescriptpm2 } = require("../jenkins-api/create_pipelinepm2");
const { create_pipelinesinglescriptartifact } = require("../jenkins-api/create_pipelineartifac");
const { create_pipelinesinglesDB } = require("../jenkins-api/create_pipelineDbMysql");

// Instance Axios dengan dukungan cookie
const jenkinsUrl = "http://192.168.20.12:8080"; // Ganti dengan URL Jenkins Anda
const apiToken = "1161bce0b3fda8c0c17b8808fb67b1df11"; // Ganti dengan API Token yang Anda dapatkan
const username = "it-knitto"; // Username Anda

exports.createPipeline = async function (req, res) {
  try {
    const tipe_deploy = req.body.tipe_deploy;
    const id_job = req.body.id_job;
    let script;
    let pipelinename = "";

    querystr = "select * from job where id=? ";
    queryvalue = [id_job];
    let datajob;
    await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
      if (onres.rows.length == 0) {
        response.ok({ pesan: "job not found" }, 200, res);
      } else {
        datajob = onres.rows[0];

        if (tipe_deploy == "docker") {
          console.log("deploy docker");
          script = await create_pipelinesinglescriptdocker(datajob);
          pipelinename = datajob.name + "-docker";
        } else if (tipe_deploy == "pm2") {
          script = await create_pipelinescriptpm2(datajob);
          pipelinename = datajob.name + "-pm2";
        } else if (tipe_deploy == "artifact") {
          script = await create_pipelinesinglescriptartifact(datajob);
          pipelinename = datajob.name + "-artifact";
        } else if (tipe_deploy == "dbmysql") {
          script = await create_pipelinesinglesDB(datajob);
          pipelinename = datajob.name + "-Db-mysql";
        }
      }
    });

    console.log(script);
    await axios({
      method: "post",
      url: `${jenkinsUrl}/createItem?name=${pipelinename}&mode=Pipeline`,
      headers: {
        Authorization: `Basic ${Buffer.from(username + ":" + apiToken).toString("base64")}`,
        "Content-Type": "application/xml",
      },
      data: script,
    });

    response.ok({ pesan: "Pipeline created successfully" }, 200, res);
  } catch (error) {
    console.error("Error creating pipeline:", error.response && error.response.data);
    response.ok({ pesan: error.response && error.response.data }, 200, res);
  }
};

exports.createGroupJobPipeline = async function (req, res) {
  //try {
  const id_group_job = req.body.id_group_job;
  let script;
  let groupjob = "";
  querystr = ` SELECT nama_job,j.name,lj.stage_name FROM  
  list_job_group lj JOIN 
  job j ON lj.id_job=j.id 
  JOIN group_job gj ON gj.id=lj.id_group
  WHERE id_group=? `;
  queryvalue = [id_group_job];
  let datajob;
  let namajob = "";

  await tabel.queryDB(querystr, queryvalue).then(async (onres) => {
    if (onres.rows.length == 0) {
      response.ok({ pesan: "job not found" }, 200, res);
    } else {
      datajob = onres.rows;
      namajob = onres.rows[0].nama_job;

      console.log("ini datajob", datajob);
      for (let index = 0; index < datajob.length; index++) {
        const element = datajob[index];
        groupjob += `stage('${element.stage_name}'){
                        steps {
                           build job : '${element.name}'
                        }
                    } 
          `;
      }
    }
  });

  console.log("ini group job", groupjob);

  script = `${header}
      pipeline {
         agent any
         stages {
              ${groupjob}
          }
        }
      
      ${footer}
   `;

  await axios({
    method: "post",
    url: `${jenkinsUrl}/createItem?name=${namajob}&mode=Pipeline`,
    headers: {
      Authorization: `Basic ${Buffer.from(username + ":" + apiToken).toString("base64")}`,
      "Content-Type": "application/xml",
    },
    data: script,
  });
  console.log(script);
  response.ok({ pesan: "Pipeline created successfully" }, 200, res);

  // } catch (error) {
  //   console.error("Error creating pipeline:", error.response && error.response.data);
  //   response.ok({ pesan: error.response && error.response.data }, 200, res);
  // }
};

exports.get_job = async function (req, res) {
  //try {

  const response_fetch = await axios({
    method: "get",
    url: `${jenkinsUrl}/api/json`,
    headers: {
      Authorization: `Basic ${Buffer.from(username + ":" + apiToken).toString("base64")}`,
      "Content-Type": "application/xml",
    },
  });

  const jobs = response_fetch.data.jobs;
  console.log(jobs);

  response.ok({ pesan: "Sukses", data: jobs }, 200, res);

  // } catch (error) {
  //   console.error("Error creating pipeline:", error.response && error.response.data);
  //   response.ok({ pesan: error.response && error.response.data }, 200, res);
  // }
};
